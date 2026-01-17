import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { WeekSelector } from "@/components/dashboard/WeekSelector";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { ResourceList } from "@/components/dashboard/ResourceList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";

const mockCourses = [
  { id: "1", name: "Física", icon: "fisica" as const, progress: 75, totalLessons: 12, completedLessons: 9 },
  { id: "2", name: "Química", icon: "quimica" as const, progress: 60, totalLessons: 10, completedLessons: 6 },
  { id: "3", name: "Raz. Matemático", icon: "razonamiento" as const, progress: 90, totalLessons: 8, completedLessons: 7 },
  { id: "4", name: "Álgebra", icon: "matematica" as const, progress: 45, totalLessons: 15, completedLessons: 7 },
  { id: "5", name: "Geometría", icon: "matematica" as const, progress: 30, totalLessons: 12, completedLessons: 4 },
  { id: "6", name: "Raz. Verbal", icon: "default" as const, progress: 85, totalLessons: 10, completedLessons: 9 },
];

const mockResources = [
  {
    id: "teoria",
    name: "Teoría",
    resources: [
      { id: "t1", name: "Introducción a la Cinemática.pdf", type: "pdf" as const, completed: true },
      { id: "t2", name: "Movimiento Rectilíneo Uniforme.pdf", type: "pdf" as const, completed: true },
      { id: "t3", name: "Movimiento Rectilíneo Uniformemente Variado.pdf", type: "pdf" as const, completed: false },
    ],
  },
  {
    id: "practica",
    name: "Práctica",
    resources: [
      { id: "p1", name: "Ejercicios Semana 3 - MRU.pdf", type: "pdf" as const, completed: true },
      { id: "p2", name: "Ejercicios Semana 3 - MRUV.pdf", type: "pdf" as const, completed: false },
    ],
  },
  {
    id: "solucionario",
    name: "Solucionario",
    resources: [
      { id: "s1", name: "Solución Ejercicios MRU", type: "video" as const, completed: true },
      { id: "s2", name: "Solución Ejercicios MRUV", type: "video" as const, completed: false },
      { id: "s3", name: "Solucionario Completo.pdf", type: "pdf" as const, completed: false },
    ],
  },
];

interface User {
  code: string;
  name: string;
  role: string;
  area?: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("cursos");
  const [selectedWeek, setSelectedWeek] = useState(3);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleViewMaterial = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const selectedCourseData = mockCourses.find((c) => c.id === selectedCourse);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return mockCourses;
    return mockCourses.filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter resources based on search query
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return mockResources;
    return mockResources.map((category) => ({
      ...category,
      resources: category.resources.filter((resource) =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((category) => category.resources.length > 0);
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
    <div className="min-h-screen bg-secondary flex">
      <Sidebar
        role="student"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName={user.name}
        userCode={user.code}
        userArea={user.area}
      />

      <div className="flex-1 lg:ml-0">
        <Header 
          userName={user.name.split(" ")[0]} 
          userArea={user.area}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="p-4 lg:p-6">
          {activeItem === "cursos" ? (
            <>
              {/* Week Selector */}
              <WeekSelector
                weeks={weeks}
                selectedWeek={selectedWeek}
                onWeekSelect={setSelectedWeek}
              />

              {selectedCourse ? (
                /* Course Resources View */
                <div className="animate-slide-in-left">
                  <div className="flex items-center gap-4 mb-6">
                    <Button
                      variant="ghost"
                      onClick={handleBackToCourses}
                      className="hover:bg-card"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Volver a Cursos
                    </Button>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedCourseData?.name}
                      </h2>
                      <p className="text-muted-foreground">
                        Semana {selectedWeek} - Material de estudio
                      </p>
                    </div>
                  </div>

                  {filteredResources.length > 0 ? (
                    <ResourceList
                      categories={filteredResources}
                      onResourceClick={(id) => console.log("Open resource:", id)}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No se encontraron materiales para "{searchQuery}"
                    </div>
                  )}
                </div>
              ) : (
                /* Courses Grid View */
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Tus Cursos - Semana {selectedWeek}
                  </h2>
                  {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      {filteredCourses.map((course, index) => (
                        <div
                          key={course.id}
                          style={{ animationDelay: `${index * 0.1}s` }}
                          className="animate-slide-up"
                        >
                          <CourseCard
                            {...course}
                            onViewMaterial={handleViewMaterial}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No se encontraron cursos para "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
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
