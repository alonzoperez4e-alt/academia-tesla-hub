import { useState } from "react";
import { Plus, X, Image, Trash2, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface QuestionDraft {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number | null;
  solutionText: string;
  solutionImage: string | null;
  isComplete: boolean;
}

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  onSave: (lesson: {
    name: string;
    description: string;
    questions: Array<{
      text: string;
      options: string[];
      correctAnswer: number;
      solutionText?: string;
      solutionImage?: string;
    }>;
  }) => void;
}

export const LessonFormModal = ({ isOpen, onClose, weekNumber, onSave }: LessonFormModalProps) => {
  const [lessonName, setLessonName] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  
  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDraft>({
    id: crypto.randomUUID(),
    text: "",
    options: [""],
    correctAnswer: null,
    solutionText: "",
    solutionImage: null,
    isComplete: false,
  });
  const [optionsSaved, setOptionsSaved] = useState(false);

  const handleAddOption = () => {
    if (currentQuestion.options.length >= 5) return;
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""],
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswer: currentQuestion.correctAnswer === index 
        ? null 
        : currentQuestion.correctAnswer !== null && currentQuestion.correctAnswer > index
        ? currentQuestion.correctAnswer - 1
        : currentQuestion.correctAnswer,
    });
  };

  const handleSaveOptions = () => {
    if (currentQuestion.options.some(o => !o.trim())) {
      toast({
        title: "Error",
        description: "Todas las opciones deben tener contenido",
        variant: "destructive",
      });
      return;
    }
    if (currentQuestion.options.length < 2) {
      toast({
        title: "Error",
        description: "Debe haber al menos 2 opciones",
        variant: "destructive",
      });
      return;
    }
    setOptionsSaved(true);
  };

  const handleSolutionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentQuestion({
          ...currentQuestion,
          solutionImage: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.text.trim()) {
      toast({
        title: "Error",
        description: "La pregunta debe tener texto",
        variant: "destructive",
      });
      return;
    }
    if (currentQuestion.correctAnswer === null) {
      toast({
        title: "Error",
        description: "Debes seleccionar la respuesta correcta",
        variant: "destructive",
      });
      return;
    }

    const completedQuestion = {
      ...currentQuestion,
      isComplete: true,
    };

    setQuestions([...questions, completedQuestion]);
    
    // Reset for new question
    setCurrentQuestion({
      id: crypto.randomUUID(),
      text: "",
      options: [""],
      correctAnswer: null,
      solutionText: "",
      solutionImage: null,
      isComplete: false,
    });
    setOptionsSaved(false);

    toast({
      title: "Pregunta guardada",
      description: "Puedes agregar otra pregunta o guardar la lección",
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveLesson = () => {
    if (!lessonName.trim()) {
      toast({
        title: "Error",
        description: "La lección debe tener un nombre",
        variant: "destructive",
      });
      return;
    }
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "La lección debe tener al menos una pregunta",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name: lessonName,
      description: lessonDescription,
      questions: questions.map(q => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer!,
        solutionText: q.solutionText || undefined,
        solutionImage: q.solutionImage || undefined,
      })),
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setLessonName("");
    setLessonDescription("");
    setQuestions([]);
    setCurrentQuestion({
      id: crypto.randomUUID(),
      text: "",
      options: [""],
      correctAnswer: null,
      solutionText: "",
      solutionImage: null,
      isComplete: false,
    });
    setOptionsSaved(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Nueva Lección - Semana {weekNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lesson Info */}
          <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
            <div className="space-y-2">
              <Label>Nombre de la Lección *</Label>
              <Input
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="Ej: Comprensión Lectora Básica"
                className="input-tesla"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción de la Lección</Label>
              <Textarea
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Describe brevemente el contenido de esta lección..."
                className="input-tesla min-h-[80px]"
              />
            </div>
          </div>

          {/* Saved Questions */}
          {questions.length > 0 && (
            <div className="space-y-2">
              <Label>Preguntas Guardadas ({questions.length})</Label>
              <div className="space-y-2">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-lg"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {index + 1}. {q.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.options.length} opciones
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Question Form */}
          <div className="space-y-4 p-4 border-2 border-dashed border-border rounded-xl">
            <h4 className="font-medium text-foreground">
              {questions.length > 0 ? "Agregar otra pregunta" : "Agregar pregunta"}
            </h4>

            {/* Question Text */}
            <div className="space-y-2">
              <Label>Pregunta *</Label>
              <Textarea
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                placeholder="Escribe la pregunta aquí..."
                className="input-tesla min-h-[80px]"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label>Opciones de Respuesta</Label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  {optionsSaved ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0",
                        currentQuestion.correctAnswer === index
                          ? "bg-success text-white"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      )}
                    >
                      {currentQuestion.correctAnswer === index ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-muted-foreground flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>
                  )}
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                    className="flex-1 input-tesla"
                    disabled={optionsSaved}
                  />
                  {!optionsSaved && currentQuestion.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {!optionsSaved && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    disabled={currentQuestion.options.length >= 5}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Opción
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveOptions}
                    disabled={currentQuestion.options.length < 2 || currentQuestion.options.some(o => !o.trim())}
                    className="flex-1 btn-tesla-primary"
                  >
                    Guardar Opciones
                  </Button>
                </div>
              )}

              {optionsSaved && (
                <p className="text-xs text-muted-foreground">
                  Haz clic en la letra para marcar la respuesta correcta
                </p>
              )}
            </div>

            {/* Solution (only show after options are saved) */}
            {optionsSaved && (
              <div className="space-y-4 pt-4 border-t border-border">
                <Label>Solución (se muestra al alumno si falla)</Label>
                
                <Textarea
                  value={currentQuestion.solutionText}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, solutionText: e.target.value })}
                  placeholder="Explica la solución del problema..."
                  className="input-tesla min-h-[80px]"
                />

                <div className="space-y-2">
                  <Label>Imagen de Solución (opcional)</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                        currentQuestion.solutionImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}>
                        {currentQuestion.solutionImage ? (
                          <div className="relative">
                            <img
                              src={currentQuestion.solutionImage}
                              alt="Preview"
                              className="max-h-32 mx-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentQuestion({ ...currentQuestion, solutionImage: null });
                              }}
                              className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Image className="w-6 h-6" />
                            <span className="text-sm">Click para subir imagen</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSolutionImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSaveQuestion}
                  disabled={!currentQuestion.text.trim() || currentQuestion.correctAnswer === null}
                  className="w-full btn-tesla-accent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Guardar Pregunta
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveLesson}
              className="flex-1 btn-tesla-primary"
              disabled={!lessonName.trim() || questions.length === 0}
            >
              Guardar Lección
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
