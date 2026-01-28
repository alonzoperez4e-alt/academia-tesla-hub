import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  XCircle, 
  ClipboardCheck, 
  Brain, 
  Lightbulb, 
  Target,
  TrendingUp,
  Calendar,
  Award,
  Construction,
  Flame,
  Trophy,
  Lock,
  Check,
  Video,
  Dumbbell,
  Star,
  Package,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UserData {
  code: string;
  name: string;
  role: string;
  studentCode?: string;
  studentName?: string;
}

const mockStudentData = {
  attendanceToday: true,
  lastExamScore: 85,
  lastExamDate: "2024-01-20",
  skills: [
    { name: "Memoria", level: 75, icon: Brain },
    { name: "Análisis", level: 60, icon: Lightbulb },
    { name: "Razonamiento", level: 80, icon: Target },
  ],
  weeklyAttendance: [true, true, false, true, true, false, false],
  recentExams: [
    { name: "Comunicación - Semana 3", score: 85, date: "2024-01-20" },
    { name: "Comunicación - Semana 2", score: 78, date: "2024-01-13" },
    { name: "Comunicación - Semana 1", score: 90, date: "2024-01-06" },
  ],
  currentStreak: 7,
  academyRank: 12,
  totalStudents: 45,
  gems: 1850,
};

// Simplified path for parent view
const mockStudentPath = [
  { week: 1, title: "Fundamentos", completed: 4, total: 4, isUnlocked: true },
  { week: 2, title: "Ortografía", completed: 2, total: 4, isUnlocked: true },
  { week: 3, title: "Análisis Textual", completed: 0, total: 4, isUnlocked: false },
  { week: 4, title: "Redacción", completed: 0, total: 4, isUnlocked: false },
  { week: 5, title: "Comprensión Avanzada", completed: 0, total: 4, isUnlocked: false },
  { week: 6, title: "Literatura", completed: 0, total: 4, isUnlocked: false },
  { week: 7, title: "Argumentación", completed: 0, total: 4, isUnlocked: false },
  { week: 8, title: "Repaso Final", completed: 0, total: 4, isUnlocked: false },
];

const nodeTypeIcons = {
  teoria: Video,
  practica: Dumbbell,
  examen: Star,
  recompensa: Package,
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"progreso" | "camino">("progreso");
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "padre") {
      navigate("/login");
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null;

  const daysOfWeek = ["L", "M", "M", "J", "V", "S", "D"];

  const renderProgressView = () => (
    <>
      {/* Student Info Header */}
      <div className="bg-gradient-to-r from-primary to-tesla-blue-light rounded-3xl p-6 mb-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
              {user.studentName?.charAt(0) || "A"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user.studentName}
              </h2>
              <p className="text-white/80">
                Código: <span className="font-medium">{user.studentCode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <Flame className="w-6 h-6 text-orange-400" />
                <p className="text-2xl font-bold">{mockStudentData.currentStreak}</p>
              </div>
              <p className="text-xs text-white/80">Días de racha</p>
            </div>
            <div className="h-10 w-px bg-white/30" />
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <p className="text-2xl font-bold">#{mockStudentData.academyRank}</p>
              </div>
              <p className="text-xs text-white/80">Ranking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Attendance */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Asistencia de Hoy</h3>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
            {mockStudentData.attendanceToday ? (
              <>
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold text-success">Presente</p>
                  <p className="text-sm text-muted-foreground">Asistió a clases</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold text-destructive">Ausente</p>
                  <p className="text-sm text-muted-foreground">No asistió</p>
                </div>
              </>
            )}
          </div>
          {/* Weekly Attendance */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Asistencia semanal</p>
            <div className="flex gap-2">
              {mockStudentData.weeklyAttendance.map((attended, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium transition-all",
                    attended
                      ? "bg-success text-white shadow-md"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {daysOfWeek[index]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Last Exam Score */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Último Examen</h3>
            <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-secondary"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${mockStudentData.lastExamScore * 2.26} 226`}
                  strokeLinecap="round"
                  className={cn(
                    mockStudentData.lastExamScore >= 70 ? "text-success" : "text-destructive"
                  )}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                {mockStudentData.lastExamScore}
              </span>
            </div>
            <div>
              <p className={cn(
                "text-lg font-bold",
                mockStudentData.lastExamScore >= 70 ? "text-success" : "text-destructive"
              )}>
                {mockStudentData.lastExamScore >= 90 ? "Excelente" :
                 mockStudentData.lastExamScore >= 70 ? "Aprobado" : "Necesita mejorar"}
              </p>
              <p className="text-sm text-muted-foreground">
                {mockStudentData.lastExamDate}
              </p>
            </div>
          </div>
          {/* Trend */}
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">
              +7 puntos respecto al examen anterior
            </span>
          </div>
        </div>

        {/* Skills in Development */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Habilidades en Desarrollo</h3>
            <Award className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {mockStudentData.skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-tesla-blue-light rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Exámenes</h3>
        <div className="space-y-3">
          {mockStudentData.recentExams.map((exam, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl"
            >
              <div>
                <p className="font-medium text-foreground">{exam.name}</p>
                <p className="text-sm text-muted-foreground">{exam.date}</p>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-full text-sm font-bold",
                exam.score >= 70 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {exam.score}/100
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderPathView = () => (
    <div className="max-w-2xl mx-auto">
      {/* Path Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Camino de Aprendizaje
        </h2>
        <p className="text-muted-foreground">
          Progreso de {user.studentName} en Comunicación
        </p>
      </div>

      {/* Simplified Path */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent rounded-full" />

        <div className="space-y-4">
          {mockStudentPath.map((week, index) => {
            const progress = (week.completed / week.total) * 100;
            const isComplete = week.completed === week.total;
            
            return (
              <div
                key={week.week}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-2xl transition-all",
                  week.isUnlocked 
                    ? "bg-card border border-border shadow-md" 
                    : "bg-muted/50 opacity-60"
                )}
              >
                {/* Week Circle */}
                <div className={cn(
                  "relative z-10 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg",
                  isComplete
                    ? "bg-success text-white"
                    : week.isUnlocked
                    ? "bg-gradient-to-br from-primary to-tesla-blue-light text-white"
                    : "bg-muted text-muted-foreground"
                )}>
                  {week.isUnlocked ? (
                    isComplete ? (
                      <Check className="w-8 h-8" strokeWidth={3} />
                    ) : (
                      <span>{week.week}</span>
                    )
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>

                {/* Week Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Semana {week.week}: {week.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {week.completed} de {week.total} lecciones completadas
                  </p>
                  {week.isUnlocked && (
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isComplete
                            ? "bg-success"
                            : "bg-gradient-to-r from-primary to-tesla-blue-light"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium",
                  isComplete
                    ? "bg-success/10 text-success"
                    : week.isUnlocked && week.completed > 0
                    ? "bg-primary/10 text-primary"
                    : week.isUnlocked
                    ? "bg-secondary text-muted-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isComplete 
                    ? "Completada" 
                    : week.isUnlocked && week.completed > 0
                    ? "En progreso"
                    : week.isUnlocked
                    ? "Disponible"
                    : "Bloqueada"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Portal de Padres</h1>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.code}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 py-3 border-t border-border/50">
          {[
            { id: "progreso" as const, label: "Progreso" },
            { id: "camino" as const, label: "Camino de Aprendizaje" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-2 rounded-2xl font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        {activeTab === "progreso" ? renderProgressView() : renderPathView()}
      </main>
    </div>
  );
};

export default ParentDashboard;
