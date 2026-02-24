import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Calculator, Atom, FlaskConical, Brain, Lock, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Curso } from "@/types/api.types";

interface CourseSelectorProps {
  courses: Curso[];
  onSelectCourse: (courseId: number) => void;
  onCreateCourse: (nombre: string, descripcion: string) => Promise<void>;
}

const iconMap = {
  comunicacion: MessageSquare,
  matematica: Calculator,
  fisica: Atom,
  quimica: FlaskConical,
  razonamiento: Brain,
};

const getCourseStyle = (name: string): { icon: keyof typeof iconMap, color: string } => {
  const normalized = name.toLowerCase();
  if (normalized.includes('comunica')) return { icon: "comunicacion", color: "from-purple-500 to-purple-600" };
  if (normalized.includes('matem')) return { icon: "matematica", color: "from-blue-500 to-blue-600" };
  if (normalized.includes('físi') || normalized.includes('fisi')) return { icon: "fisica", color: "from-cyan-500 to-cyan-600" };
  if (normalized.includes('quími') || normalized.includes('quimi')) return { icon: "quimica", color: "from-green-500 to-green-600" };
  return { icon: "razonamiento", color: "from-orange-500 to-orange-600" };
};

export const CourseSelector = ({ courses, onSelectCourse, onCreateCourse }: CourseSelectorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCursoData, setNewCursoData] = useState({ nombre: "", descripcion: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCursoData.nombre.trim() || !newCursoData.descripcion.trim()) {
      toast({ title: "Error", description: "Todos los campos son obligatorios.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onCreateCourse(newCursoData.nombre, newCursoData.descripcion);
      setNewCursoData({ nombre: "", descripcion: "" });
      setIsCreating(false);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el curso.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gestionar Cuestionarios</h2>
          <p className="text-muted-foreground">Selecciona un curso para gestionar sus semanas y lecciones</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Crear nuevo curso
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateSubmit} className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Nuevo Curso</h3>
                <button type="button" onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre del Curso</label>
                  <input
                    type="text"
                    value={newCursoData.nombre}
                    onChange={(e) => setNewCursoData({ ...newCursoData, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Ej. Programación Avanzada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Descripción</label>
                  <textarea
                    value={newCursoData.descripcion}
                    onChange={(e) => setNewCursoData({ ...newCursoData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary min-h-[80px]"
                    placeholder="Describe el curso..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Creando..." : "Crear Curso"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, index) => {
          const style = getCourseStyle(course.nombre);
          const Icon = iconMap[style.icon];
          
          return (
            <motion.button
              key={course.idCurso}
              onClick={() => course.isHabilitado && onSelectCourse(course.idCurso)}
              disabled={!course.isHabilitado}
              className={cn(
                "relative p-6 rounded-2xl border-2 text-left transition-all duration-300",
                course.isHabilitado
                  ? "bg-card border-border hover:border-primary hover:shadow-xl cursor-pointer"
                  : "bg-muted/50 border-muted cursor-not-allowed opacity-60"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={course.isHabilitado ? { scale: 1.02 } : undefined}
              whileTap={course.isHabilitado ? { scale: 0.98 } : undefined}
            >
              {/* Lock overlay for disabled courses */}
              {!course.isHabilitado && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-2xl z-10">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Próximamente</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  style.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg">{course.nombre}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.descripcion}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
