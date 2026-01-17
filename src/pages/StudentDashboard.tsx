import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { WeekSelector } from "@/components/dashboard/WeekSelector";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { ResourceList } from "@/components/dashboard/ResourceList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

const StudentDashboard = () => {
  const [activeItem, setActiveItem] = useState("cursos");
  const [selectedWeek, setSelectedWeek] = useState(3);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  const handleViewMaterial = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const selectedCourseData = mockCourses.find((c) => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-secondary">
      <Sidebar
        role="student"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName="Carlos Rodríguez"
        userArea="Ingeniería"
      />

      <div className="ml-64">
        <Header userName="Carlos" userArea="Ingeniería" />

        <main className="p-6">
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

              <ResourceList
                categories={mockResources}
                onResourceClick={(id) => console.log("Open resource:", id)}
              />
            </div>
          ) : (
            /* Courses Grid View */
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Tus Cursos - Semana {selectedWeek}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCourses.map((course, index) => (
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
