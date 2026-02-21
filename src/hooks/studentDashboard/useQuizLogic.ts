import { useState, useEffect, useCallback } from "react";
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
  onComplete: (answers: Record<string, number>) => Promise<ResultadoEvaluacionDTO | null>
) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showingResults, setShowingResults] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEvaluacionDTO | null>(null);
  const [resultItems, setResultItems] = useState<QuizResultItem[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // 1. Manejo seguro del temporizador (Blind decrement)
  useEffect(() => {
    if (!isOpen || showingResults || isSubmitting) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isOpen, showingResults, isSubmitting]);

  // 2. Reaccionar cuando el tiempo se agota (Evita el "Stale Closure")
  useEffect(() => {
    if (timeLeft === 0) {
      handleNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // 3. Resetear tiempo al cambiar de pregunta
  useEffect(() => {
    setTimeLeft(timePerQuestion);
  }, [currentQuestionIndex, timePerQuestion]);

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
    } catch (error) {
      console.error("Error al enviar quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onComplete, questions]);

  const handleNextQuestion = useCallback(() => {
    const updatedAnswers = { ...answers };
    if (selectedAnswer !== null && currentQuestion) {
      updatedAnswers[currentQuestion.id] = selectedAnswer;
    }
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      submitQuiz(updatedAnswers);
    }
  }, [selectedAnswer, currentQuestionIndex, totalQuestions, currentQuestion, answers, submitQuiz]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setTimeLeft(timePerQuestion);
    setIsSubmitting(false);
    setShowingResults(false);
    setResultado(null);
    setResultItems([]);
  };

  return {
    state: {
      currentQuestionIndex,
      selectedAnswer,
      timeLeft,
      isSubmitting,
      showingResults,
      resultado,
      resultItems,
      currentQuestion,
      totalQuestions
    },
    actions: {
      setSelectedAnswer,
      handleNextQuestion,
      resetQuiz
    }
  };
};