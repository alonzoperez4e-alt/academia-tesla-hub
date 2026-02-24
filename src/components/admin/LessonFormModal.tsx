import { useState } from "react";
import { Plus, X, Image, Trash2, Check, GripVertical, Loader2 } from "lucide-react";
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
import { adminService } from "@/services/adminService";

interface QuestionDraft {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number | null;
  questionImage: string | null;
  questionImageFile: File | null;
  solutionText: string;
  solutionImage: string | null;
  solutionImageFile: File | null;
  isComplete: boolean;
}

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekId: number;
  weekNumber: number;
  onSave: (lesson: {
    name: string;
    description: string;
    questions: Array<{
      text: string;
      questionImage?: string;
      options: string[];
      correctAnswer: number;
      solutionText?: string;
      solutionImage?: string;
    }>;
  }) => void;
}

export const LessonFormModal = ({ isOpen, onClose, weekId, weekNumber, onSave }: LessonFormModalProps) => {
  const [lessonName, setLessonName] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDraft>({
    id: crypto.randomUUID(),
    text: "",
    options: [""],
    correctAnswer: null,
    questionImage: null,
    questionImageFile: null,
    solutionText: "",
    solutionImage: null,
    solutionImageFile: null,
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

  const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentQuestion({
          ...currentQuestion,
          questionImage: reader.result as string,
          questionImageFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolutionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentQuestion({
          ...currentQuestion,
          solutionImage: reader.result as string,
          solutionImageFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.text.trim() && !currentQuestion.questionImage) {
      toast({
        title: "Error",
        description: "La pregunta debe tener texto o una imagen",
        variant: "destructive",
      });
      return;
    }
    if (!currentQuestion.solutionText.trim() && !currentQuestion.solutionImage) {
      toast({
        title: "Error",
        description: "La solución debe tener texto o una imagen",
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
      questionImage: null,
      questionImageFile: null,
      solutionText: "",
      solutionImage: null,
      solutionImageFile: null,
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

  const handleSaveLesson = async () => {
    // Paso 1: Validaciones previas
    if (!lessonName.trim()) {
      toast({ title: "Error", description: "La lección debe tener un nombre", variant: "destructive" });
      return;
    }
    if (questions.length === 0) {
      toast({ title: "Error", description: "La lección debe tener al menos una pregunta guardada", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      
      // Paso 2: Crear Lección
      const newLesson = await adminService.crearLeccion({
        idSemana: weekId,
        nombre: lessonName,
        descripcion: lessonDescription,
        orden: 1, // Por ahora enviamos 1, o se puede calcular si te lo da el endpoint de listarSemanas
      });
      
      // Paso 3: Extraer ID
      const idLeccionCreated = newLesson.idLeccion;

      // Paso 4: Bucle de Preguntas
      for (const q of questions) {
        const preguntaDTO = {
          idLeccion: idLeccionCreated,
          textoPregunta: q.text,
          solucionTexto: q.solutionText,
          solucionImagenUrl: "", // Sera proveido por cloudinary desde backend
          preguntaImagenUrl: "", // Sera proveido por cloudinary desde backend
          alternativas: q.options.map((opt, index) => ({
            texto: opt,
            isCorrecta: index === q.correctAnswer
          }))
        };

        // Paso 5: Enviar Preguntas (FormData en adminService.crearPregunta)
        await adminService.crearPregunta(
          preguntaDTO, 
          q.questionImageFile || undefined, 
          q.solutionImageFile || undefined
        );
      }

      // Paso 6: Feedback
      toast({
        title: "Lección Guardada",
        description: "Se han guardado correctamente la lección y sus preguntas.",
      });

      // Enviamos el aviso a la pantalla (AdminDashboard)
      onSave({
        name: lessonName,
        description: lessonDescription,
        questions: questions.map(q => ({
          text: q.text,
          questionImage: q.questionImage || undefined,
          options: q.options,
          correctAnswer: q.correctAnswer!,
          solutionText: q.solutionText || undefined,
          solutionImage: q.solutionImage || undefined,
        })),
      });

      resetForm();
    } catch (error: any) {
      console.error("Error guardando lección completo:", error);
      toast({
        title: "Error de Servidor",
        description: "Hubo un problema procesando la petición. Verifica tu consola.",
        variant: "destructive"
      });
    } finally {
       setIsSaving(false);
    }
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
      questionImage: null,
      questionImageFile: null,
      solutionText: "",
      solutionImage: null,
      solutionImageFile: null,
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

            {/* Question Text & Image */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Texto de la Pregunta</Label>
                <Textarea
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  placeholder="Escribe la pregunta aquí..."
                  className="input-tesla min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen de la Pregunta (opcional)</Label>
                <div className="flex items-center gap-4">
                  <label className="flex-1">
                    <div className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                      currentQuestion.questionImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}>
                      {currentQuestion.questionImage ? (
                        <div className="relative">
                          <img
                            src={currentQuestion.questionImage}
                            alt="Preview"
                            className="max-h-32 mx-auto rounded-lg object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentQuestion({ ...currentQuestion, questionImage: null });
                            }}
                            className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-white hover:bg-destructive/90 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Image className="w-6 h-6" />
                          <span className="text-sm">Click para subir imagen o arrastra y suelta</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuestionImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
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
                <div className="space-y-2">
                  <Label>Texto de la Solución</Label>
                  <Textarea
                    value={currentQuestion.solutionText}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, solutionText: e.target.value })}
                    placeholder="Explica la solución del problema..."
                    className="input-tesla min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagen de Solución</Label>
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
                  disabled={(!currentQuestion.text.trim() && !currentQuestion.questionImage) || (!currentQuestion.solutionText.trim() && !currentQuestion.solutionImage) || currentQuestion.correctAnswer === null}
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveLesson}
              className="flex-1 btn-tesla-primary"
              disabled={isSaving || !lessonName.trim() || questions.length === 0}
            >
              {isSaving ? (
                 <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                 "Guardar Lección"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
