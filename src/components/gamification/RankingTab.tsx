import { Crown, Medal, Trophy, TrendingUp, TrendingDown, Minus, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingEntry {
  position: number;
  name: string;
  avatar?: string;
  exp: number;
  isCurrentUser?: boolean;
  trend: "up" | "down" | "same";
  previousPosition?: number;
}

interface RankingTabProps {
  rankings: RankingEntry[];
  userPosition: number;
  userPreviousPosition: number;
  totalStudents: number;
}

export const RankingTab = ({ 
  rankings, 
  userPosition, 
  userPreviousPosition,
  totalStudents 
}: RankingTabProps) => {
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  const getTrophyColor = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-400 to-amber-500";
      case 2: return "from-gray-300 to-gray-400";
      case 3: return "from-amber-600 to-orange-700";
      default: return "from-muted to-muted";
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-success" />;
      case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const positionChange = userPreviousPosition - userPosition;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-yellow-500/20 rounded-full mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="font-semibold text-accent-foreground">Ranking Semanal</span>
        </div>
        
        {/* User's Position Summary */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
          <p className="text-muted-foreground mb-2">Tu posición esta semana</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl font-bold text-primary">#{userPosition}</span>
            <div className="text-left">
              <div className="flex items-center gap-2">
                {positionChange > 0 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-success" />
                    <span className="text-success font-medium">+{positionChange} puestos</span>
                  </>
                ) : positionChange < 0 ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-destructive" />
                    <span className="text-destructive font-medium">{positionChange} puestos</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Mismo puesto</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                La semana pasada: #{userPreviousPosition}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center mb-2 shadow-lg",
              getTrophyColor(2)
            )}>
              <span className="text-white font-bold text-xl">
                {top3[1].name.charAt(0)}
              </span>
            </div>
            <Medal className="w-8 h-8 text-gray-400 mb-1" />
            <p className="font-semibold text-sm text-center max-w-[80px] truncate">{top3[1].name}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Gem className="w-3 h-3 text-primary" />
              {top3[1].exp}
            </div>
            <div className="w-20 h-24 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <div className="flex flex-col items-center -mt-8">
            <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
            <div className={cn(
              "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mb-2 shadow-xl ring-4 ring-yellow-400/50",
              getTrophyColor(1)
            )}>
              <span className="text-white font-bold text-2xl">
                {top3[0].name.charAt(0)}
              </span>
            </div>
            <p className="font-bold text-center max-w-[100px] truncate">{top3[0].name}</p>
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              <Gem className="w-4 h-4" />
              {top3[0].exp}
            </div>
            <div className="w-24 h-32 bg-gradient-to-t from-yellow-500 to-amber-400 rounded-t-lg mt-2 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">1</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center mb-2 shadow-lg",
              getTrophyColor(3)
            )}>
              <span className="text-white font-bold text-xl">
                {top3[2].name.charAt(0)}
              </span>
            </div>
            <Medal className="w-8 h-8 text-amber-600 mb-1" />
            <p className="font-semibold text-sm text-center max-w-[80px] truncate">{top3[2].name}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Gem className="w-3 h-3 text-primary" />
              {top3[2].exp}
            </div>
            <div className="w-20 h-20 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Rest of Rankings */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {rest.map((entry, index) => (
          <div
            key={entry.position}
            className={cn(
              "flex items-center gap-4 p-4 transition-all",
              entry.isCurrentUser && "bg-primary/10 border-l-4 border-primary",
              index < rest.length - 1 && "border-b border-border"
            )}
          >
            <span className="w-8 text-center font-bold text-muted-foreground">
              {entry.position}
            </span>
            
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-tesla-blue-light flex items-center justify-center text-white font-bold shadow-md">
              {entry.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <p className={cn(
                "font-semibold",
                entry.isCurrentUser && "text-primary"
              )}>
                {entry.name}
                {entry.isCurrentUser && " (Tú)"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {getTrendIcon(entry.trend)}
              <div className="flex items-center gap-1 font-bold text-foreground">
                <Gem className="w-4 h-4 text-primary" />
                {entry.exp}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        {totalStudents} estudiantes en la academia
      </p>
    </div>
  );
};
