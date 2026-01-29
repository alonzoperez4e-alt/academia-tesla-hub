import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GamifiedStatusBar } from "@/components/gamification/GamifiedStatusBar";
import { LearningPath } from "@/components/gamification/LearningPath";
import { RankingTab } from "@/components/gamification/RankingTab";
import { MobileBottomNav } from "@/components/gamification/MobileBottomNav";
import { StreakMascot } from "@/components/gamification/StreakMascot";
import { QuizModal, QuizQuestion } from "@/components/student/QuizModal";
import { Construction, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Mock data for lessons with quizzes
const mockLessons: Record<string, { 
  id: string; 
  title: string; 
  description: string; 
  questions: QuizQuestion[]; 
  completedAttempts: number;
  bestScore: number;
  totalQuestions: number;
}> = {
  "w1-leccion1": {
    id: "w1-leccion1",
    title: "Comprensión Lectora I",
    description: "Técnicas fundamentales para analizar textos.",
    completedAttempts: 2,
    bestScore: 8,
    totalQuestions: 10,
    questions: [
      {
        id: "q1",
        text: "¿Cuál es el sinónimo de 'efímero'?",
        options: ["Eterno", "Pasajero", "Sólido", "Firme"],
        correctAnswer: 1,
        solutionText: "Efímero significa que dura poco tiempo, por lo tanto su sinónimo es 'Pasajero'.",
      },
      {
        id: "q2",
        text: "Identifica el tipo de texto: 'La receta indica mezclar todos los ingredientes...'",
        options: ["Narrativo", "Instructivo", "Descriptivo", "Argumentativo"],
        correctAnswer: 1,
        solutionText: "Es un texto instructivo porque da indicaciones paso a paso.",
      },
      {
        id: "q3",
        text: "¿Qué figura literaria se usa en 'El viento susurraba secretos'?",
        options: ["Metáfora", "Símil", "Personificación", "Hipérbole"],
        correctAnswer: 2,
        solutionText: "Es personificación porque se le atribuye una acción humana (susurrar) a un elemento no humano (el viento).",
      },
    ],
  },
  "w1-leccion2": {
    id: "w1-leccion2",
    title: "Comprensión Lectora II",
    description: "Análisis de textos más complejos.",
    completedAttempts: 1,
    bestScore: 9,
    totalQuestions: 10,
    questions: [
      {
        id: "q4",
        text: "¿Cuál es el antónimo de 'prolijo'?",
        options: ["Ordenado", "Descuidado", "Meticuloso", "Esmerado"],
        correctAnswer: 1,
        solutionText: "Prolijo significa cuidadoso y detallado, su antónimo es 'Descuidado'.",
      },
      {
        id: "q5",
        text: "El texto que busca convencer al lector es de tipo:",
        options: ["Narrativo", "Expositivo", "Argumentativo", "Descriptivo"],
        correctAnswer: 2,
        solutionText: "Los textos argumentativos buscan persuadir o convencer al lector de una postura.",
      },
    ],
  },
  "w2-leccion1": {
    id: "w2-leccion1",
    title: "Reglas Ortográficas",
    description: "Domina las reglas esenciales de ortografía.",
    completedAttempts: 0,
    bestScore: 0,
    totalQuestions: 10,
    questions: [
      {
        id: "q6",
        text: "¿Cuál palabra está correctamente escrita?",
        options: ["Excelente", "Exelente", "Excellente", "Ecselente"],
        correctAnswer: 0,
      },
      {
        id: "q7",
        text: "Las palabras agudas llevan tilde cuando:",
        options: ["Siempre", "Terminan en n, s o vocal", "Nunca", "Terminan en consonante"],
        correctAnswer: 1,
        solutionText: "Las palabras agudas llevan tilde cuando terminan en n, s o vocal.",
      },
    ],
  },
};

// Mock week sections with lessons
const mockWeekSections = [
  {
    week: 1,
    title: "Fundamentos de Comunicación",
    isUnlocked: true,
    lessons: [
      {
        id: "w1-leccion1",
        type: "leccion" as const,
        title: "Comprensión Lectora I",
        description: "Técnicas fundamentales para analizar textos.",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 50,
        completionRate: 80,
      },
      {
        id: "w1-leccion2",
        type: "leccion" as const,
        title: "Comprensión Lectora II",
        description: "Análisis de textos más complejos.",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 75,
        completionRate: 90,
      },
    ],
  },
  {
    week: 2,
    title: "Ortografía y Redacción",
    isUnlocked: true,
    lessons: [
      {
        id: "w2-leccion1",
        type: "leccion" as const,
        title: "Reglas Ortográficas",
        description: "Domina las reglas esenciales de ortografía.",
        isCompleted: false,
        isLocked: false,
        isCurrent: true,
        exp: 50,
        completionRate: 0,
      },
      {
        id: "w2-leccion2",
        type: "leccion" as const,
        title: "Práctica de Redacción",
        description: "Ejercicios para mejorar tu escritura.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
        completionRate: 0,
      },
    ],
  },
  {
    week: 3,
    title: "Análisis Textual",
    isUnlocked: false,
    lessons: [
      {
        id: "w3-leccion1",
        type: "leccion" as const,
        title: "Tipos de Texto",
        description: "Aprende a identificar diferentes tipos de textos.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 50,
        completionRate: 0,
      },
      {
        id: "w3-leccion2",
        type: "leccion" as const,
        title: "Análisis Práctico",
        description: "Ejercicios de análisis textual.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
        completionRate: 0,
      },
    ],
  },
];

// Generate locked weeks 4-8
for (let w = 4; w <= 8; w++) {
  mockWeekSections.push({
    week: w,
    title: `Semana ${w}`,
    isUnlocked: false,
    lessons: [
      {
        id: `w${w}-leccion1`,
        type: "leccion" as const,
        title: "Lección 1",
        description: "Contenido teórico.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 50,
        completionRate: 0,
      },
      {
        id: `w${w}-leccion2`,
        type: "leccion" as const,
        title: "Lección 2",
        description: "Práctica interactiva.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
        completionRate: 0,
      },
    ],
  });
}

const mockRankings = [
  { position: 1, name: "Ana Martínez", exp: 2450, trend: "same" as const },
  { position: 2, name: "Luis García", exp: 2380, trend: "up" as const },
  { position: 3, name: "María Fernández", exp: 2310, trend: "down" as const },
  { position: 4, name: "Carlos Rodríguez", exp: 2250, isCurrentUser: true, trend: "up" as const },
  { position: 5, name: "Pedro Sánchez", exp: 2180, trend: "down" as const },
  { position: 6, name: "Laura Díaz", exp: 2100, trend: "up" as const },
  { position: 7, name: "Jorge Ruiz", exp: 2050, trend: "same" as const },
  { position: 8, name: "Carmen López", exp: 1980, trend: "down" as const },
];

interface User {
  code: string;
  name: string;
  role: string;
  area?: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"path" | "ranking" | "profile" | "notifications">("path");
  const [selectedCourse, setSelectedCourse] = useState("comunicacion");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Quiz modal state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<typeof mockLessons["w1-leccion1"] | null>(null);
  const [lessonAttempts, setLessonAttempts] = useState<Record<string, number>>({
    "w1-leccion1": 2,
    "w1-leccion2": 1,
  });

  // Gamification stats (removed lives)
  const [stats, setStats] = useState({
    currentStreak: 7,
    gems: 2250,
  });

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleNodeClick = (nodeId: string, weekNumber: number) => {
    const lesson = mockLessons[nodeId];
    if (lesson) {
      setCurrentLesson(lesson);
      setIsQuizOpen(true);
    } else {
      toast({
        title: "Lección no disponible",
        description: "Esta lección aún no tiene contenido asignado.",
      });
    }
  };

  const handleQuizComplete = (score: number, isFirstAttempt: boolean) => {
    if (currentLesson) {
      // Update attempts count
      setLessonAttempts(prev => ({
        ...prev,
        [currentLesson.id]: (prev[currentLesson.id] || 0) + 1,
      }));

      // Only add points on first attempt
      if (isFirstAttempt) {
        const points = score * 10;
        setStats(prev => ({
          ...prev,
          gems: prev.gems + points,
        }));
        toast({
          title: "¡Quiz completado!",
          description: `Has ganado ${points} puntos para el ranking.`,
        });
      } else {
        toast({
          title: "Quiz completado",
          description: "Este intento no suma puntos al ranking.",
        });
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Filter path based on search
  const filteredWeeks = useMemo(() => {
    if (!searchQuery.trim()) return mockWeekSections;
    
    return mockWeekSections.map(week => ({
      ...week,
      lessons: week.lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(week => week.lessons.length > 0);
  }, [searchQuery]);

  // Check if course is enabled (only Comunicación for pilot)
  const isCourseEnabled = selectedCourse === "comunicacion";

  if (!user) return null;

  const renderContent = () => {
    if (!isCourseEnabled) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <Construction className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Curso Bloqueado
          </h2>
          <p className="text-muted-foreground max-w-md">
            Este curso será habilitado por el administrador próximamente.
            Por ahora, continúa con el curso de Comunicación.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "path":
        return (
          <div className="pb-24 lg:pb-8">
            {/* Streak Mascot - Show on top of path */}
            <div className="flex justify-center py-6">
              <StreakMascot streakDays={stats.currentStreak} />
            </div>
            
            <LearningPath
              weeks={filteredWeeks}
              currentWeek={2}
              onNodeClick={handleNodeClick}
            />
          </div>
        );
      
      case "ranking":
        return (
          <div className="pb-24 lg:pb-8">
            <RankingTab
              rankings={mockRankings}
              userPosition={4}
              userPreviousPosition={6}
              totalStudents={45}
            />
          </div>
        );
      
      case "profile":
        return (
          <div className="max-w-md mx-auto px-4 py-8 pb-24 lg:pb-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-tesla-blue-light flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <p className="text-muted-foreground">{user.code}</p>
              {user.area && (
                <span className="inline-block mt-2 px-4 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium">
                  Área: {user.area}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Perfil
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código</span>
                    <span className="font-medium">{user.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Área</span>
                    <span className="font-medium">{user.area || "No asignada"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EXP Total</span>
                    <span className="font-medium text-primary">{stats.gems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Racha Actual</span>
                    <span className="font-medium text-orange-500">{stats.currentStreak} días</span>
                  </div>
                </div>
              </div>

              {/* Streak Mascot in Profile */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-4 text-center">Mi Mascota de Racha</h3>
                <StreakMascot streakDays={stats.currentStreak} />
              </div>

              <Button 
                variant="outline" 
                className="w-full rounded-2xl"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        );
      
      case "notifications":
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
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
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Gamified Status Bar (without lives) */}
      <GamifiedStatusBar
        userName={user.name}
        userCode={user.code}
        currentStreak={stats.currentStreak}
        gems={stats.gems}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
      />

      {/* Desktop Navigation Tabs */}
      <div className="hidden lg:flex items-center justify-center gap-2 py-4 bg-card/50 border-b border-border">
        {[
          { id: "path" as const, label: "El Camino" },
          { id: "ranking" as const, label: "Ranking" },
          { id: "profile" as const, label: "Mi Perfil" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-8rem)]">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={3}
      />

      {/* Quiz Modal */}
      {currentLesson && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => {
            setIsQuizOpen(false);
            setCurrentLesson(null);
          }}
          lessonTitle={currentLesson.title}
          questions={currentLesson.questions}
          onComplete={handleQuizComplete}
          isFirstAttempt={(lessonAttempts[currentLesson.id] || 0) === 0}
          timePerQuestion={180}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
