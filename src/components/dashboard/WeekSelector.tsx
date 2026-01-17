import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekSelectorProps {
  weeks: number[];
  selectedWeek: number;
  onWeekSelect: (week: number) => void;
}

export const WeekSelector = ({ weeks, selectedWeek, onWeekSelect }: WeekSelectorProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
      </button>
      
      <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide">
        {weeks.map((week) => (
          <button
            key={week}
            onClick={() => onWeekSelect(week)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap",
              selectedWeek === week
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Semana {week}
          </button>
        ))}
      </div>

      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
};
