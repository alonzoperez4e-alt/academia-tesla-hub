import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Construction, Loader2 } from "lucide-react";

// Componentes UI
import { GamifiedStatusBar } from "@/components/gamification/GamifiedStatusBar";
import { LearningPath } from "@/components/gamification/LearningPath";
import { RankingTab } from "@/components/gamification/RankingTab";
import { MobileBottomNav } from "@/components/gamification/MobileBottomNav";
import StudentDinoGif from "@/components/student/StudentDinoGif";
import StudentProgressProfile from "@/components/student/StudentProgressProfile";
import { QuizModal } from "@/components/student/QuizModal";

// Hook
import { useStudentDashboard } from "@/hooks/studentDashboard/useStudentDashboard";

const studentTabs = ["path", "ranking", "profile", "notifications"] as const;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTabParam = searchParams.get("tab");
  const initialTab = studentTabs.includes(initialTabParam as any)
    ? (initialTabParam as (typeof studentTabs)[number])
    : "path";

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<typeof studentTabs[number]>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) navigate("/login");
    else setUser(JSON.parse(userData));
  }, [navigate]);

  const { state, actions } = useStudentDashboard(user, activeTab);

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

      case "notifications":
        return <BlockedScreen title="Próximamente" text="Esta sección estará disponible en las siguientes actualizaciones." />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
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
        {(["path", "ranking", "profile"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab === "path" ? "El Camino" : tab === "ranking" ? "Ranking" : "Mi Perfil"}
          </button>
        ))}
      </div>

      <main className="min-h-[calc(100vh-8rem)] pt-1 lg:pt-[88px]">
        {renderContent()}
      </main>

      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab as any} notificationCount={3} />

      {state.currentQuiz && (
        <QuizModal
          isOpen={state.isQuizOpen}
          onClose={actions.closeQuiz}
          lessonTitle={state.currentQuiz.title}
          questions={state.currentQuiz.questions}
          onComplete={actions.submitQuizAnswers}
          timePerQuestion={180}
        />
      )}
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