import { useRef, useState } from "react";
import { Plus, X, Upload, Image, MessageSquare } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/adminService";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  imageUrl?: string;
}

interface QuestionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Omit<Question, "id">) => void;
}

export const QuestionUploadModal = ({ isOpen, onClose, onSave }: QuestionUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [week, setWeek] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearImageSelection = () => {
    setImagePreview(null);
    setImageUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetImageSelection = () => {
    clearImageSelection();
    setUploadError(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadError(null);
      setIsUploadingImage(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const uploadedImage = await adminService.uploadQuestionImage(file);
        setImageUrl(uploadedImage.url);
        setImagePreview(uploadedImage.url);
      } catch (error) {
        console.error("Error al subir la imagen de la pregunta:", error);
        clearImageSelection();
        setUploadError("No se pudo subir la imagen. Intenta nuevamente.");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (correctAnswer === null || isUploadingImage) return;
    
    onSave({
      text: questionText,
      options,
      correctAnswer,
      imageUrl: imageUrl || undefined,
    });
    
    // Reset form
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(null);
    setWeek("");
    resetImageSelection();
    onClose();
  };

  const resetForm = () => {
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(null);
    setWeek("");
    resetImageSelection();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <MessageSquare className="w-5 h-5 text-primary" />
            Nueva Pregunta de Comunicación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Week Selection */}
          <div className="space-y-2">
            <Label>Semana</Label>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="input-tesla">
                <SelectValue placeholder="Seleccionar semana" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    Semana {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label>Pregunta</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Escribe la pregunta aquí..."
              className="input-tesla min-h-[100px]"
              required
            />
          </div>

          {/* Image Upload (Optional) */}
          <div className="space-y-2">
            <Label>Imagen (Opcional - para solucionarios)</Label>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                  imagePreview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          resetImageSelection();
                        }}
                        className="absolute top-2 right-2 p-1 bg-destructive rounded-full text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Image className="w-8 h-8" />
                      <span className="text-sm">Click para subir imagen</span>
                      {isUploadingImage && <span className="text-xs text-primary">Subiendo a S3...</span>}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            {imageUrl && !isUploadingImage && (
              <p className="text-xs text-muted-foreground break-all">URL CloudFront: {imageUrl}</p>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            <Label>Opciones de Respuesta</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(index)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    correctAnswer === index
                      ? "bg-success text-white"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </button>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                  className="flex-1 input-tesla"
                  required
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Haz clic en la letra para marcar la respuesta correcta
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-tesla-accent"
              disabled={!questionText || options.some((o) => !o) || correctAnswer === null || !week || isUploadingImage}
            >
              {isUploadingImage ? (
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Guardar Pregunta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
