import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Construction, Loader2 } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Componentes UI
import { GamifiedStatusBar } from "@/components/gamification/GamifiedStatusBar";
import { LearningPath } from "@/components/gamification/LearningPath";
import { RankingTab } from "@/components/gamification/RankingTab";
import { MobileBottomNav } from "@/components/gamification/MobileBottomNav";
import { GroupInteraction } from "../components/student/GroupInteraction";
import StudentDinoGif from "@/components/student/StudentDinoGif";
import StudentProgressProfile from "@/components/student/StudentProgressProfile";
import { QuizModal } from "@/components/student/QuizModal";
import { groupService } from "@/services/groupService";
import type { GroupChatMessage } from "@/types/api.types";

// Hook
import { useStudentDashboard } from "@/hooks/studentDashboard/useStudentDashboard";

const studentTabs = ["path", "ranking", "interaction", "profile"] as const;
const INTERACTION_LAST_SEEN_PREFIX = "student_interaction_last_seen";

const stripTrailingSlash = (value: string) => value.replace(/\/$/, "");

const resolveWsBaseUrl = () => {
  const envWs = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (envWs) return stripTrailingSlash(envWs);

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
  if (apiBase) {
    const cleaned = stripTrailingSlash(apiBase);
    const withoutApi = cleaned.replace(/\/api\/(v1)?$/i, "");
    return withoutApi || cleaned;
  }

  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:8080";
};

