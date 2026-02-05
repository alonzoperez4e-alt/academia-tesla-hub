import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ResultadoEvaluacionDTO, FeedbackPreguntaDTO } from "@/types/api.types";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  /** IDs reales de las alternativas del backend */
  alternativaIds: number[];
  // correctAnswer ya no se usa localmente; la corrección viene del backend
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  questions: QuizQuestion[];
  /**
   * Callback que recibe las respuestas seleccionadas (questionId → índice de opción).
   * El padre se encarga de enviarlas al backend y retornar el resultado.
   */
  onComplete: (selectedAnswers: Record<string, number>) => Promise<ResultadoEvaluacionDTO | null>;
  timePerQuestion?: number;
}

interface QuizResultItem {
  questionId: string;
  selectedAnswerIndex: number;
  question: QuizQuestion;
  feedback: FeedbackPreguntaDTO | null;
}

export const QuizModal = ({
  isOpen,
  onClose,
  lessonTitle,
  questions,
  onComplete,
  timePerQuestion = 180,
}: QuizModalProps) => {
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

  // Timer logic
  useEffect(() => {
    if (!isOpen || showingResults || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, currentQuestionIndex, showingResults, isSubmitting]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(timePerQuestion);
  }, [currentQuestionIndex, timePerQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (selectedAnswer !== null) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedAnswer,
      }));
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      submitQuiz();
    }
  }, [selectedAnswer, currentQuestionIndex, totalQuestions, currentQuestion]);

  const submitQuiz = async () => {
    const finalAnswers: Record<string, number> = {
      ...answers,
      ...(selectedAnswer !== null && currentQuestion
        ? { [currentQuestion.id]: selectedAnswer }
        : {}),
    };

    setIsSubmitting(true);

    try {
      // Delegar al padre: envía respuestas al backend y retorna ResultadoEvaluacionDTO
      const result = await onComplete(finalAnswers);
      setResultado(result);

      // Mapear feedback del backend a cada pregunta
      const items: QuizResultItem[] = questions.map((q) => {
        const fb = result?.feedback?.find(
          (f) => String(f.idPregunta) === q.id
        ) ?? null;

        return {
          questionId: q.id,
          selectedAnswerIndex: finalAnswers[q.id] ?? -1,
          question: q,
          feedback: fb,
        };
      });

      setResultItems(items);
      setShowingResults(true);
    } catch (error) {
      console.error("Error al enviar quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setTimeLeft(timePerQuestion);
    setIsSubmitting(false);
    setShowingResults(false);
    setResultado(null);
    setResultItems([]);
    onClose();
  };

  const getTimerColor = () => {
    if (timeLeft <= 30) return "text-destructive";
    if (timeLeft <= 60) return "text-orange-500";
    return "text-foreground";
  };

  /** Obtiene el texto de la alternativa correcta usando el feedback del backend */
  const getCorrectAnswerText = (item: QuizResultItem): string => {
    if (!item.feedback) return "—";
    const correctAltId = item.feedback.idAlternativaCorrecta;
    const correctIndex = item.question.alternativaIds.indexOf(correctAltId);
    if (correctIndex >= 0 && correctIndex < item.question.options.length) {
      return item.question.options[correctIndex];
    }
    return "—";
  };

  /** Verifica si la respuesta del alumno fue correcta */
  const isAnswerCorrect = (item: QuizResultItem): boolean => {
    return item.feedback?.correcta ?? false;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* ─── Submitting overlay ─── */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground font-medium">Enviando respuestas...</p>
          </div>
        )}

        {!showingResults ? (
          <>
            {/* Quiz Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{lessonTitle}</p>
                  <p className="text-xs text-primary font-medium">
                    Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                  </p>
                </div>
                <div className={cn("flex items-center gap-2 font-mono text-lg font-bold", getTimerColor())}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" />
            </div>

            {/* Question Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {currentQuestion.text}
                  </h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                          selectedAnswer === index
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border hover:border-primary/50 hover:bg-secondary/50"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                              selectedAnswer === index
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4">
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || isSubmitting}
                className="w-full btn-tesla-accent"
              >
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <>
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Finalizar Quiz"
                )}
              </Button>
            </div>
          </>
        ) : (
          /* ─── Results View (feedback del backend) ─── */
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl">Resultados del Quiz</DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* Score Summary */}
              <div className="text-center p-6 bg-secondary rounded-2xl">
                <div className="text-5xl font-bold text-primary mb-2">
                  {resultado?.puntajeObtenido ?? 0}/{totalQuestions}
                </div>
                <p className="text-muted-foreground">Respuestas correctas</p>

                {resultado && resultado.expGanada > 0 && (
                  <p className="text-sm text-success mt-2">
                    +{resultado.expGanada} EXP ganada
                  </p>
                )}

                {resultado && (
                  <p className={cn(
                    "text-sm font-medium mt-1",
                    resultado.leccionAprobada ? "text-success" : "text-orange-500"
                  )}>
                    {resultado.leccionAprobada ? "¡Lección aprobada! 🎉" : "No aprobaste esta vez. ¡Inténtalo de nuevo!"}
                  </p>
                )}
              </div>

              {/* Question Results List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Detalle de respuestas</h4>
                {resultItems.map((item, index) => {
                  const correct = isAnswerCorrect(item);
                  const selectedText =
                    item.selectedAnswerIndex >= 0 && item.selectedAnswerIndex < item.question.options.length
                      ? item.question.options[item.selectedAnswerIndex]
                      : "Sin respuesta";

                  return (
                    <motion.div
                      key={item.questionId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-xl border-2",
                        correct
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {correct ? (
                          <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground mb-2">
                            {index + 1}. {item.question.text}
                          </p>

                          {correct ? (
                            <p className="text-sm text-success">
                              ✓ Respuesta correcta: {getCorrectAnswerText(item)}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm text-destructive">
                                ✗ Tu respuesta: {selectedText}
                              </p>
                              <p className="text-sm text-success">
                                ✓ Respuesta correcta: {getCorrectAnswerText(item)}
                              </p>

                              {/* Solución del backend */}
                              {item.feedback && (item.feedback.solucionTexto || item.feedback.solucionImagenUrl) && (
                                <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Solución:</p>
                                  {item.feedback.solucionTexto && (
                                    <p className="text-sm text-foreground">{item.feedback.solucionTexto}</p>
                                  )}
                                  {item.feedback.solucionImagenUrl && (
                                    <img
                                      src={item.feedback.solucionImagenUrl}
                                      alt="Solución"
                                      className="mt-2 rounded-lg max-h-48 object-contain"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Button onClick={handleClose} className="w-full btn-tesla-primary">
                Cerrar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};