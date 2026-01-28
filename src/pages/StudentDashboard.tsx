import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { WeekSelector } from "@/components/dashboard/WeekSelector";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { RankingWidget } from "@/components/dashboard/RankingWidget";
import { CommunicationCard } from "@/components/dashboard/CommunicationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, MessageSquare } from "lucide-react";

const mockCommunicationContent = [
  {
    id: "teoria-1",
    type: "teoria" as const,
    title: "Comprensión Lectora",
    description: "Aprende las técnicas fundamentales para analizar y comprender textos de manera efectiva.",
    progress: 100,
  },
  {
    id: "practica-1",
    type: "practica" as const,
    title: "Ejercicios Interactivos",
    description: "Practica con ejercicios dinámicos que refuerzan tu comprensión lectora.",
    progress: 65,
  },
  {
    id: "simulacro-1",
    type: "simulacro" as const,
    title: "Examen Diario",
    description: "Pon a prueba tus conocimientos con un simulacro cronometrado de 20 preguntas.",
    progress: 0,
  },
];

const mockRankings = [
  { position: 1, name: "Ana Martínez", points: 2450, trend: "same" as const },
  { position: 2, name: "Luis García", points: 2380, trend: "up" as const },
  { position: 3, name: "María Fernández", points: 2310, trend: "down" as const },
  { position: 4, name: "Carlos Rodríguez", points: 2250, isCurrentUser: true, trend: "up" as const },
  { position: 5, name: "Pedro Sánchez", points: 2180, trend: "down" as const },
];

interface User {
  code: string;
  name: string;
  role: string;
  area?: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("comunicacion");
  const [selectedWeek, setSelectedWeek] = useState(3);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];

  // Mock streak data
  const streakData = {
    currentStreak: 7,
    longestStreak: 15,
    weeklyProgress: [1, 1, 1, 0.5, 1, 0, 0] as number[],
    totalPoints: 2250,
  };

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleStartContent = (contentId: string) => {
    console.log("Starting content:", contentId);
    // Here you would navigate to the actual content
  };

  const handleBackToCourse = () => {
    setSelectedContent(null);
  };

  // Filter content based on search query
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return mockCommunicationContent;
    return mockCommunicationContent.filter((content) =>
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (!user) return null;

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
        role="student"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName={user.name}
        userCode={user.code}
        userArea={user.area}
      />

      <div className="flex-1 w-full transition-all duration-300">
        <Header 
          userName={user.name.split(" ")[0]} 
          userArea={user.area}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="p-4 lg:p-6">
          {activeItem === "comunicacion" ? (
            <>
              {/* Streak Widget */}
              <StreakWidget {...streakData} />

              {/* Week Selector */}
              <WeekSelector
                weeks={weeks}
                selectedWeek={selectedWeek}
                onWeekSelect={setSelectedWeek}
              />

              {/* Course Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Comunicación
                  </h2>
                  <p className="text-muted-foreground">
                    Semana {selectedWeek} - Desarrollo de habilidades comunicativas
                  </p>
                </div>
              </div>

              {/* Communication Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {filteredContent.length > 0 ? (
                  filteredContent.map((content, index) => (
                    <div
                      key={content.id}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      className="animate-slide-up"
                    >
                      <CommunicationCard
                        {...content}
                        isLocked={index > 0 && filteredContent[index - 1]?.progress < 100}
                        onStart={handleStartContent}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No se encontró contenido para "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Ranking Widget */}
              <RankingWidget
                rankings={mockRankings}
                userPosition={4}
                totalStudents={45}
              />
            </>
          ) : (
            renderComingSoon()
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
