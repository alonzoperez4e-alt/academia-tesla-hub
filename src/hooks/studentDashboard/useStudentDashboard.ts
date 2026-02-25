import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { estudianteService } from "@/services/estudianteService";
import { statsService } from "@/services/statsService";
import { rankingService } from "@/services/rankingService";
import { mapSemanasToWeeks, mapCuestionarioToQuizQuestions, mapTrend } from "@/utils/studentDashboard/gamificationUtils";
import type { Curso, CaminoCursoDTO, EstadisticasAlumnoDTO, RankingItemDTO, ResultadoEvaluacionDTO, EstadoMascota } from "@/types/api.types";
import type { QuizQuestion } from "@/components/student/QuizModal";

export const useStudentDashboard = (user: any, activeTab: string) => {
  // Estados de datos
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [caminoPorCurso, setCaminoPorCurso] = useState<Record<number, CaminoCursoDTO>>({});
  const [studentStats, setStudentStats] = useState<EstadisticasAlumnoDTO | null>(null);
  const [rankingData, setRankingData] = useState<RankingItemDTO[]>([]);
  
  // Estados de carga
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);
  const [isLoadingCamino, setIsLoadingCamino] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);

  // Estados del Quiz
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{ idLeccion: number; title: string; questions: QuizQuestion[] } | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const rankingLoaded = useRef(false);

  // 1. Cargar datos iniciales independientes (Cursos, Stats, Ranking)
  useEffect(() => {
    if (!user?.id) return;

    const fetchInitialData = async () => {
      // Cursos
      setIsLoadingCursos(true);
      try {
        const resumenes = await estudianteService.obtenerCursos();
        setCursos(resumenes);
        const primerHabilitado = resumenes.find((c) => c.isHabilitado);
        if (primerHabilitado) setSelectedCursoId(primerHabilitado.idCurso);
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los cursos.", variant: "destructive" });
      } finally {
        setIsLoadingCursos(false);
      }

      // Stats
      setIsLoadingStats(true);
      try {
        const stats = await statsService.getStudentStats(user.id);
        setStudentStats(stats);
      } catch (error) {
        toast({ title: "Error", description: "Error al cargar estadísticas.", variant: "destructive" });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchInitialData();
  }, [user?.id]);

  // 2. Cargar Camino cuando cambia el curso seleccionado
  // DESPUÉS — guarda con guard
useEffect(() => {
  if (!selectedCursoId || !user) return;
  if (caminoPorCurso[selectedCursoId]) return; // ← ya está en caché, no pedir de nuevo

  const cargarCamino = async () => {
    setIsLoadingCamino(true);
    try {
      const data = await estudianteService.obtenerCaminoCurso(selectedCursoId, user.id);
      setCaminoPorCurso(prev => ({ ...prev, [selectedCursoId]: data }));
    } finally {
      setIsLoadingCamino(false);
    }
  };
  cargarCamino();
}, [selectedCursoId, user]); // caminoPorCurso excluido intencionalmente del dep array

  // Cargar ranking SOLO cuando el usuario visite la pestaña (lazy loading)
  useEffect(() => {
    if (activeTab !== "ranking" || !user?.id || rankingLoaded.current) return;

    const cargarRanking = async () => {
      setIsLoadingRanking(true);
      try {
        const ranking = await rankingService.obtenerRanking(user.id);
        setRankingData(ranking);
        rankingLoaded.current = true;
      } catch {
        toast({ title: "Error", description: "Error al cargar ranking.", variant: "destructive" });
      } finally {
        setIsLoadingRanking(false);
      }
    };
    cargarRanking();
  }, [activeTab, user?.id]);

  // 3. Acciones (Handlers)
  const openQuiz = useCallback(async (nodeId: string) => {
    const idLeccion = parseInt(nodeId, 10);
    if (isNaN(idLeccion)) return;

    setIsLoadingQuiz(true);
    try {
      const cuestionario = await estudianteService.obtenerContenidoLeccion(idLeccion);

      // Pre-cargar imágenes para que al momento de renderizar no tarden en mostrarse
      cuestionario.preguntas?.forEach((p) => {
        if (p.preguntaImagenUrl) {
          const img = new Image();
          img.src = p.preguntaImagenUrl;
        }
      });
      setCurrentQuiz({
        idLeccion,
        title: cuestionario.nombreLeccion,
        questions: mapCuestionarioToQuizQuestions(cuestionario),
      });
      setIsQuizOpen(true);
    } catch (error) {
      toast({ title: "Lección no disponible", description: "No se pudo cargar el contenido.", variant: "destructive" });
    } finally {
      setIsLoadingQuiz(false);
    }
  }, []);

  const closeQuiz = () => {
    setIsQuizOpen(false);
    setCurrentQuiz(null);
  };

  const submitQuizAnswers = useCallback(async (selectedAnswers: Record<string, number>): Promise<ResultadoEvaluacionDTO | null> => {
    if (!currentQuiz || !user?.id) return null;

    try {
      const respuestas = currentQuiz.questions.map((q) => ({
        idPregunta: parseInt(q.id, 10),
        idAlternativaSeleccionada: q.alternativaIds[selectedAnswers[q.id] ?? 0] ?? 0,
      }));

      const resultado = await estudianteService.finalizarLeccion(currentQuiz.idLeccion, user.id, respuestas);

      // Pre-cargar imágenes de las soluciones para que la vista de feedback sea rápida
      resultado.feedback?.forEach((f) => {
        if (f.solucionImagenUrl) {
          const img = new Image();
          img.src = f.solucionImagenUrl;
        }
      });

      // Recargar datos para actualizar la UI
      const newStats = await statsService.getStudentStats(user.id);
      setStudentStats(newStats);
      rankingLoaded.current = false; // se recargará cuando el usuario abra la pestaña

      if (selectedCursoId) {
        const caminoActualizado = await estudianteService.obtenerCaminoCurso(selectedCursoId, user.id);
        setCaminoPorCurso(prev => ({ ...prev, [selectedCursoId]: caminoActualizado }));
      }

      toast({
        title: resultado.leccionAprobada ? "¡Lección aprobada!" : "Quiz completado",
        description: `Puntaje: ${resultado.puntajeObtenido} | EXP: +${resultado.expGanada}`,
      });

      return resultado;
    } catch (error) {
      toast({ title: "Error", description: "Hubo un problema al enviar tus respuestas.", variant: "destructive" });
      return null;
    }
  }, [currentQuiz, user, selectedCursoId, rankingData]);

  // 4. Datos Derivados (Memoizados)
  const camino = selectedCursoId ? caminoPorCurso[selectedCursoId] ?? null : null;
  const weekSections = useMemo(() => camino ? mapSemanasToWeeks(camino.semanas) : [], [camino]);
  
  const progressMetrics = useMemo(() => {
    const totalLessons = weekSections.reduce((t, w) => t + w.lessons.length, 0);
    const completedLessons = weekSections.reduce((c, w) => c + w.lessons.filter((l) => l.isCompleted).length, 0);
    return {
      totalLessons,
      completedLessons,
      overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  }, [weekSections]);

  const rankingDerivedInfo = useMemo(() => {
    const mappedRankings = rankingData.map((item) => {
      const isCurrent = item.esUsuarioActual || (user?.id && item.idUsuario === user.id);
      const prev = item.rankingAnterior ?? (item.posicionActual + item.tendencia);
      return {
        position: item.posicionActual,
        name: item.nombreCompleto,
        exp: item.expTotal,
        expForRanking: item.expParaRanking ?? item.expTotal,
        isCurrentUser: isCurrent,
        trend: mapTrend(item.tendencia),
        previousPosition: prev,
      };
    });

    const currentUser = rankingData.find((item) => item.esUsuarioActual || (user?.id && item.idUsuario === user.id));
    const userPos = currentUser?.posicionActual ?? 0;
    const userPrev = currentUser ? (currentUser.rankingAnterior ?? currentUser.posicionActual + currentUser.tendencia) : userPos;
    
    return {
      rankings: mappedRankings,
      userPosition: userPos,
      userPreviousPosition: userPrev,
      totalStudents: rankingData.length,
      rawRankingData: rankingData,
      currentUser,
      userId: user?.id ?? null,
    };
  }, [rankingData, user?.id]);

  return {
    state: {
      cursos,
      selectedCursoId,
      camino,
      studentStats,
      weekSections,
      progressMetrics,
      rankingDerivedInfo,
      isQuizOpen,
      currentQuiz,
      loading: {
        cursos: isLoadingCursos,
        camino: isLoadingCamino,
        stats: isLoadingStats,
        ranking: isLoadingRanking,
        quiz: isLoadingQuiz
      }
    },
    actions: {
      setSelectedCursoId,
      openQuiz,
      closeQuiz,
      submitQuizAnswers
    }
  };
};