import { BookOpen, FileText, Calculator, Atom, FlaskConical, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StudentDinoGif from "@/components/student/StudentDinoGif";

interface CourseCardProps {
  id: string;
  name: string;
  icon: "fisica" | "quimica" | "matematica" | "razonamiento" | "default";
  progress: number;
  totalLessons: number;
  completedLessons: number;
  onViewMaterial: (id: string) => void;
}

const iconMap = {
  fisica: Atom,
  quimica: FlaskConical,
  matematica: Calculator,
  razonamiento: Brain,
  default: BookOpen,
};

const colorMap = {
  fisica: "from-blue-500 to-blue-600",
  quimica: "from-green-500 to-green-600",
  matematica: "from-purple-500 to-purple-600",
  razonamiento: "from-orange-500 to-orange-600",
  default: "from-primary to-tesla-blue-light",
};

export const CourseCard = ({
  id,
  name,
  icon,
  progress,
  totalLessons,
  completedLessons,
  onViewMaterial,
}: CourseCardProps) => {
  const Icon = iconMap[icon] || iconMap.default;
  const gradientColor = colorMap[icon] || colorMap.default;

  const mapExpToProgress = (value: number) => {
    const clamped = Math.max(0, value);
    if (clamped >= 3750) {
      const span = Math.min(clamped, 5000) - 3750;
      return Math.min(75 + (span / 1250) * 25, 100);
    }
    if (clamped >= 2500) return 50 + ((clamped - 2500) / 1250) * 25;
    if (clamped >= 1250) return 25 + ((clamped - 1250) / 1250) * 25;
    return (clamped / 1250) * 25;
  };

  const derivedExp = Math.round((progress / 100) * 5000);

  return (
    <div className="card-tesla p-6 group animate-fade-in">
      {/* Icon & Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
          gradientColor
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {completedLessons}/{totalLessons} lecciones
        </span>
      </div>

      {/* Course Name */}
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {name}
      </h3>

      {/* Progress Section with 3D Character */}
      <div className="mb-4 flex items-center gap-4">
        {/* 3D Character */}
        <div className="flex-shrink-0">
          <StudentDinoGif 
            exp={derivedExp}
            progressPercent={mapExpToProgress(derivedExp)} 
            size="sm" 
            showProgressText={false}
          />
        </div>
        
        {/* Traditional Progress Info */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progreso</span>
            <span className="text-sm font-semibold text-primary">{progress}%</span>
          </div>
          <div className="progress-tesla h-2">
            <div
              className="progress-tesla-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-center">
            {progress < 25 && "🥚 Comenzando"}
            {progress >= 25 && progress < 50 && "🐣 Creciendo"}
            {progress >= 50 && progress < 75 && "🐤 Avanzando"}
            {progress >= 75 && "😊 ¡Experto!"}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onViewMaterial(id)}
        className="w-full btn-tesla-accent group-hover:shadow-lg"
      >
        <FileText className="w-4 h-4 mr-2" />
        Ver Material
      </Button>
    </div>
  );
};
