import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { name: string; course: string; week: string; file: File | null }) => void;
}

const courses = [
  { id: "fisica", name: "Física" },
  { id: "quimica", name: "Química" },
  { id: "matematica", name: "Raz. Matemático" },
  { id: "verbal", name: "Raz. Verbal" },
  { id: "algebra", name: "Álgebra" },
  { id: "geometria", name: "Geometría" },
];

const weeks = Array.from({ length: 16 }, (_, i) => i + 1);

export const UploadModal = ({ isOpen, onClose, onUpload }: UploadModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [week, setWeek] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!name) setName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!name) setName(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    onUpload({ name, course, week, file });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFile(null);
    setName("");
    setCourse("");
    setWeek("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Subir Nuevo Material
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-accent bg-accent/10"
                : file
                ? "border-success bg-success/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-12 h-12 text-success" />
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1" />
                  Quitar archivo
                </Button>
              </div>
            ) : (
              <>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">
                  Arrastra y suelta tu archivo aquí
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  o haz clic para seleccionar
                </p>
                <input
                  type="file"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.mp4,.mov,.avi"
                />
                <label htmlFor="file-upload">
                  <Button asChild variant="outline" className="cursor-pointer">
                    <span>Seleccionar Archivo</span>
                  </Button>
                </label>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del material</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Teoría de Cinemática"
                className="input-tesla"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Curso</Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger className="input-tesla">
                    <SelectValue placeholder="Seleccionar curso" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semana</Label>
                <Select value={week} onValueChange={setWeek}>
                  <SelectTrigger className="input-tesla">
                    <SelectValue placeholder="Seleccionar semana" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {weeks.map((w) => (
                      <SelectItem key={w} value={w.toString()}>
                        Semana {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !name || !course || !week}
            className="btn-tesla-accent"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Material
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
