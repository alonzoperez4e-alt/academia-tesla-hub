import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CourseSelector } from "@/components/admin/CourseSelector";
import { WeekManager, Week, Lesson } from "@/components/admin/WeekManager";
import { LessonFormModal } from "@/components/admin/LessonFormModal";
import { WeekDetailsModal } from "@/components/admin/WeekDetailsModal";
import { Construction } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { estudianteService } from "@/services/estudianteService";
import { adminService } from "@/services/adminService";
import type { Curso } from "@/types/api.types";

// Initial mock weeks data (retained just for rendering WeekManager for now if needed, though ideal would be fetching from backend too)
const initialWeeksData: Record<number, Week[]> = {
  // Mapping by idCurso instead of string for mock data, normally it'd be fetched.
};

// Mock lesson details
const mockLessonDetails: Record<string, any> = {};

interface User {
  code: string;
  name: string;
  role: string;
  area?: string;
  id?: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("cuestionarios");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  
  // Courses state from backend
  const [courses, setCourses] = useState<Curso[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Course and week management state
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [weeksData, setWeeksData] = useState(initialWeeksData);
  
  // Modal states
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedWeekForLesson, setSelectedWeekForLesson] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWeekForDetails, setSelectedWeekForDetails] = useState<number | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const data = await estudianteService.obtenerCursos();
      setCourses(data);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los cursos.", variant: "destructive" });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleCreateCourse = async (nombre: string, descripcion: string) => {
    try {
      await adminService.crearCurso({ nombre, descripcion, isHabilitado: true });
      toast({ title: "Exito", description: "Curso creado exitosamente." });
      await fetchCourses(); // Refresh courses list
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  const handleSelectCourse = (courseId: number) => {
    setSelectedCourse(courseId);
    // Initialize mock weeks data for the course if not exist
    if (!weeksData[courseId]) {
      setWeeksData(prev => ({ ...prev, [courseId]: [] }));
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const handleAddLesson = (weekNumber: number) => {
    setSelectedWeekForLesson(weekNumber);
    setIsLessonModalOpen(true);
  };

  const handleViewDetails = (weekNumber: number) => {
    setSelectedWeekForDetails(weekNumber);
    setIsDetailsModalOpen(true);
  };

  const handleUnlockWeek = (weekNumber: number) => {
    if (selectedCourse === null) return;
    
    setWeeksData(prev => ({
      ...prev,
      [selectedCourse]: prev[selectedCourse].map(w =>
        w.week === weekNumber ? { ...w, isUnlocked: true } : w
      ),
    }));
    
    toast({
      title: "Semana desbloqueada",
      description: `La Semana ${weekNumber} ha sido desbloqueada.`,
    });
  };

  const handleAddWeek = () => {
    if (selectedCourse === null) return;
    
    const currentWeeks = weeksData[selectedCourse] || [];
    const newWeekNumber = currentWeeks.length + 1;
    
    setWeeksData(prev => ({
      ...prev,
      [selectedCourse]: [
        ...(prev[selectedCourse] || []),
        { week: newWeekNumber, isUnlocked: false, lessons: [] },
      ],
    }));
    
    toast({
      title: "Semana agregada",
      description: `Semana ${newWeekNumber} creada exitosamente.`,
    });
  };

  const handleDeleteWeek = (weekNumber: number) => {
    if (selectedCourse === null) return;
    
    setWeeksData(prev => ({
      ...prev,
      [selectedCourse]: prev[selectedCourse].filter(w => w.week !== weekNumber),
    }));
    
    toast({
      title: "Semana eliminada",
      description: `La Semana ${weekNumber} ha sido eliminada.`,
    });
  };

  const handleSaveLesson = (lesson: {
    name: string;
    description: string;
    questions: Array<{
      text: string;
      options: string[];
      correctAnswer: number;
    }>;
  }) => {
    if (selectedCourse === null || selectedWeekForLesson === null) return;
    
    const newLessonId = `l${selectedWeekForLesson}-${Date.now()}`;
    const newLesson: Lesson = {
      id: newLessonId,
      name: lesson.name,
      description: lesson.description,
      questionsCount: lesson.questions.length,
    };
    
    setWeeksData(prev => ({
      ...prev,
      [selectedCourse]: prev[selectedCourse].map(w =>
        w.week === selectedWeekForLesson
          ? { ...w, lessons: [...w.lessons, newLesson] }
          : w
      ),
    }));
    
    toast({
      title: "Lección guardada",
      description: `"${lesson.name}" con ${lesson.questions.length} preguntas agregada a Semana ${selectedWeekForLesson}.`,
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (selectedCourse === null || selectedWeekForDetails === null) return;
    
    setWeeksData(prev => ({
      ...prev,
      [selectedCourse]: prev[selectedCourse].map(w =>
        w.week === selectedWeekForDetails
          ? { ...w, lessons: w.lessons.filter(l => l.id !== lessonId) }
          : w
      ),
    }));
    
    toast({
      title: "Lección eliminada",
      description: "La lección ha sido eliminada exitosamente.",
    });
  };

  if (!user) return null;

  // Get lessons for details modal
  const getWeekLessons = () => {
    if (selectedCourse === null || selectedWeekForDetails === null) return [];
    const week = weeksData[selectedCourse]?.find(w => w.week === selectedWeekForDetails);
    if (!week) return [];
    
    return week.lessons.map(l => ({
      ...l,
      questions: mockLessonDetails[l.id]?.questions || [],
    }));
  };

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

  // Render questionnaire management
  const renderQuestionnaireManagement = () => (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="card-tesla p-4 lg:p-6 min-h-[60vh]">
        {selectedCourse === null ? (
          isLoadingCourses ? (
            <div className="flex items-center justify-center h-full">Cargando cursos...</div>
          ) : (
            <CourseSelector
              courses={courses}
              onSelectCourse={handleSelectCourse}
              onCreateCourse={handleCreateCourse}
            />
          )
        ) : (
          <WeekManager
            courseName={courses.find(c => c.idCurso === selectedCourse)?.nombre || "Curso"}
            weeks={weeksData[selectedCourse] || []}
            onBack={handleBackToCourses}
            onAddLesson={handleAddLesson}
            onViewDetails={handleViewDetails}
            onUnlockWeek={handleUnlockWeek}
            onAddWeek={handleAddWeek}
            onDeleteWeek={handleDeleteWeek}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar
        role="admin"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName={user.name}
        userCode={user.code}
      />

      <div className="flex-1 w-full transition-all duration-300">
        <Header 
          userName={user.name.split(" ")[0]} 
          showSearch={activeItem === "cuestionarios"}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="p-4 lg:p-6">
          {activeItem === "cuestionarios" ? (
            renderQuestionnaireManagement()
          ) : (
            renderComingSoon()
          )}
        </main>
      </div>

      {/* Lesson Form Modal */}
      {selectedWeekForLesson !== null && (
        <LessonFormModal
          isOpen={isLessonModalOpen}
          onClose={() => {
            setIsLessonModalOpen(false);
            setSelectedWeekForLesson(null);
          }}
          weekNumber={selectedWeekForLesson}
          onSave={handleSaveLesson}
        />
      )}

      {/* Week Details Modal */}
      {selectedWeekForDetails !== null && (
        <WeekDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedWeekForDetails(null);
          }}
          weekNumber={selectedWeekForDetails}
          lessons={getWeekLessons()}
          onDeleteLesson={handleDeleteLesson}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
