import { BookOpen, Lock, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LessonNode {
  id: string;
  type: "leccion";
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  exp: number;
  completionRate: number;
}

interface WeekSection {
  week: number;
  title: string;
  isUnlocked: boolean;
  lessons: LessonNode[];
}

interface LearningPathProps {
  weeks: WeekSection[];
  currentWeek: number;
  onNodeClick: (nodeId: string, weekNumber: number) => void;
}

export const LearningPath = ({ weeks, currentWeek, onNodeClick }: LearningPathProps) => {
  return (
    <div className="relative py-8 px-4 pt-4">
      {weeks.map((weekSection, weekIndex) => (
        <div key={weekSection.week} className="relative mb-20" style={{ 
          position: 'relative',
          isolation: 'isolate'
        }}>
          {/* ====== WEEK HEADER (Independiente del timeline) ====== */}
          <div className={cn(
            "week-header mb-10 sm:mb-14 pb-6 sm:pb-8",
            !weekSection.isUnlocked && "opacity-50"
          )}>
            <div className="flex items-center justify-center gap-2 sm:gap-3 sticky top-[7rem] sm:top-24 z-10 py-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className={cn(
                "relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-lg transition-all whitespace-nowrap backdrop-blur-sm",
                weekSection.isUnlocked
                  ? "bg-gradient-to-r from-primary to-tesla-blue-light text-white"
                  : "bg-muted text-muted-foreground"
              )}>
                {!weekSection.isUnlocked && <Lock className="w-4 h-4" />}
                <span>Semana {weekSection.week}</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-border via-transparent to-transparent" />
            </div>
          </div>

          {/* ====== WEEK TIMELINE (Separado del header) ====== */}
          <div className="week-timeline relative max-w-md mx-auto pt-8 sm:pt-12">
            {/* Connecting Line */}
            <div className={cn(
              "absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full",
              weekSection.isUnlocked 
                ? "bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" 
                : "bg-muted"
            )} />

            {weekSection.lessons.map((lesson, lessonIndex) => {
              const isLeft = lessonIndex % 2 === 0;

              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "relative flex items-center gap-4 mb-8",
                    isLeft ? "flex-row" : "flex-row-reverse"
                  )}
                  style={{ animationDelay: `${lessonIndex * 0.1}s` }}
                >
                  {/* Content Card */}
                  <div className={cn(
                    "flex-1 transition-all duration-300",
                    isLeft ? "text-right pr-4" : "text-left pl-4",
                    lesson.isLocked && "opacity-50"
                  )}>
                    <div className={cn(
                      "inline-block p-4 rounded-2xl bg-card border-2 transition-all duration-300 w-full max-w-[220px]",
                      lesson.isCurrent && !lesson.isLocked
                        ? "border-primary shadow-lg shadow-primary/20 scale-105"
                        : lesson.isCompleted
                        ? "border-success/50"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    )}>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2",
                        lesson.isCompleted 
                          ? "bg-success/20 text-success" 
                          : "bg-primary/10 text-primary"
                      )}>
                        Lección • +{lesson.exp} EXP
                      </span>
                      <h3 className={cn(
                        "font-semibold mb-1 text-sm",
                        lesson.isCompleted ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {lesson.description}
                      </p>
                      
                      {/* Progress Bar */}
                      {lesson.isCompleted && (
                        <div className="space-y-1">
                          <Progress value={lesson.completionRate} className="h-1.5" />
                          <p className="text-xs text-success">{lesson.completionRate}% completado</p>
                        </div>
                      )}
                      
                      {!lesson.isCompleted && !lesson.isLocked && (
                        <p className="text-xs text-primary font-medium">
                          {lesson.isCurrent ? "Continuar" : "Iniciar quiz"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center Node Circle */}
                  <button
                    onClick={() => !lesson.isLocked && onNodeClick(lesson.id, weekSection.week)}
                    disabled={lesson.isLocked}
                    className={cn(
                      "relative z-20 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300",
                      "bg-gradient-to-br shadow-lg",
                      lesson.isLocked
                        ? "from-muted to-muted/80 cursor-not-allowed"
                        : lesson.isCompleted
                        ? "from-success to-green-600 shadow-green-500/30 hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer"
                        : "from-primary to-tesla-blue-light shadow-primary/30 hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer",
                      lesson.isCurrent && !lesson.isLocked && "ring-4 ring-white ring-offset-2 ring-offset-background animate-pulse"
                    )}
                  >
                    {lesson.isLocked ? (
                      <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" />
                    ) : lesson.isCompleted ? (
                      <Check className="w-6 h-6 lg:w-8 lg:h-8 text-white" strokeWidth={3} />
                    ) : lesson.isCurrent ? (
                      <Play className="w-6 h-6 lg:w-8 lg:h-8 text-white ml-1" fill="white" />
                    ) : (
                      <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
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
