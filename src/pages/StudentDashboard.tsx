import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GamifiedStatusBar } from "@/components/gamification/GamifiedStatusBar";
import { LearningPath } from "@/components/gamification/LearningPath";
import { RankingTab } from "@/components/gamification/RankingTab";
import { MobileBottomNav } from "@/components/gamification/MobileBottomNav";
import { Construction, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for the learning path
const mockWeekSections = [
  {
    week: 1,
    title: "Fundamentos de Comunicación",
    isUnlocked: true,
    nodes: [
      {
        id: "w1-teoria",
        type: "teoria" as const,
        title: "Comprensión Lectora",
        description: "Técnicas fundamentales para analizar textos de manera efectiva.",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 50,
      },
      {
        id: "w1-practica",
        type: "practica" as const,
        title: "Ejercicios de Comprensión",
        description: "Practica con ejercicios interactivos de lectura.",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 75,
      },
      {
        id: "w1-examen",
        type: "examen" as const,
        title: "Examen Semanal 1",
        description: "Demuestra lo aprendido en esta semana.",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 150,
      },
      {
        id: "w1-recompensa",
        type: "recompensa" as const,
        title: "Cofre de Recompensas",
        description: "¡Desbloquea materiales extra!",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 25,
      },
    ],
  },
  {
    week: 2,
    title: "Ortografía y Redacción",
    isUnlocked: true,
    nodes: [
      {
        id: "w2-teoria",
        type: "teoria" as const,
        title: "Reglas Ortográficas",
        description: "Domina las reglas esenciales de ortografía española.",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 50,
      },
      {
        id: "w2-practica",
        type: "practica" as const,
        title: "Práctica de Redacción",
        description: "Ejercicios para mejorar tu escritura.",
        isCompleted: false,
        isLocked: false,
        isCurrent: true,
        exp: 75,
      },
      {
        id: "w2-examen",
        type: "examen" as const,
        title: "Examen Semanal 2",
        description: "Evalúa tus conocimientos de ortografía.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 150,
      },
      {
        id: "w2-recompensa",
        type: "recompensa" as const,
        title: "Cofre de Recompensas",
        description: "Material bonus de ortografía.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 25,
      },
    ],
  },
  {
    week: 3,
    title: "Análisis Textual",
    isUnlocked: false,
    nodes: [
      {
        id: "w3-teoria",
        type: "teoria" as const,
        title: "Tipos de Texto",
        description: "Aprende a identificar y analizar diferentes tipos de textos.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 50,
      },
      {
        id: "w3-practica",
        type: "practica" as const,
        title: "Análisis Práctico",
        description: "Ejercicios de análisis textual.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
      },
      {
        id: "w3-examen",
        type: "examen" as const,
        title: "Examen Semanal 3",
        description: "Demuestra tu capacidad de análisis.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 150,
      },
      {
        id: "w3-recompensa",
        type: "recompensa" as const,
        title: "Cofre de Recompensas",
        description: "Desbloquea contenido especial.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 25,
      },
    ],
  },
];

// Generate weeks 4-8 (locked)
for (let w = 4; w <= 8; w++) {
  mockWeekSections.push({
    week: w,
    title: `Semana ${w}`,
    isUnlocked: false,
    nodes: [
      {
        id: `w${w}-teoria`,
        type: "teoria" as const,
        title: "Contenido Teórico",
        description: "Material de teoría para esta semana.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 50,
      },
      {
        id: `w${w}-practica`,
        type: "practica" as const,
        title: "Práctica Interactiva",
        description: "Ejercicios prácticos.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
      },
      {
        id: `w${w}-examen`,
        type: "examen" as const,
        title: `Examen Semanal ${w}`,
        description: "Evaluación semanal.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 150,
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

  // Gamification stats
  const [stats] = useState({
    currentStreak: 7,
    gems: 2250,
    lives: 4,
    maxLives: 5,
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
    console.log("Node clicked:", nodeId, "Week:", weekNumber);
    // Here you would navigate to the actual content
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
      nodes: week.nodes.filter(node => 
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(week => week.nodes.length > 0);
  }, [searchQuery]);

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "path":
        return (
          <div className="pb-24 lg:pb-8">
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
      {/* Gamified Status Bar */}
      <GamifiedStatusBar
        userName={user.name}
        userCode={user.code}
        currentStreak={stats.currentStreak}
        gems={stats.gems}
        lives={stats.lives}
        maxLives={stats.maxLives}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
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
    </div>
  );
};

export default StudentDashboard;
