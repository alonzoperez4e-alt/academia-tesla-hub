import { BookOpen, Gamepad2, ClipboardCheck, CheckCircle2, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommunicationCardProps {
  id: string;
  type: "teoria" | "practica" | "simulacro";
  title: string;
  description: string;
  progress: number;
  isLocked?: boolean;
  onStart: (id: string) => void;
}

const typeConfig = {
  teoria: {
    icon: BookOpen,
    gradient: "from-blue-500 to-blue-600",
    label: "Teoría",
    buttonText: "Estudiar",
  },
  practica: {
    icon: Gamepad2,
    gradient: "from-green-500 to-green-600",
    label: "Práctica Interactiva",
    buttonText: "Practicar",
  },
  simulacro: {
    icon: ClipboardCheck,
    gradient: "from-orange-500 to-red-500",
    label: "Simulacro Diario",
    buttonText: "Iniciar Examen",
  },
};

export const CommunicationCard = ({
  id,
  type,
  title,
  description,
  progress,
  isLocked = false,
  onStart,
}: CommunicationCardProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;
  const isCompleted = progress === 100;

  return (
    <div className={cn(
      "card-tesla p-6 group animate-fade-in relative overflow-hidden",
      isLocked && "opacity-60"
    )}>
      {isLocked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Completa la sección anterior</p>
          </div>
        </div>
      )}

      {/* Badge */}
      <div className="flex items-start justify-between mb-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r",
          config.gradient
        )}>
          {config.label}
        </span>
        {isCompleted && (
          <CheckCircle2 className="w-6 h-6 text-success" />
        )}
      </div>

      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-4",
        config.gradient
      )}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Progress */}
      <div className="mb-4">
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
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onStart(id)}
        disabled={isLocked}
        className={cn(
          "w-full group-hover:shadow-lg",
          isCompleted ? "btn-tesla" : "btn-tesla-accent"
        )}
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Repasar
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            {config.buttonText}
          </>
        )}
      </Button>
    </div>
  );
};
