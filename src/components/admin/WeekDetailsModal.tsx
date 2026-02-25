import { BookOpen, HelpCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  solutionText?: string;
  solutionImage?: string;
}

interface Lesson {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

interface WeekDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  lessons: Lesson[];
  onDeleteLesson: (lessonId: string) => void;
  onDeleteWeek?: () => void;
}

export const WeekDetailsModal = ({
  isOpen,
  onClose,
  weekNumber,
  lessons,
  onDeleteLesson,
  onDeleteWeek,
}: WeekDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Detalle de Semana {weekNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Esta semana no tiene lecciones</p>
            </div>
          ) : (
            lessons.map((lesson, lessonIndex) => (
              <div
                key={lesson.id}
                className="border border-border rounded-xl overflow-hidden"
              >
                {/* Lesson Header */}
                <div className="flex items-center justify-between p-4 bg-secondary/30">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {lessonIndex + 1}. {lesson.name}
                    </h3>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <HelpCircle className="w-3 h-3" />
                      {lesson.questions.length} preguntas
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteLesson(lesson.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Questions */}
                <div className="divide-y divide-border">
                  {lesson.questions.map((question, qIndex) => (
                    <div key={question.id} className="p-4">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {qIndex + 1}. {question.text}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={cn(
                              "text-xs p-2 rounded-lg",
                              oIndex === question.correctAnswer
                                ? "bg-success/20 text-success border border-success/30"
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            <span className="font-medium mr-1">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            {option}
                          </div>
                        ))}
                      </div>
                      
                      {(question.solutionText || question.solutionImage) && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Solución:</p>
                          {question.solutionText && (
                            <p className="text-xs text-foreground">{question.solutionText}</p>
                          )}
                          {question.solutionImage && (
                            <img
                              src={question.solutionImage}
                              alt="Solución"
                              className="mt-1 rounded max-h-24 object-contain"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-border flex justify-between">
          {onDeleteWeek && (
            <Button onClick={onDeleteWeek} variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Eliminar Semana
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className={cn(onDeleteWeek ? "w-auto" : "w-full")}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