const getMessageTimestampMs = (message: GroupChatMessage) => {
  const raw = message.timestamp ?? message.updatedAt ?? message.createdAt;
  if (typeof raw === "number") return raw;
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getLatestMessageTimestampMs = (messages: GroupChatMessage[]) => {
  return messages.reduce((latest, message) => Math.max(latest, getMessageTimestampMs(message)), 0);
};

const getUnreadMessageCount = (messages: GroupChatMessage[], lastSeenTimestamp: number) => {
  if (!lastSeenTimestamp) return messages.length;
  return messages.reduce((count, message) => count + (getMessageTimestampMs(message) > lastSeenTimestamp ? 1 : 0), 0);
};

const getMessageKey = (message: GroupChatMessage) => {
  if (message.id !== undefined && message.id !== null) return `id:${String(message.id)}`;
  return `fallback:${message.studentId}:${getMessageTimestampMs(message)}:${message.content}`;
};

const formatUnreadCount = (count: number) => (count > 99 ? '99+' : String(count));

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTabParam = searchParams.get("tab");
  const initialTab = studentTabs.includes(initialTabParam as any)
    ? (initialTabParam as (typeof studentTabs)[number])
    : "path";

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<typeof studentTabs[number]>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [resumeLesson, setResumeLesson] = useState<any | null>(null);
  const [interactionUnreadCount, setInteractionUnreadCount] = useState(0);
  const didCheckRef = useRef(false);
  const interactionSocketRef = useRef<Client | null>(null);
  const interactionGroupIdRef = useRef<number | null>(null);
  const interactionLastSeenRef = useRef(0);
  const interactionLatestTimestampRef = useRef(0);
  const seenMessageKeysRef = useRef<Set<string>>(new Set());
  const activeTabRef = useRef(activeTab);

  const wsBaseUrl = useMemo(() => resolveWsBaseUrl(), []);

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) navigate("/login");
    else setUser(JSON.parse(userData));
  }, [navigate]);

  const { state, actions } = useStudentDashboard(user, activeTab);
  const isQuizOpenRef = useRef(false);
  useEffect(() => {
    isQuizOpenRef.current = state.isQuizOpen;
  }, [state.isQuizOpen]);

  // Persist tab in URL without causing toggle loops; also keep URL in sync when user switches tab.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    setSearchParams(params, { replace: true });
  }, [activeTab, setSearchParams]);

  // Sync tab when user navigates with back/forward buttons.
  useEffect(() => {
    const handlePopstate = () => {
      const tabFromUrl = new URLSearchParams(window.location.search).get("tab");
      if (tabFromUrl && studentTabs.includes(tabFromUrl as any)) {
        setActiveTab(tabFromUrl as (typeof studentTabs)[number]);
      }
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `${INTERACTION_LAST_SEEN_PREFIX}:${user.id}`;
    const storedValue = Number(localStorage.getItem(storageKey) || 0);
    interactionLastSeenRef.current = Number.isFinite(storedValue) && storedValue > 0 ? storedValue : 0;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const storageKey = `${INTERACTION_LAST_SEEN_PREFIX}:${user.id}`;
    let cancelled = false;
    const cleanupSocket = () => {
      interactionSocketRef.current?.deactivate();
      interactionSocketRef.current = null;
      interactionGroupIdRef.current = null;
    };

    const markAsRead = (latestTimestamp: number) => {
      if (latestTimestamp > interactionLastSeenRef.current) {
        interactionLastSeenRef.current = latestTimestamp;
        localStorage.setItem(storageKey, String(latestTimestamp));
      }
      setInteractionUnreadCount(0);
    };

    const syncInteractionUnread = async () => {
      try {
        const studentGroup = await groupService.getStudentGroup(user.id);
        if (cancelled) return;

        if (!studentGroup) {
          cleanupSocket();
          interactionLatestTimestampRef.current = 0;
          seenMessageKeysRef.current.clear();
          setInteractionUnreadCount(0);
          return;
        }

        const history = await groupService.getChatHistory(studentGroup.id);
        if (cancelled) return;

        const latestTimestamp = getLatestMessageTimestampMs(history ?? []);
        interactionLatestTimestampRef.current = latestTimestamp;
        const unreadCount = getUnreadMessageCount(history ?? [], interactionLastSeenRef.current);
        seenMessageKeysRef.current = new Set((history ?? []).slice(-400).map(getMessageKey));

        if (activeTabRef.current === "interaction") {
          markAsRead(latestTimestamp);
        } else {
          setInteractionUnreadCount(unreadCount);
        }

        if (!wsBaseUrl) return;

        const shouldReconnectSocket =
          interactionGroupIdRef.current !== studentGroup.id ||
          !interactionSocketRef.current ||
          !interactionSocketRef.current.connected;

        if (shouldReconnectSocket) {
          cleanupSocket();
          interactionGroupIdRef.current = studentGroup.id;

          const socket = new SockJS(`${wsBaseUrl}/ws-chat`);
          const client = new Client({
            webSocketFactory: () => socket as any,
            reconnectDelay: 5000,
            onConnect: () => {
              if (cancelled) return;
              client.subscribe(`/topic/group/${studentGroup.id}`, (frame) => {
                try {
                  const incoming = JSON.parse(frame.body) as GroupChatMessage;
                  const messageKey = getMessageKey(incoming);
                  if (seenMessageKeysRef.current.has(messageKey)) return;

                  seenMessageKeysRef.current.add(messageKey);
                  if (seenMessageKeysRef.current.size > 600) {
                    const first = seenMessageKeysRef.current.values().next().value;
                    if (first) seenMessageKeysRef.current.delete(first);
                  }

                  const incomingTimestamp = getMessageTimestampMs(incoming);
                  if (incomingTimestamp > interactionLatestTimestampRef.current) {
                    interactionLatestTimestampRef.current = incomingTimestamp;
                  }

                  if (activeTabRef.current === "interaction") {
                    markAsRead(interactionLatestTimestampRef.current);
                    return;
                  }

                  setInteractionUnreadCount((current) => Math.min(current + 1, 999));
                } catch {
                  // Ignorar mensajes inválidos para evitar conteos inflados.
                }
              });
            },
            onWebSocketClose: () => {
              if (cancelled) return;
              interactionSocketRef.current = null;
            },
            onStompError: () => {
              if (cancelled) return;
              interactionSocketRef.current = null;
            },
          });

          interactionSocketRef.current = client;
          client.activate();
        }
      } catch {
        if (!cancelled && activeTabRef.current !== "interaction") {
          setInteractionUnreadCount(0);
        }
      }
    };

    void syncInteractionUnread();
    const interval = window.setInterval(syncInteractionUnread, 60000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      cleanupSocket();
    };
  }, [user?.id, wsBaseUrl]);

  useEffect(() => {
    if (activeTab !== "interaction" || !user?.id) return;

    const storageKey = `${INTERACTION_LAST_SEEN_PREFIX}:${user.id}`;
    const latestTimestamp = interactionLatestTimestampRef.current;
    if (latestTimestamp > interactionLastSeenRef.current) {
      interactionLastSeenRef.current = latestTimestamp;
      localStorage.setItem(storageKey, String(latestTimestamp));
    }
    setInteractionUnreadCount(0);
  }, [activeTab, user?.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Mostrar modal solo cuando hay sesión activa en storage y SOLO en Camino
  useEffect(() => {
    const isLessonPath = (pathname: string) => /\/(leccion|evaluacion)/i.test(pathname);
    const isCaminoRoute = (pathname: string) => pathname.startsWith("/dashboard") && activeTab === "path";

    const shouldShowResumeModal = (pathname: string) => {
      if (!isCaminoRoute(pathname)) return false;
      const active = localStorage.getItem("lesson_active") === "1";
      const finished = localStorage.getItem("lesson_finished") === "1";
      const attemptId = localStorage.getItem("lesson_attemptId");
      const endTs = Number(localStorage.getItem("lesson_endTs") || 0);
      const inProgress = localStorage.getItem("lesson_progress") === "1";
      const consumed = localStorage.getItem("resume_prompt_consumed") === "1";

      if (finished) return false;
      if (!active || !attemptId || !inProgress) return false;
      if (endTs <= Date.now()) return false;
      if (consumed) return false;
      return true;
    };

    const checkResume = () => {
      const pathname = window.location.pathname;
      if (isLessonPath(pathname)) {
        setResumeLesson(null);
        localStorage.setItem("resume_prompt_open", "0");
        return;
      }
      if (!shouldShowResumeModal(pathname)) {
        setResumeLesson(null);
        return;
      }
      if (isQuizOpenRef.current) return;

      const raw = localStorage.getItem("lesson_session");
      const endTs = Number(localStorage.getItem("lesson_endTs") || 0);
      const lessonId = localStorage.getItem("lesson_lessonId");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setResumeLesson(parsed);
          localStorage.setItem("resume_prompt_open", "1");
          return;
        } catch (_) {
          /* ignore */
        }
      }
      if (endTs > 0 && lessonId) {
        setResumeLesson({ lesson_endTs: endTs, lessonId });
        localStorage.setItem("resume_prompt_open", "1");
      }
    };

    if (isCaminoRoute(window.location.pathname)) {
      localStorage.setItem("resume_prompt_consumed", "0");
    } else {
      setResumeLesson(null);
    }

    checkResume();

    if (didCheckRef.current) return; // evita doble registro en StrictMode
    didCheckRef.current = true;

    const onPageShow = () => checkResume();
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkResume();
    };
    const onFocus = () => checkResume();

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [state.isQuizOpen, location.pathname, activeTab]);

  const isLessonRoute = /\/(leccion|evaluacion)/i.test(location.pathname);
  useEffect(() => {
    if (isLessonRoute) {
      setResumeLesson(null);
      localStorage.setItem("resume_prompt_open", "0");
    }
  }, [isLessonRoute]);

  if (!user) return null;

  // Variables calculadas para la UI
  const mapExpToProgress = (exp: number) => {
    const clamped = Math.max(0, exp);
    if (clamped >= 3750) {
      const span = Math.min(clamped, 5000) - 3750;
      return Math.min(75 + (span / 1250) * 25, 100);
    }
    if (clamped >= 2500) {
      return 50 + ((clamped - 2500) / 1250) * 25;
    }
    if (clamped >= 1250) {
      return 25 + ((clamped - 1250) / 1250) * 25;
    }
    return (clamped / 1250) * 25;
  };

  const totalExp = state.studentStats?.expTotal ?? 0;
  const currentStreak = state.studentStats?.rachaActual ?? 0;
  const petStateLabel = state.studentStats?.estadoMascota ?? "Huevo";
  const dinosaurProgress = Math.round(mapExpToProgress(totalExp));

  const currentWeek = state.weekSections.find((w) => w.lessons.some((l) => l.isCurrent))?.week ?? 1;
  const filteredWeeks = searchQuery.trim() 
    ? state.weekSections.map(w => ({...w, lessons: w.lessons.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))})).filter(w => w.lessons.length > 0)
    : state.weekSections;

  const selectedCurso = state.cursos.find((c) => c.idCurso === state.selectedCursoId);
  const isCourseEnabled = selectedCurso?.isHabilitado ?? false;

  const handleCourseChange = (cursoIdOrName: string) => {
    const curso = state.cursos.find(c => String(c.idCurso) === cursoIdOrName || c.nombre.toLowerCase() === cursoIdOrName.toLowerCase());
    if (curso) actions.setSelectedCursoId(curso.idCurso);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const renderContent = () => {
    if (state.loading.cursos) return <LoadingScreen text="Cargando cursos..." />;
    if (!isCourseEnabled) return <BlockedScreen text="Este curso será habilitado por el administrador próximamente." />;
    if (state.loading.camino) return <LoadingScreen text="Cargando contenido del curso..." />;

    switch (activeTab) {
      case "path":
        return (
          <div className="pb-24 lg:pb-8 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-4 py-4 w-full">
              <div className="text-center">
                <StudentDinoGif exp={totalExp} progressPercent={dinosaurProgress} size="md" showProgressText={false} />
                <div className="mt-2 text-sm font-medium text-muted-foreground">
                  Crecimiento: {dinosaurProgress}% ({totalExp} EXP)
                </div>
              </div>
            </div>

            {state.loading.quiz && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-card rounded-xl p-6 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Cargando lección...</p>
                </div>
              </div>
            )}

            <LearningPath weeks={filteredWeeks} currentWeek={currentWeek} onNodeClick={actions.openQuiz} />
          </div>
        );

      case "ranking":
        if (state.loading.ranking) return <LoadingScreen text="Cargando ranking..." />;
        if (state.rankingDerivedInfo.rankings.length === 0) return <BlockedScreen text="Aún no hay suficientes datos para mostrar el ranking." title="Sin datos" />;
        return (
          <div className="pb-24 lg:pb-8">
            <RankingTab {...state.rankingDerivedInfo} />
          </div>
        );

      case "interaction":
        return (
          <div className="pb-24 lg:pb-8 px-4 mt-4 max-w-5xl mx-auto">
            <GroupInteraction studentId={user.id} studentName={user.name} />
          </div>
        );

      case "profile":
        return (
          <div className="pb-24 lg:pb-8 px-4 mt-4">
            <StudentProgressProfile
              userName={user.name.split(" ")[0]}
              overallProgress={state.progressMetrics.overallProgress}
              dinosaurProgress={dinosaurProgress}
              completedLessons={state.progressMetrics.completedLessons}
              totalLessons={state.progressMetrics.totalLessons}
              currentStreak={currentStreak}
              totalExp={totalExp}
              weeklyGoal={75}
              userCode={user.code}
              userArea={user.area}
              petState={petStateLabel}
            />
          </div>
        );

    }
  };

  return (
    <div className="min-h-screen bg-secondary bg-[#F3F4F6]">
      {resumeLesson && !isLessonRoute && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Sesión en curso</h3>
            <p className="text-gray-600 leading-relaxed">
              Detectamos que se recargó la página. ¿Deseas continuar donde te quedaste o finalizar ahora?
            </p>
            <div className="timeBadge">
              El tiempo sigue corriendo: {
                (() => {
                  const remaining = Math.max(0, Math.floor((resumeLesson.lesson_endTs - Date.now()) / 1000));
                  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
                  const ss = String(remaining % 60).padStart(2, "0");
                  return `${mm}:${ss}`;
                })()
              }
            </div>
            <div className="modalActions">
              <button
                className="btn btnPrimary"
                onClick={() => {
                  localStorage.setItem("resume_prompt_consumed", "1");
                  localStorage.setItem("resume_prompt_open", "0");
                  sessionStorage.setItem("lesson_skip_resume", String(resumeLesson.lessonId));
                  actions.openQuiz(String(resumeLesson.lessonId));
                  setResumeLesson(null);
                }}
              >
                Continuar
              </button>
              <button
                className="btn btnDanger"
                onClick={() => {
                  localStorage.setItem("resume_prompt_consumed", "1");
                  localStorage.removeItem("lesson_session");
                  localStorage.removeItem("lesson_active");
                  localStorage.removeItem("lesson_attemptId");
                  localStorage.removeItem("lesson_endTs");
                  localStorage.removeItem("lesson_finished");
                  localStorage.removeItem("lesson_progress");
                  localStorage.removeItem("lesson_lessonId");
                  localStorage.setItem("resume_prompt_open", "0");
                  sessionStorage.setItem("lesson_force_submit", String(resumeLesson.lessonId));
                  actions.openQuiz(String(resumeLesson.lessonId));
                  setResumeLesson(null);
                }}
              >
                Terminar y enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <GamifiedStatusBar
        userName={user.name}
        userCode={user.code}
        currentStreak={currentStreak}
        gems={totalExp}
        selectedCourse={String(selectedCurso?.idCurso ?? "")}
        availableCourses={state.cursos.map(c => ({
          id: String(c.idCurso),
          name: c.nombre,
          isEnabled: c.isHabilitado
        }))}
        onCourseChange={handleCourseChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
      />

      <div className="hidden lg:flex items-center justify-center gap-2 py-4 bg-card/95 backdrop-blur-sm border-b border-border fixed top-[88px] left-0 right-0 z-40 shadow-sm">
        {(["path", "ranking", "interaction", "profile"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span className="relative inline-flex items-center justify-center gap-2">
              {tab === "path"
                ? "El Camino"
                : tab === "ranking"
                  ? "Ranking"
                  : tab === "interaction"
                    ? "Interacción"
                    : "Mi Perfil"}
              {tab === "interaction" && activeTab !== "interaction" && interactionUnreadCount > 0 && (
                <span className="absolute -top-2 -right-4 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none flex items-center justify-center shadow-sm ring-2 ring-card pointer-events-none" aria-label="Mensajes sin leer">
                  {formatUnreadCount(interactionUnreadCount)}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <main className="min-h-[calc(100vh-8rem)] pt-1 lg:pt-[88px]">
        {renderContent()}
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        interactionUnreadCount={activeTab !== "interaction" ? interactionUnreadCount : 0}
      />

      {state.currentQuiz && (
        <QuizModal
          isOpen={state.isQuizOpen}
          onClose={actions.closeQuiz}
          lessonTitle={state.currentQuiz.title}
            lessonId={state.currentQuiz.idLeccion}
          questions={state.currentQuiz.questions}
          onComplete={actions.submitQuizAnswers}
          timePerQuestion={180}
            userId={user.id}
        />
      )}
      <style>{`
        .modalActions{
          display:flex;
          gap:12px;
          justify-content:center;
          margin-top:14px;
          flex-wrap:wrap;
        }
        .btn{
          border-radius:12px;
          padding:12px 18px;
          font-weight:600;
          font-size:14px;
          min-width:160px;
          border:1px solid transparent;
          cursor:pointer;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
          will-change: transform;
        }
        .btn:hover{
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }
        .btn:active{
          transform: translateY(0px) scale(0.99);
          box-shadow: 0 8px 16px rgba(0,0,0,0.10);
        }
        .btnPrimary{
          background:#0F3D66;
          color:#fff;
        }
        .btnPrimary:hover{
          background:#0D355A;
        }
        .btnDanger{
          background:#F3F4F6;
          color:#1F2937;
          border-color:#E5E7EB;
        }
        .btnDanger:hover{
          background:#EDEFF2;
          border-color:#D1D5DB;
        }
        .timeBadge{
          display:inline-block;
          margin-top:10px;
          padding:8px 12px;
          border-radius:999px;
          background:#FEF2F2;
          color:#B91C1C;
          font-weight:600;
          font-size:13px;
          border:1px solid #FECACA;
        }
        @media (prefers-reduced-motion: reduce) {
          .btn{ transition:none; }
          .btn:hover{ transform:none; box-shadow:none; }
        }
      `}</style>
    </div>
  );
};

// Componentes auxiliares para evitar repetición de código
const LoadingScreen = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
    <p className="text-muted-foreground">{text}</p>
  </div>
);

const BlockedScreen = ({ title = "Curso Bloqueado", text }: { title?: string, text: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
    <Construction className="w-16 h-16 text-muted-foreground mb-4" />
    <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground max-w-md">{text}</p>
  </div>
);

export default StudentDashboard;