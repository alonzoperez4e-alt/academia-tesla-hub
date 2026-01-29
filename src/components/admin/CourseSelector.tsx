import { motion } from "framer-motion";
import { MessageSquare, Calculator, Atom, FlaskConical, Brain, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  description: string;
  icon: "comunicacion" | "matematica" | "fisica" | "quimica" | "razonamiento";
  color: string;
  isEnabled: boolean;
  lessonsCount: number;
  questionsCount: number;
}

interface CourseSelectorProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
}

const iconMap = {
  comunicacion: MessageSquare,
  matematica: Calculator,
  fisica: Atom,
  quimica: FlaskConical,
  razonamiento: Brain,
};

export const CourseSelector = ({ courses, onSelectCourse }: CourseSelectorProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Gestionar Cuestionarios</h2>
        <p className="text-muted-foreground">Selecciona un curso para gestionar sus semanas y lecciones</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, index) => {
          const Icon = iconMap[course.icon];
          
          return (
            <motion.button
              key={course.id}
              onClick={() => course.isEnabled && onSelectCourse(course.id)}
              disabled={!course.isEnabled}
              className={cn(
                "relative p-6 rounded-2xl border-2 text-left transition-all duration-300",
                course.isEnabled
                  ? "bg-card border-border hover:border-primary hover:shadow-xl cursor-pointer"
                  : "bg-muted/50 border-muted cursor-not-allowed opacity-60"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={course.isEnabled ? { scale: 1.02 } : undefined}
              whileTap={course.isEnabled ? { scale: 0.98 } : undefined}
            >
              {/* Lock overlay for disabled courses */}
              {!course.isEnabled && (
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
                  course.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg">{course.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>
              </div>

              {course.isEnabled && (
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="font-medium text-foreground">{course.lessonsCount}</span> lecciones
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="font-medium text-foreground">{course.questionsCount}</span> preguntas
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
