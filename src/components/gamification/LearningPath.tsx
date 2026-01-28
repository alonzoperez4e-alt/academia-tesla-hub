import { Video, Dumbbell, Star, Package, Lock, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathNode {
  id: string;
  type: "teoria" | "practica" | "examen" | "recompensa";
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  exp: number;
}

interface WeekSection {
  week: number;
  title: string;
  isUnlocked: boolean;
  nodes: PathNode[];
}

interface LearningPathProps {
  weeks: WeekSection[];
  currentWeek: number;
  onNodeClick: (nodeId: string, weekNumber: number) => void;
}

const nodeConfig = {
  teoria: {
    icon: Video,
    gradient: "from-blue-400 to-blue-600",
    bgGlow: "shadow-blue-500/30",
    label: "Teoría",
  },
  practica: {
    icon: Dumbbell,
    gradient: "from-green-400 to-green-600",
    bgGlow: "shadow-green-500/30",
    label: "Práctica",
  },
  examen: {
    icon: Star,
    gradient: "from-accent to-yellow-600",
    bgGlow: "shadow-yellow-500/30",
    label: "Examen",
  },
  recompensa: {
    icon: Package,
    gradient: "from-purple-400 to-purple-600",
    bgGlow: "shadow-purple-500/30",
    label: "Recompensa",
  },
};

export const LearningPath = ({ weeks, currentWeek, onNodeClick }: LearningPathProps) => {
  return (
    <div className="relative py-8 px-4">
      {weeks.map((weekSection, weekIndex) => (
        <div key={weekSection.week} className="relative mb-12">
          {/* Week Header */}
          <div className={cn(
            "flex items-center justify-center gap-3 mb-8 sticky top-20 z-10",
            !weekSection.isUnlocked && "opacity-50"
          )}>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg shadow-lg transition-all",
              weekSection.isUnlocked
                ? "bg-gradient-to-r from-primary to-tesla-blue-light text-white"
                : "bg-muted text-muted-foreground"
            )}>
              {!weekSection.isUnlocked && <Lock className="w-4 h-4" />}
              <span>Semana {weekSection.week}</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-border via-transparent to-transparent" />
          </div>

          {/* Path Nodes */}
          <div className="relative max-w-md mx-auto">
            {/* Connecting Line */}
            <div className={cn(
              "absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full",
              weekSection.isUnlocked 
                ? "bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" 
                : "bg-muted"
            )} />

            {weekSection.nodes.map((node, nodeIndex) => {
              const config = nodeConfig[node.type];
              const Icon = config.icon;
              const isLeft = nodeIndex % 2 === 0;

              return (
                <div
                  key={node.id}
                  className={cn(
                    "relative flex items-center gap-4 mb-8",
                    isLeft ? "flex-row" : "flex-row-reverse"
                  )}
                  style={{ animationDelay: `${nodeIndex * 0.1}s` }}
                >
                  {/* Content Card */}
                  <div className={cn(
                    "flex-1 transition-all duration-300",
                    isLeft ? "text-right pr-4" : "text-left pl-4",
                    node.isLocked && "opacity-50"
                  )}>
                    <div className={cn(
                      "inline-block p-4 rounded-2xl bg-card border-2 transition-all duration-300",
                      node.isCurrent && !node.isLocked
                        ? "border-primary shadow-lg shadow-primary/20 scale-105"
                        : node.isCompleted
                        ? "border-success/50"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    )}>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2",
                        node.isCompleted 
                          ? "bg-success/20 text-success" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {config.label} • +{node.exp} EXP
                      </span>
                      <h3 className={cn(
                        "font-semibold mb-1",
                        node.isCompleted ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {node.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {node.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Node Circle */}
                  <button
                    onClick={() => !node.isLocked && onNodeClick(node.id, weekSection.week)}
                    disabled={node.isLocked}
                    className={cn(
                      "relative z-10 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300",
                      "bg-gradient-to-br shadow-lg",
                      node.isLocked
                        ? "from-muted to-muted/80 cursor-not-allowed"
                        : cn(config.gradient, config.bgGlow, "hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer"),
                      node.isCurrent && !node.isLocked && "ring-4 ring-white ring-offset-2 ring-offset-background animate-pulse"
                    )}
                  >
                    {node.isLocked ? (
                      <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" />
                    ) : node.isCompleted ? (
                      <Check className="w-6 h-6 lg:w-8 lg:h-8 text-white" strokeWidth={3} />
                    ) : node.isCurrent ? (
                      <Play className="w-6 h-6 lg:w-8 lg:h-8 text-white ml-1" fill="white" />
                    ) : (
                      <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    )}
                  </button>

                  {/* Spacer for alignment */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
