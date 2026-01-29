import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  solutionText?: string;
  solutionImage?: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  questions: QuizQuestion[];
  onComplete: (score: number, isFirstAttempt: boolean) => void;
  timePerQuestion?: number; // in seconds, default 180 (3 min)
  isFirstAttempt: boolean;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  question: QuizQuestion;
}

export const QuizModal = ({
  isOpen,
  onClose,
  lessonTitle,
  questions,
  onComplete,
  timePerQuestion = 180,
  isFirstAttempt,
}: QuizModalProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showingResults, setShowingResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Timer logic
  useEffect(() => {
    if (!isOpen || quizCompleted || showingResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit current answer or skip
          handleNextQuestion();
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, currentQuestionIndex, quizCompleted, showingResults]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(timePerQuestion);
  }, [currentQuestionIndex, timePerQuestion]);

  const handleNextQuestion = useCallback(() => {
    // Save answer
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
      // Quiz completed
      completeQuiz();
    }
  }, [selectedAnswer, currentQuestionIndex, totalQuestions, currentQuestion]);

  const completeQuiz = () => {
    const finalAnswers = {
      ...answers,
      ...(selectedAnswer !== null && { [currentQuestion.id]: selectedAnswer }),
    };

    const quizResults: QuizResult[] = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: finalAnswers[q.id] ?? -1,
      isCorrect: finalAnswers[q.id] === q.correctAnswer,
      question: q,
    }));

    const score = quizResults.filter((r) => r.isCorrect).length;
    setResults(quizResults);
    setQuizCompleted(true);
    setShowingResults(true);
    onComplete(score, isFirstAttempt);
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
    setQuizCompleted(false);
    setResults([]);
    setShowingResults(false);
    onClose();
  };

  const getTimerColor = () => {
    if (timeLeft <= 30) return "text-destructive";
    if (timeLeft <= 60) return "text-orange-500";
    return "text-foreground";
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
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
              {!isFirstAttempt && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Este intento no suma puntos al ranking
                </p>
              )}
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
                disabled={selectedAnswer === null}
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
          /* Results View */
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl">Resultados del Quiz</DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* Score Summary */}
              <div className="text-center p-6 bg-secondary rounded-2xl">
                <div className="text-5xl font-bold text-primary mb-2">
                  {results.filter((r) => r.isCorrect).length}/{totalQuestions}
                </div>
                <p className="text-muted-foreground">Respuestas correctas</p>
                {isFirstAttempt && (
                  <p className="text-sm text-success mt-2">
                    +{results.filter((r) => r.isCorrect).length * 10} puntos añadidos al ranking
                  </p>
                )}
              </div>

              {/* Question Results List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Detalle de respuestas</h4>
                {results.map((result, index) => (
                  <motion.div
                    key={result.questionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "p-4 rounded-xl border-2",
                      result.isCorrect
                        ? "border-success/30 bg-success/5"
                        : "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {result.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground mb-2">
                          {index + 1}. {result.question.text}
                        </p>
                        
                        {result.isCorrect ? (
                          <p className="text-sm text-success">
                            ✓ Respuesta correcta: {result.question.options[result.question.correctAnswer]}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-destructive">
                              ✗ Tu respuesta: {result.selectedAnswer >= 0 ? result.question.options[result.selectedAnswer] : "Sin respuesta"}
                            </p>
                            <p className="text-sm text-success">
                              ✓ Respuesta correcta: {result.question.options[result.question.correctAnswer]}
                            </p>
                            
                            {/* Solution */}
                            {(result.question.solutionText || result.question.solutionImage) && (
                              <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Solución:</p>
                                {result.question.solutionText && (
                                  <p className="text-sm text-foreground">{result.question.solutionText}</p>
                                )}
                                {result.question.solutionImage && (
                                  <img
                                    src={result.question.solutionImage}
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
                ))}
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
