import { useState } from "react";
import { Flame, Gem, Heart, Zap, ChevronDown, Search, MessageSquare, Calculator, Atom, FlaskConical, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Course {
  id: string;
  name: string;
  icon: "comunicacion" | "matematica" | "fisica" | "quimica" | "razonamiento";
  color: string;
}

interface GamifiedStatusBarProps {
  userName: string;
  userCode: string;
  currentStreak: number;
  gems: number;
  lives: number;
  maxLives: number;
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const courses: Course[] = [
  { id: "comunicacion", name: "Comunicación", icon: "comunicacion", color: "from-purple-500 to-purple-600" },
  { id: "matematica", name: "Matemáticas", icon: "matematica", color: "from-blue-500 to-blue-600" },
  { id: "fisica", name: "Física", icon: "fisica", color: "from-cyan-500 to-cyan-600" },
  { id: "quimica", name: "Química", icon: "quimica", color: "from-green-500 to-green-600" },
  { id: "razonamiento", name: "Razonamiento", icon: "razonamiento", color: "from-orange-500 to-orange-600" },
];

const iconMap = {
  comunicacion: MessageSquare,
  matematica: Calculator,
  fisica: Atom,
  quimica: FlaskConical,
  razonamiento: Brain,
};

export const GamifiedStatusBar = ({
  userName,
  userCode,
  currentStreak,
  gems,
  lives,
  maxLives,
  selectedCourse,
  onCourseChange,
  searchValue,
  onSearchChange,
}: GamifiedStatusBarProps) => {
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  
  const currentCourse = courses.find(c => c.id === selectedCourse) || courses[0];
  const CourseIcon = iconMap[currentCourse.icon];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-3 py-2 lg:px-6 lg:py-3">
        {/* Course Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCourseMenu(!showCourseMenu)}
            className={cn(
              "flex items-center gap-2 p-2 lg:p-3 rounded-2xl transition-all duration-200",
              "bg-gradient-to-br shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
              currentCourse.color
            )}
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CourseIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-white/80 transition-transform duration-200",
              showCourseMenu && "rotate-180"
            )} />
          </button>

          {/* Course Dropdown Menu */}
          {showCourseMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowCourseMenu(false)} 
              />
              <div className="absolute top-full left-0 mt-2 bg-card rounded-2xl shadow-xl border border-border p-2 z-20 min-w-[200px] animate-scale-in">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Seleccionar Curso
                </p>
                {courses.map((course) => {
                  const Icon = iconMap[course.icon];
                  const isActive = course.id === selectedCourse;
                  return (
                    <button
                      key={course.id}
                      onClick={() => {
                        onCourseChange(course.id);
                        setShowCourseMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-secondary text-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                        course.color
                      )}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium">{course.name}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Gamification Counters */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
            <div className="relative">
              <Flame className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-sm lg:text-base text-orange-600">{currentStreak}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl border border-primary/20">
            <Gem className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            <span className="font-bold text-sm lg:text-base text-primary">{gems}</span>
          </div>

          {/* Lives */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl border border-red-500/20">
            <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-red-500 fill-red-500" />
            <span className="font-bold text-sm lg:text-base text-red-600">{lives}/{maxLives}</span>
          </div>

          {/* Search (Desktop only) */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-48 rounded-2xl border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* User Identity (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userCode}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-tesla-blue-light flex items-center justify-center text-white font-bold shadow-lg">
            {userName.charAt(0)}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar temas o materiales..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-2xl border-2 border-border focus:border-primary"
          />
        </div>
      </div>
    </header>
  );
};
