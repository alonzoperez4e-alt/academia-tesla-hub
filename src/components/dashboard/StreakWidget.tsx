import { Flame, Calendar, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: number[];
  totalPoints: number;
}

export const StreakWidget = ({ 
  currentStreak, 
  longestStreak, 
  weeklyProgress,
  totalPoints 
}: StreakWidgetProps) => {
  const daysOfWeek = ["L", "M", "M", "J", "V", "S", "D"];
  
  return (
    <div className="card-tesla p-4 lg:p-6 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Racha actual</p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Mejor racha</p>
          </div>
        </div>

        {/* Total Points */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-tesla-blue-light flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">Puntos totales</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Progreso semanal</span>
          </div>
          <div className="flex gap-1">
            {weeklyProgress.map((completed, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                    completed === 1
                      ? "bg-success text-white shadow-md"
                      : completed === 0.5
                      ? "bg-accent/50 text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {completed === 1 ? "✓" : daysOfWeek[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
