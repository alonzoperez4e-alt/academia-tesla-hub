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
  } = usePersistenciaLeccion(lessonId ?? null, timePerQuestion / 60);

  const [timeLeft, setTimeLeft] = useState(() => obtenerSegundosRestantes());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showingResults, setShowingResults] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEvaluacionDTO | null>(null);
  const [resultItems, setResultItems] = useState<QuizResultItem[]>([]);
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
      limpiarProgreso();
    } catch (error) {
      console.error("Error al enviar quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onComplete, questions, limpiarProgreso]);

  const submitQuizWithCurrentAnswers = useCallback(() => {
    if (showingResults || isSubmitting) return;
    const finalAnswers = buildFinalAnswers();
    submitQuiz(finalAnswers);
  }, [buildFinalAnswers, isSubmitting, showingResults, submitQuiz]);

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
    /* no-op after rollback */
  }, []);

  const handleResumeFinish = useCallback(() => {
    /* no-op after rollback */
  }, []);

  const resetQuiz = useCallback(() => {
    setEstadoLeccion({
      indicePreguntaActual: 0,
      respuestas: {},
      selectedAnswer: null,
      tiempoFin: Date.now() + timePerQuestion * 1000,
    });
    setTimeLeft(timePerQuestion);
    setIsSubmitting(false);
    setShowingResults(false);
    setResultado(null);
    setResultItems([]);
    limpiarProgreso();
  }, [setEstadoLeccion, timePerQuestion, limpiarProgreso]);

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