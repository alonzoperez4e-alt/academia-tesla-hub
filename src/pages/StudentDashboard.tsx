import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GamifiedStatusBar } from "@/components/gamification/GamifiedStatusBar";
import { LearningPath } from "@/components/gamification/LearningPath";
import { RankingTab } from "@/components/gamification/RankingTab";
import { MobileBottomNav } from "@/components/gamification/MobileBottomNav";
import StudentCharacter3D from "@/components/student/StudentCharacter3D";
import { DinoMascot } from "@/components/student/DinoMascot";
import type { DinoStage } from "@/components/student/DinoMascot";
import StudentProgressProfile from "@/components/student/StudentProgressProfile";
import { QuizModal } from "@/components/student/QuizModal";
import type { QuizQuestion } from "@/components/student/QuizModal";
import { Construction, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { estudianteService } from "@/services/estudianteService";
import { statsService } from "@/services/statsService";
import { rankingService } from "@/services/rankingService"; // ❶ NUEVO
import type {
  Curso,
  CaminoCursoDTO,
  SemanaDTO,
  CuestionarioDTO,
  RespuestaAlumnoDTO,
  ResultadoEvaluacionDTO,
  EstadisticasAlumnoDTO,
  EstadoMascota,
  RankingItemDTO, // ❶ NUEVO
} from "@/types/api.types";

// ─── Tipos internos ────────────────────────────────────────────────────
interface UserSession {
  id: number;
  code: string;
  name: string;
  role: string;
  area?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function mapSemanasToWeeks(semanas: SemanaDTO[]) {
  const sortedWeeks = [...semanas].sort((a, b) => a.nroSemana - b.nroSemana);

  return sortedWeeks.map((semana) => {
    const sortedLessons = [...semana.lecciones].sort((a, b) => a.orden - b.orden);

    return {
      week: semana.nroSemana,
      title: `Semana ${semana.nroSemana}`,
      isUnlocked: !semana.isBloqueada,
      lessons: sortedLessons.map((leccion, index) => {
        const allPreviousCompleted = sortedLessons
          .slice(0, index)
          .every((l) => l.completada);

        const isCurrent =
          !semana.isBloqueada && !leccion.completada && allPreviousCompleted;

        const isLocked =
          semana.isBloqueada ||
          (index > 0 && !sortedLessons[index - 1]?.completada && !leccion.completada);

        return {
          id: String(leccion.idLeccion),
          type: "leccion" as const,
          title: leccion.nombre,
          description: "",
          isCompleted: leccion.completada,
          isLocked,
          isCurrent,
          exp: leccion.puntajeObtenido,
          completionRate: leccion.completada ? 100 : 0,
        };
      }),
    };
  });
}

function mapCuestionarioToQuizQuestions(
  cuestionario: CuestionarioDTO
): QuizQuestion[] {
  return cuestionario.preguntas.map((pregunta) => ({
    id: String(pregunta.idPregunta),
    text: pregunta.textoPregunta,
    options: pregunta.alternativas.map((alt) => alt.texto),
    alternativaIds: pregunta.alternativas.map((alt) => alt.idAlternativa),
  }));
}

/** Convierte la tendencia numérica del backend a string para el componente */
function mapTrend(tendencia: number): "up" | "down" | "same" {
  if (tendencia > 0) return "up";
  if (tendencia < 0) return "down";
  return "same";
}

// ─── Componente principal ──────────────────────────────────────────────
const StudentDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<"path" | "ranking" | "profile" | "notifications">("path");
  const [searchQuery, setSearchQuery] = useState("");

  // Cursos
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);

  // Camino
  const [camino, setCamino] = useState<CaminoCursoDTO | null>(null);
  const [isLoadingCamino, setIsLoadingCamino] = useState(false);

  // Quiz
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{
    idLeccion: number;
    title: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Stats
  const [studentStats, setStudentStats] = useState<EstadisticasAlumnoDTO | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // ❸ Ranking (datos reales)
  const [rankingData, setRankingData] = useState<RankingItemDTO[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);

  const refreshStudentStats = useCallback(async (idUsuario: number) => {
    setIsLoadingStats(true);
    try {
      const data = await statsService.getStudentStats(idUsuario);
      setStudentStats(data);
      return data;
    } catch (error) {
      console.error("Error al cargar estadísticas del estudiante:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas del estudiante.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // ─── Auth ──────────────────────────────────────────────────────────
  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
  }, [navigate]);

  useEffect(() => {
    if (user?.id) {
      refreshStudentStats(user.id);
    }
  }, [user, refreshStudentStats]);

  // ─── Cargar ranking real ───────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const cargarRanking = async () => {
      setIsLoadingRanking(true);
      try {
        const data = await rankingService.obtenerRanking(user.id);
        setRankingData(data);
      } catch (error) {
        console.error("Error al cargar ranking:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el ranking.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRanking(false);
      }
    };

    cargarRanking();
  }, [user]);

  // ─── Cargar cursos ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const cargarCursos = async () => {
      setIsLoadingCursos(true);
      try {
        const data = await estudianteService.obtenerCursos();
        console.log("Cursos data received:", data);

        let cursosArray: Curso[] = [];
        if (Array.isArray(data)) {
          cursosArray = data;
        } else if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data)) {
          cursosArray = (data as any).data;
        } else {
          console.warn("Formato de cursos inesperado:", data);
          cursosArray = [];
        }

        setCursos(cursosArray);
        const primerHabilitado = cursosArray.find((c) => c.isHabilitado);
        if (primerHabilitado) setSelectedCursoId(primerHabilitado.idCurso);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        toast({ title: "Error", description: "No se pudieron cargar los cursos.", variant: "destructive" });
      } finally {
        setIsLoadingCursos(false);
      }
    };
    cargarCursos();
  }, [user]);

  // ─── Cargar camino ─────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCursoId || !user) return;
    const cargarCamino = async () => {
      setIsLoadingCamino(true);
      try {
        const data = await estudianteService.obtenerCaminoCurso(selectedCursoId, user.id);
        setCamino(data);
      } catch (error) {
        console.error("Error al cargar camino:", error);
        toast({ title: "Error", description: "No se pudo cargar el contenido del curso.", variant: "destructive" });
      } finally {
        setIsLoadingCamino(false);
      }
    };
    cargarCamino();
  }, [selectedCursoId, user]);

  // ─── Scroll to top ─────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // ─── Datos derivados ──────────────────────────────────────────────
  const totalExp = studentStats?.expTotal ?? 0;
  const currentStreak = studentStats?.rachaActual ?? 0;
  const petStateLabel = (studentStats?.estadoMascota ?? "Huevo") as EstadoMascota;

  const weekSections = useMemo(() => {
    if (!camino) return [];
    return mapSemanasToWeeks(camino.semanas);
  }, [camino]);

  const { totalLessons, completedLessons, overallProgress } = useMemo(() => {
    const total = weekSections.reduce((t, w) => t + w.lessons.length, 0);
    const completed = weekSections.reduce((c, w) => c + w.lessons.filter((l) => l.isCompleted).length, 0);
    return {
      totalLessons: total,
      completedLessons: completed,
      overallProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [weekSections]);

  const dinoStage: DinoStage = useMemo(() => {
    const stageMap: Record<EstadoMascota, DinoStage> = {
      Huevo: "egg",
      "Agrietándose": "cracking",
      Naciendo: "hatching",
      "Completamente Crecido": "grown",
    };
    return stageMap[petStateLabel] ?? "egg";
  }, [petStateLabel]);

  const dinosaurProgress = useMemo(() => {
    const cappedExp = Math.min(Math.max(totalExp, 0), 3750);
    return Math.round((cappedExp / 3750) * 100);
  }, [totalExp]);

  const currentWeek = useMemo(() => {
    return weekSections.find((w) => w.lessons.some((l) => l.isCurrent))?.week ?? 1;
  }, [weekSections]);

  // ─── Ranking derivado (datos reales) ───────────────────────────────
  const { rankings, userPosition, userPreviousPosition, totalStudents } = useMemo(() => {
    if (rankingData.length === 0) {
      return { rankings: [], userPosition: 0, userPreviousPosition: 0, totalStudents: 0 };
    }

    const mappedRankings = rankingData.map((item) => ({
      position: item.posicionActual,
      name: item.nombreCompleto,
      exp: item.expTotal,
      isCurrentUser: item.esUsuarioActual,
      trend: mapTrend(item.tendencia),
      // Reconstruir posición anterior: tendencia = rankAnt - posActual → rankAnt = posActual + tendencia
      previousPosition: item.posicionActual + item.tendencia,
    }));

    const currentUser = rankingData.find((item) => item.esUsuarioActual);
    const userPos = currentUser?.posicionActual ?? 0;
    const userPrevPos = currentUser
      ? currentUser.posicionActual + currentUser.tendencia
      : userPos;

    return {
      rankings: mappedRankings,
      userPosition: userPos,
      userPreviousPosition: userPrevPos,
      totalStudents: rankingData.length,
    };
  }, [rankingData]);

  const filteredWeeks = useMemo(() => {
    if (!searchQuery.trim()) return weekSections;
    return weekSections
      .map((w) => ({
        ...w,
        lessons: w.lessons.filter((l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((w) => w.lessons.length > 0);
  }, [searchQuery, weekSections]);

  const selectedCurso = cursos.find((c) => c.idCurso === selectedCursoId);
  const isCourseEnabled = selectedCurso?.isHabilitado ?? false;

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleNodeClick = useCallback(async (nodeId: string, _weekNumber: number) => {
    const idLeccion = parseInt(nodeId, 10);
    if (isNaN(idLeccion)) return;

    setIsLoadingQuiz(true);
    try {
      const cuestionario = await estudianteService.obtenerContenidoLeccion(idLeccion);
      setCurrentQuiz({
        idLeccion,
        title: cuestionario.nombreLeccion,
        questions: mapCuestionarioToQuizQuestions(cuestionario),
      });
      setIsQuizOpen(true);
    } catch (error) {
      console.error("Error al cargar lección:", error);
      toast({ title: "Lección no disponible", description: "No se pudo cargar el contenido.", variant: "destructive" });
    } finally {
      setIsLoadingQuiz(false);
    }
  }, []);

  const handleQuizComplete = useCallback(
    async (selectedAnswers: Record<string, number>): Promise<ResultadoEvaluacionDTO | null> => {
      if (!currentQuiz || !user) return null;

      try {
        const respuestas: RespuestaAlumnoDTO[] = currentQuiz.questions.map((q) => {
          const selectedOptionIndex = selectedAnswers[q.id] ?? 0;
          const idAlternativa = q.alternativaIds[selectedOptionIndex] ?? 0;
          return {
            idPregunta: parseInt(q.id, 10),
            idAlternativaSeleccionada: idAlternativa,
          };
        });

        const resultado = await estudianteService.finalizarLeccion(
          currentQuiz.idLeccion,
          user.id,
          respuestas
        );

        await refreshStudentStats(user.id);

        // Recargar camino
        if (selectedCursoId) {
          const caminoActualizado = await estudianteService.obtenerCaminoCurso(selectedCursoId, user.id);
          setCamino(caminoActualizado);
        }

        // Recargar ranking después de completar una lección (la EXP cambió)
        try {
          const rankingActualizado = await rankingService.obtenerRanking(user.id);
          setRankingData(rankingActualizado);
        } catch {
          // No bloquear el flujo si falla el ranking
          console.warn("No se pudo actualizar el ranking después del quiz.");
        }

        toast({
          title: resultado.leccionAprobada ? "¡Lección aprobada!" : "Quiz completado",
          description: `Puntaje: ${resultado.puntajeObtenido} | EXP: +${resultado.expGanada}`,
        });

        return resultado;
      } catch (error) {
        console.error("Error al enviar respuestas:", error);
        toast({ title: "Error", description: "Hubo un problema al enviar tus respuestas.", variant: "destructive" });
        return null;
      }
    },
    [currentQuiz, user, selectedCursoId, refreshStudentStats]
  );

  const handleCourseChange = useCallback(
    (cursoIdOrName: string) => {
      const curso = cursos.find(
        (c) => String(c.idCurso) === cursoIdOrName || c.nombre.toLowerCase() === cursoIdOrName.toLowerCase()
      );
      if (curso) setSelectedCursoId(curso.idCurso);
    },
    [cursos]
  );

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null;

  // ─── Render ───────────────────────────────────────────────────────
  const renderContent = () => {
    if (isLoadingCursos) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando cursos...</p>
        </div>
      );
    }

    if (!isCourseEnabled) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <Construction className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Curso Bloqueado</h2>
          <p className="text-muted-foreground max-w-md">
            Este curso será habilitado por el administrador próximamente.
          </p>
        </div>
      );
    }

    if (isLoadingCamino) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando contenido del curso...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "path":
        return (
          <div className="pb-24 lg:pb-8 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-4 py-6 w-full">
              <div className="text-center">
                <StudentCharacter3D progress={dinosaurProgress} size="md" showProgressText={true} />
                <div className="mt-2 text-sm font-medium text-muted-foreground">
                  Crecimiento del dinosaurio: {Math.round(dinosaurProgress)}% ({totalExp} EXP)
                </div>
              </div>

              <div className="w-full max-w-xl">
                <div className="bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
                  {isLoadingStats ? (
                    <div className="text-sm text-muted-foreground animate-pulse text-center">
                      Actualizando mascota...
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <DinoMascot stage={dinoStage} size="sm" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{petStateLabel}</p>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                          <span>🔥 Racha: {currentStreak}</span>
                          <span>✨ EXP: {totalExp}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoadingQuiz && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-card rounded-xl p-6 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Cargando lección...</p>
                </div>
              </div>
            )}

            <LearningPath weeks={filteredWeeks} currentWeek={currentWeek} onNodeClick={handleNodeClick} />
          </div>
        );

      // ❹ RANKING CON DATOS REALES
      case "ranking":
        return (
          <div className="pb-24 lg:pb-8">
            {isLoadingRanking ? (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Cargando ranking...</p>
              </div>
            ) : rankings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <Construction className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">Sin datos de ranking</h2>
                <p className="text-muted-foreground max-w-md">
                  Aún no hay suficientes datos para mostrar el ranking. ¡Completa lecciones para aparecer!
                </p>
              </div>
            ) : (
              <RankingTab
                rankings={rankings}
                userPosition={userPosition}
                userPreviousPosition={userPreviousPosition}
                totalStudents={totalStudents}
              />
            )}
          </div>
        );

      case "profile":
        return (
          <div className="pb-24 lg:pb-8 px-4">
            <StudentProgressProfile
              userName={user.name.split(" ")[0]}
              overallProgress={overallProgress}
              dinosaurProgress={dinosaurProgress}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
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
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <Construction className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Próximamente</h2>
            <p className="text-muted-foreground max-w-md">
              Esta sección estará disponible en las siguientes actualizaciones. ¡Mantente atento!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <GamifiedStatusBar
        userName={user.name}
        userCode={user.code}
        currentStreak={currentStreak}
        gems={totalExp}
        selectedCourse={selectedCurso?.nombre ?? ""}
        onCourseChange={handleCourseChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
      />

      <div className="hidden lg:flex items-center justify-center gap-2 py-4 bg-card/95 backdrop-blur-sm border-b border-border fixed top-[88px] left-0 right-0 z-40 shadow-sm">
        {([
          { id: "path" as const, label: "El Camino" },
          { id: "ranking" as const, label: "Ranking" },
          { id: "profile" as const, label: "Mi Perfil" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="min-h-[calc(100vh-8rem)] lg:pt-[156px]">
        {renderContent()}
      </main>

      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} notificationCount={3} />

      {currentQuiz && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => {
            setIsQuizOpen(false);
            setCurrentQuiz(null);
          }}
          lessonTitle={currentQuiz.title}
          questions={currentQuiz.questions}
          onComplete={handleQuizComplete}
          timePerQuestion={180}
        />
      )}
    </div>
  );
};

export default StudentDashboard;