import { Trophy, User, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: "path" | "ranking" | "interaction" | "profile";
  onTabChange: (tab: "path" | "ranking" | "interaction" | "profile") => void;
}

const navItems = [
  { id: "path" as const, icon: BookOpen, label: "Camino" },
  { id: "ranking" as const, icon: Trophy, label: "Ranking" },
  { id: "interaction" as const, icon: Users, label: "Interacción" },
  { id: "profile" as const, icon: User, label: "Perfil" },
];

export const MobileBottomNav = ({ 
  activeTab, 
  onTabChange
}: MobileBottomNavProps) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-2xl transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
              </div>
              
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-2 w-8 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
