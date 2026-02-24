import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { useQuizLogic, type QuizResultItem } from "@/hooks/studentDashboard/useQuizLogic";
import type { ResultadoEvaluacionDTO } from "@/types/api.types";

export interface QuizQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  alternativaIds: number[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  questions: QuizQuestion[];
  onComplete: (selectedAnswers: Record<string, number>) => Promise<ResultadoEvaluacionDTO | null>;
  timePerQuestion?: number;
}

export const QuizModal = ({
  isOpen, onClose, lessonTitle, questions, onComplete, timePerQuestion = 180,
}: QuizModalProps) => {
  const { state, actions } = useQuizLogic(isOpen, questions, timePerQuestion, onComplete);

  const handleClose = () => {
    actions.resetQuiz();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        
        {/* FIX: Título y descripción ocultos para la accesibilidad (quita los errores de consola) */}
        <DialogTitle className="sr-only">Cuestionario: {lessonTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          Responde las siguientes preguntas antes de que se agote el tiempo.
        </DialogDescription>

        {state.isSubmitting && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground font-medium">Enviando respuestas...</p>
          </div>
        )}

        {!state.showingResults ? (
          <ActiveQuizView state={state} actions={actions} lessonTitle={lessonTitle} />
        ) : (
          <QuizResultsView state={state} onClose={handleClose} />
        )}

      </DialogContent>
    </Dialog>
  );
};

// ─── Sub-Componente: Vista Activa del Quiz ─────────────────────────────────

const ActiveQuizView = ({ state, actions, lessonTitle }: { state: any, actions: any, lessonTitle: string }) => {
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  const getTimerColor = () => state.timeLeft <= 30 ? "text-destructive" : state.timeLeft <= 60 ? "text-orange-500" : "text-foreground";

  return (
    <>
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">{lessonTitle}</p>
            <p className="text-xs text-primary font-medium">Pregunta {state.currentQuestionIndex + 1} de {state.totalQuestions}</p>
          </div>
          <div className={cn("flex items-center gap-2 font-mono text-lg font-bold", getTimerColor())}>
            <Clock className="w-5 h-5" /> {formatTime(state.timeLeft)}
          </div>
        </div>
        <Progress value={((state.currentQuestionIndex + 1) / state.totalQuestions) * 100} className="h-2" />
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentQuestion.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">{state.currentQuestion.text}</h3>
              {/* Imagen de la pregunta o placeholder de prueba si no viene */}
              <div className="w-full flex justify-center bg-secondary/20 rounded-xl p-4 border border-border">
                <img 
                  src={state.currentQuestion.imageUrl || "https://res.cloudinary.com/drxrcueub/image/upload/v1771917207/academia_tesla/soluciones/etrzzgwyliettriqzaxy.webp"} 
                  alt="Pregunta" 
                  className="max-h-64 object-contain rounded-lg"
                  onError={(e) => {
                    if (e.currentTarget.src !== "https://res.cloudinary.com/drxrcueub/image/upload/v1771917207/academia_tesla/soluciones/etrzzgwyliettriqzaxy.webp") {
                       e.currentTarget.src = "https://res.cloudinary.com/drxrcueub/image/upload/v1771917207/academia_tesla/soluciones/etrzzgwyliettriqzaxy.webp";
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              {state.currentQuestion.options.map((option: string, index: number) => (
                <motion.button
                  key={index} onClick={() => actions.setSelectedAnswer(index)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    state.selectedAnswer === index ? "border-primary bg-primary/10 shadow-lg" : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                      state.selectedAnswer === index ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
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

      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        <Button
          onClick={actions.handleNextQuestion}
          disabled={state.selectedAnswer === null || state.isSubmitting}
          className="w-full btn-tesla-accent"
        >
          {state.currentQuestionIndex < state.totalQuestions - 1 ? (
            <>Siguiente <ArrowRight className="w-4 h-4 ml-2" /></>
          ) : "Finalizar Quiz"}
        </Button>
      </div>
    </>
  );
};

// ─── Sub-Componente: Vista de Resultados ───────────────────────────────────

const QuizResultsView = ({ state, onClose }: { state: any, onClose: () => void }) => {
  const getCorrectAnswerText = (item: QuizResultItem): string => {
    if (!item.feedback) return "—";
    const correctIndex = item.question.alternativaIds.indexOf(item.feedback.idAlternativaCorrecta);
    return correctIndex >= 0 ? item.question.options[correctIndex] : "—";
  };

  return (
    <>
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-2xl">Resultados del Quiz</DialogTitle>
      </DialogHeader>

      <div className="p-6 space-y-6">
        <div className="text-center p-6 bg-secondary rounded-2xl">
          <div className="text-5xl font-bold text-primary mb-2">
            {state.resultado?.puntajeObtenido ?? 0}/{state.totalQuestions}
          </div>
          <p className="text-muted-foreground">Respuestas correctas</p>
          {state.resultado?.expGanada > 0 && <p className="text-sm text-success mt-2">+{state.resultado.expGanada} EXP ganada</p>}
          {state.resultado && (
            <p className={cn("text-sm font-medium mt-1", state.resultado.leccionAprobada ? "text-success" : "text-orange-500")}>
              {state.resultado.leccionAprobada ? "¡Lección aprobada! 🎉" : "No aprobaste esta vez. ¡Inténtalo de nuevo!"}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Detalle de respuestas</h4>
          {state.resultItems.map((item: QuizResultItem, index: number) => {
            const correct = item.feedback?.correcta ?? false;
            const selectedText = item.selectedAnswerIndex >= 0 ? item.question.options[item.selectedAnswerIndex] : "Sin respuesta";

            return (
              <motion.div
                key={item.questionId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className={cn("p-4 rounded-xl border-2", correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5")}
              >
                <div className="flex items-start gap-3">
                  {correct ? <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" /> : <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground mb-2">{index + 1}. {item.question.text}</p>
                    {correct ? (
                      <p className="text-sm text-success">✓ Respuesta correcta: {getCorrectAnswerText(item)}</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-destructive">✗ Tu respuesta: {selectedText}</p>
                        <p className="text-sm text-success">✓ Respuesta correcta: {getCorrectAnswerText(item)}</p>
                        
                        <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Solución:</p>
                          {item.feedback?.solucionTexto && <p className="text-sm text-foreground">{item.feedback.solucionTexto}</p>}
                          <img 
                            src={item.feedback?.solucionImagenUrl || "https://res.cloudinary.com/drxrcueub/image/upload/v1771917207/academia_tesla/soluciones/etrzzgwyliettriqzaxy.webp"} 
                            alt="Solución" 
                            className="mt-2 rounded-lg max-h-48 object-contain"
                            onError={(e) => {
                               if(e.currentTarget.src !== "https://res.cloudinary.com/drxrcueub/image/upload/v1771917207/academia_tesla/soluciones/etrzzgwyliettriqzaxy.webp"){
                                   e.currentTarget.src = "https://res.cloudinary.com/drxrcueub/image/upload/v1771917207/academia_tesla/soluciones/etrzzgwyliettriqzaxy.webp";
                               }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <Button onClick={onClose} className="w-full btn-tesla-primary">Cerrar</Button>
      </div>
    </>
  );
};