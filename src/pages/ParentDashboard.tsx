import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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
  Construction
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
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
  currentStreak: 5,
  academyRank: 12,
  totalStudents: 45,
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("progreso");
  const [user, setUser] = useState<User | null>(null);

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

  if (!user) return null;

  const daysOfWeek = ["L", "M", "M", "J", "V", "S", "D"];

  // Render coming soon view for disabled items
  const renderComingSoon = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <Construction className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Próximamente
      </h2>
      <p className="text-muted-foreground max-w-md">
        Esta sección estará disponible en las siguientes actualizaciones. 
        ¡Mantente atento!
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar
        role="parent"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName={user.name}
        userCode={user.code}
      />

      <div className="flex-1 w-full transition-all duration-300">
        <Header 
          userName={user.name.split(" ")[0]} 
          showSearch={false}
        />

        <main className="p-4 lg:p-6">
          {activeItem === "progreso" ? (
            <>
              {/* Student Info Header */}
              <div className="card-tesla p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Progreso de {user.studentName}
                    </h2>
                    <p className="text-muted-foreground">
                      Código: <span className="font-medium text-primary">{user.studentCode}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">#{mockStudentData.academyRank}</p>
                      <p className="text-xs text-muted-foreground">Ranking Academia</p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">{mockStudentData.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">Días de racha</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Today's Attendance */}
                <div className="card-tesla p-6">
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
                          <p className="text-sm text-muted-foreground">El alumno asistió a clases</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                          <XCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-destructive">Ausente</p>
                          <p className="text-sm text-muted-foreground">No se registró asistencia</p>
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
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium",
                            attended
                              ? "bg-success text-white"
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
                <div className="card-tesla p-6">
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
                <div className="card-tesla p-6">
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
                          <div className="progress-tesla h-2">
                            <div
                              className="progress-tesla-fill"
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
              <div className="card-tesla p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Exámenes</h3>
                <div className="space-y-3">
                  {mockStudentData.recentExams.map((exam, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{exam.name}</p>
                        <p className="text-sm text-muted-foreground">{exam.date}</p>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold",
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
          ) : (
            renderComingSoon()
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
