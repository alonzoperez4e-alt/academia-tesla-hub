import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Unlock, Lock, Check, Eye, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface Lesson {
  id: string;
  name: string;
  description: string;
  questionsCount: number;
  isCompleted?: boolean;
  completionRate?: number;
}

export interface Week {
  week: number;
  isUnlocked: boolean;
  lessons: Lesson[];
}

interface WeekManagerProps {
  courseName: string;
  weeks: Week[];
  onBack: () => void;
  onAddLesson: (weekNumber: number) => void;
  onViewDetails: (weekNumber: number) => void;
  onUnlockWeek: (weekNumber: number) => void;
  onAddWeek: () => void;
  onDeleteWeek: (weekNumber: number) => void;
}

export const WeekManager = ({
  courseName,
  weeks,
  onBack,
  onAddLesson,
  onViewDetails,
  onUnlockWeek,
  onAddWeek,
  onDeleteWeek,
}: WeekManagerProps) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const handleDeleteWeek = (weekNumber: number, lessonsCount: number) => {
    if (lessonsCount > 0) {
      toast({
        title: "No se puede eliminar",
        description: "Esta semana tiene lecciones. Elimina las lecciones primero.",
        variant: "destructive",
      });
      return;
    }
    onDeleteWeek(weekNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{courseName}</h2>
            <p className="text-muted-foreground">Gestiona las semanas y lecciones del curso</p>
          </div>
        </div>

        <Button onClick={onAddWeek} className="btn-tesla-primary">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Semana
        </Button>
      </div>

      {/* Weeks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weeks.map((week, index) => (
          <motion.div
            key={week.week}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all",
              week.isUnlocked
                ? "bg-success/10 border-success/30"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            {/* Week Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Semana {week.week}</h3>
              {week.isUnlocked ? (
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Lessons count */}
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>{week.lessons.length} lecciones</span>
            </div>

            {/* Lesson previews */}
            {week.lessons.length > 0 && (
              <div className="mb-3 space-y-1">
                {week.lessons.slice(0, 2).map((lesson) => (
                  <div key={lesson.id} className="text-xs text-muted-foreground truncate bg-secondary/50 px-2 py-1 rounded">
                    • {lesson.name}
                  </div>
                ))}
                {week.lessons.length > 2 && (
                  <div className="text-xs text-primary">+{week.lessons.length - 2} más</div>
                )}
              </div>
            )}

            {/* Status text */}
            <p className="text-sm text-muted-foreground mb-4">
              {week.isUnlocked ? "Disponible para alumnos" : "Contenido bloqueado"}
            </p>

            {/* Actions */}
            <div className="space-y-2">
              {/* Add Lesson Button */}
              <Button
                onClick={() => onAddLesson(week.week)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Lección
              </Button>

              {/* View Details Button */}
              <Button
                onClick={() => onViewDetails(week.week)}
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={week.lessons.length === 0}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </Button>

              {/* Unlock Button */}
              {!week.isUnlocked && (
                <Button
                  onClick={() => onUnlockWeek(week.week)}
                  className="w-full btn-tesla-accent"
                  size="sm"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Desbloquear
                </Button>
              )}

              {/* Delete Button (only if no lessons) */}
              {week.lessons.length === 0 && (
                <Button
                  onClick={() => handleDeleteWeek(week.week, week.lessons.length)}
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Semana
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
