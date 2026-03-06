import { useState, useEffect, useCallback } from "react";
import { usePersistenciaLeccion } from "./usePersistenciaLeccion";
import type { QuizQuestion } from "@/components/student/QuizModal";
import type { ResultadoEvaluacionDTO, FeedbackPreguntaDTO } from "@/types/api.types";

export interface QuizResultItem {
  questionId: string;
  selectedAnswerIndex: number;
  question: QuizQuestion;
  feedback: FeedbackPreguntaDTO | null;
}

export const useQuizLogic = (
  isOpen: boolean,
  questions: QuizQuestion[],
  timePerQuestion: number,
  onComplete: (answers: Record<string, number>) => Promise<ResultadoEvaluacionDTO | null>,
  lessonId?: number,
  _userId?: number,
) => {
  const {
    estadoLeccion,
    setEstadoLeccion,
    obtenerSegundosRestantes,
    limpiarProgreso,
    esReanudacion,
    setEsReanudacion,
  } = usePersistenciaLeccion(lessonId ?? null, timePerQuestion / 60);

  const [timeLeft, setTimeLeft] = useState(() => obtenerSegundosRestantes());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showingResults, setShowingResults] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEvaluacionDTO | null>(null);
  const [resultItems, setResultItems] = useState<QuizResultItem[]>([]);
  const clearSession = useCallback(() => {
    localStorage.removeItem("lesson_session");
    localStorage.removeItem("lesson_active");
    localStorage.removeItem("lesson_attemptId");
    localStorage.removeItem("lesson_endTs");
    localStorage.removeItem("lesson_finished");
    localStorage.removeItem("lesson_progress");
    localStorage.removeItem("lesson_lessonId");
    localStorage.setItem("resume_prompt_open", "0");
    localStorage.setItem("resume_prompt_consumed", "1");
    setEsReanudacion(false);
  }, [setEsReanudacion]);
  const loading = !estadoLeccion;
  const totalQuestions = questions.length;
  const placeholderQuestion = questions[0] ?? { id: "", text: "", options: [], alternativaIds: [] };
  const currentQuestion = estadoLeccion
    ? questions[estadoLeccion.indicePreguntaActual] ?? placeholderQuestion
    : placeholderQuestion;

  // No forzamos saltos: el índice guardado en caché dicta la posición

  const buildFinalAnswers = useCallback(() => {
    if (!estadoLeccion) return {} as Record<string, number>;

    const answers = { ...estadoLeccion.respuestas } as Record<string, number>;
    const question = questions[estadoLeccion.indicePreguntaActual];

    if (question && estadoLeccion.selectedAnswer !== null) {
      answers[question.id] = estadoLeccion.selectedAnswer;
    }

    return answers;
  }, [estadoLeccion, questions]);

  const submitQuiz = useCallback(async (finalAnswersAccumulator: Record<string, number>) => {
    setIsSubmitting(true);
    try {
      const result = await onComplete(finalAnswersAccumulator);
      setResultado(result);

      const items: QuizResultItem[] = questions.map((q) => ({
        questionId: q.id,
        selectedAnswerIndex: finalAnswersAccumulator[q.id] ?? -1,
        question: q,
        feedback: result?.feedback?.find((f) => String(f.idPregunta) === q.id) ?? null,
      }));

      setResultItems(items);
      setShowingResults(true);
      localStorage.setItem("lesson_finished", "1");
      localStorage.setItem("lesson_active", "0");
      setEsReanudacion(false);
      limpiarProgreso();
      clearSession();
    } catch (error) {
      console.error("Error al enviar quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [clearSession, onComplete, questions, limpiarProgreso]);

  const submitQuizWithCurrentAnswers = useCallback(() => {
    if (showingResults || isSubmitting) return;
    const finalAnswers = buildFinalAnswers();
    submitQuiz(finalAnswers);
  }, [buildFinalAnswers, isSubmitting, showingResults, submitQuiz]);

  // Si venimos desde Camino con orden de envío forzado (no continuar)
  useEffect(() => {
    if (!estadoLeccion) return;
    const forceLessonId = sessionStorage.getItem("lesson_force_submit");
    if (forceLessonId && String(forceLessonId) === String(lessonId)) {
      sessionStorage.removeItem("lesson_force_submit");
      setEsReanudacion(false);
      submitQuizWithCurrentAnswers();
    }
  }, [estadoLeccion, lessonId, submitQuizWithCurrentAnswers, setEsReanudacion]);

  // Si se indicó continuar desde Camino, saltar modal interno
  useEffect(() => {
    if (!lessonId) return;
    const skipId = sessionStorage.getItem("lesson_skip_resume");
    if (skipId && String(skipId) === String(lessonId)) {
      sessionStorage.removeItem("lesson_skip_resume");
      setEsReanudacion(false);
    }
  }, [lessonId, setEsReanudacion]);

  // Control estricto del cronómetro: autoenvío si el tiempo ya expiró
  useEffect(() => {
    if (!isOpen || showingResults || isSubmitting || !estadoLeccion) return;

    const remaining = obtenerSegundosRestantes();
    setTimeLeft(remaining);

    if (remaining <= 0) {
      submitQuizWithCurrentAnswers();
      return;
    }

    const timer = setInterval(() => {
      const segundos = obtenerSegundosRestantes();
      setTimeLeft(segundos);

      if (segundos <= 0) {
        clearInterval(timer);
        submitQuizWithCurrentAnswers();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSubmitting, showingResults, obtenerSegundosRestantes, submitQuizWithCurrentAnswers]);

  // Persist session metadata frequently (every 2s) to detect reloads/gaps en Camino
  useEffect(() => {
    if (!estadoLeccion || !lessonId || showingResults) return;

    const writeSession = () => {
      const now = Date.now();
      const payload = {
        lesson_active: 1,
        lesson_attemptId: estadoLeccion.attemptId,
        lesson_endTs: estadoLeccion.tiempoFin,
        lesson_finished: 0,
        lesson_progress: 1, // sesión válida desde que corre el tiempo
        lessonId,
        currentQuestionIndex: estadoLeccion.indicePreguntaActual,
        answers: estadoLeccion.respuestas,
        lastSeenAt: now,
        lesson_lastSeenAt: now,
        inProgress: true,
      };
      localStorage.setItem("lesson_session", JSON.stringify(payload));
      // Claves planas para detección inmediata en Camino/Ranking/Perfil
      localStorage.setItem("lesson_active", "1");
      localStorage.setItem("lesson_attemptId", estadoLeccion.attemptId);
      localStorage.setItem("lesson_endTs", String(estadoLeccion.tiempoFin));
      localStorage.setItem("lesson_finished", "0");
      localStorage.setItem("lesson_progress", "1");
      localStorage.setItem("lesson_lessonId", String(lessonId));
    };

    writeSession();
    const interval = window.setInterval(writeSession, 2000);
    return () => window.clearInterval(interval);
  }, [estadoLeccion, lessonId, showingResults]);

  // Persist inmediatamente al montar el intento (primer render con attemptId/endTs)
  useEffect(() => {
    if (!estadoLeccion || !lessonId || showingResults) return;
    if (!estadoLeccion.attemptId || !estadoLeccion.tiempoFin) return;
    const now = Date.now();
    const payload = {
      lesson_active: 1,
      lesson_attemptId: estadoLeccion.attemptId,
      lesson_endTs: estadoLeccion.tiempoFin,
      lesson_finished: 0,
      lesson_progress: 1,
      lessonId,
      currentQuestionIndex: estadoLeccion.indicePreguntaActual,
      answers: estadoLeccion.respuestas,
      lastSeenAt: now,
      lesson_lastSeenAt: now,
      inProgress: true,
    };
    localStorage.setItem("lesson_session", JSON.stringify(payload));
    localStorage.setItem("lesson_active", "1");
    localStorage.setItem("lesson_attemptId", estadoLeccion.attemptId);
    localStorage.setItem("lesson_endTs", String(estadoLeccion.tiempoFin));
    localStorage.setItem("lesson_finished", "0");
    localStorage.setItem("lesson_progress", "1");
    localStorage.setItem("lesson_lessonId", String(lessonId));
  }, [estadoLeccion?.attemptId, estadoLeccion?.tiempoFin, lessonId, showingResults]);

  const setSelectedAnswer = useCallback((answer: number | null) => {
    setEstadoLeccion((prev) => {
      if (!prev) return prev;
      return { ...prev, selectedAnswer: answer };
    });
  }, [setEstadoLeccion]);

  const handleNextQuestion = useCallback(() => {
    if (!estadoLeccion) return;

    const updatedAnswers = buildFinalAnswers();
    const isLastQuestion = estadoLeccion.indicePreguntaActual >= totalQuestions - 1;

    if (isLastQuestion) {
      submitQuiz(updatedAnswers);
      setEstadoLeccion((prev) => ({ ...prev, respuestas: updatedAnswers }));
      return;
    }

    const nextIndex = Math.min(estadoLeccion.indicePreguntaActual + 1, totalQuestions - 1);

    setEstadoLeccion((prev) => ({
      ...prev,
      respuestas: updatedAnswers,
      indicePreguntaActual: nextIndex,
      selectedAnswer: updatedAnswers[questions[nextIndex]?.id] ?? null,
    }));
  }, [buildFinalAnswers, estadoLeccion, questions, setEstadoLeccion, submitQuiz, totalQuestions]);

  const handleResumeContinue = useCallback(() => {
    setEsReanudacion(false);
  }, [setEsReanudacion]);

  const handleResumeFinish = useCallback(() => {
    setEsReanudacion(false);
    submitQuizWithCurrentAnswers();
  }, [setEsReanudacion, submitQuizWithCurrentAnswers]);

  const resetQuiz = useCallback(() => {
    setEstadoLeccion({
      indicePreguntaActual: 0,
      respuestas: {},
      selectedAnswer: null,
      tiempoFin: Date.now() + timePerQuestion * 1000,
      attemptId: `attempt-${Date.now()}`,
      enCurso: true,
    });
    setTimeLeft(timePerQuestion);
    setIsSubmitting(false);
    setShowingResults(false);
    setResultado(null);
    setResultItems([]);
    setEsReanudacion(false);
    limpiarProgreso();
    clearSession();
  }, [setEstadoLeccion, timePerQuestion, limpiarProgreso, clearSession, setEsReanudacion]);

  return {
    state: {
      currentQuestionIndex: estadoLeccion?.indicePreguntaActual ?? 0,
      selectedAnswer: estadoLeccion?.selectedAnswer ?? null,
      timeLeft,
      isSubmitting,
      showingResults,
      resultado,
      resultItems,
      currentQuestion,
      totalQuestions,
      loading,
      esReanudacion,
    },
    actions: {
      setSelectedAnswer,
      handleNextQuestion,
      resetQuiz,
      handleResumeContinue,
      handleResumeFinish,
    }
  };
};