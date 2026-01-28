import { Crown, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingEntry {
  position: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
  trend: "up" | "down" | "same";
}

interface RankingWidgetProps {
  rankings: RankingEntry[];
  userPosition: number;
  totalStudents: number;
}

export const RankingWidget = ({ rankings, userPosition, totalStudents }: RankingWidgetProps) => {
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="card-tesla p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Ranking de la Academia</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          Tu posición: <span className="font-bold text-primary">#{userPosition}</span> de {totalStudents}
        </span>
      </div>

      <div className="space-y-2">
        {rankings.map((entry) => (
          <div
            key={entry.position}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all",
              entry.isCurrentUser
                ? "bg-primary/10 border border-primary/20"
                : "bg-secondary/50 hover:bg-secondary"
            )}
          >
            <div className="flex items-center gap-3">
              {entry.position <= 3 ? (
                <Medal className={cn("w-6 h-6", getMedalColor(entry.position))} />
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {entry.position}
                </span>
              )}
              <span className={cn(
                "font-medium",
                entry.isCurrentUser ? "text-primary" : "text-foreground"
              )}>
                {entry.name}
                {entry.isCurrentUser && " (Tú)"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {getTrendIcon(entry.trend)}
              <span className="font-bold text-foreground">{entry.points} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
