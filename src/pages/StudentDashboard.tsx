import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Construction, Loader2 } from "lucide-react";

// Componentes UI
import { GamifiedStatusBar } from "@/components/gamification/GamifiedStatusBar";
import { LearningPath } from "@/components/gamification/LearningPath";
import { RankingTab } from "@/components/gamification/RankingTab";
import { MobileBottomNav } from "@/components/gamification/MobileBottomNav";
import { GroupInteraction } from "../components/student/GroupInteraction";
import StudentDinoGif from "@/components/student/StudentDinoGif";
import StudentProgressProfile from "@/components/student/StudentProgressProfile";
import { QuizModal } from "@/components/student/QuizModal";

// Hook
import { useStudentDashboard } from "@/hooks/studentDashboard/useStudentDashboard";

const studentTabs = ["path", "ranking", "interaction", "profile"] as const;

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
  const didCheckRef = useRef(false);

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
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab === "path"
              ? "El Camino"
              : tab === "ranking"
                ? "Ranking"
                : tab === "interaction"
                  ? "Interacción"
                  : "Mi Perfil"}
          </button>
        ))}
      </div>

      <main className="min-h-[calc(100vh-8rem)] pt-1 lg:pt-[88px]">
        {renderContent()}
      </main>

      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

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