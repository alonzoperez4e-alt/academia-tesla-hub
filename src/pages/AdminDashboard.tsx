import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CourseSelector } from "@/components/admin/CourseSelector";
import { WeekManager, Week, Lesson } from "@/components/admin/WeekManager";
import { LessonFormModal } from "@/components/admin/LessonFormModal";
import { WeekDetailsModal } from "@/components/admin/WeekDetailsModal";
import { FileText, Users, BookOpen, Construction, MessageSquare, ClipboardList } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock courses data
const mockCourses = [
  { 
    id: "comunicacion", 
    name: "Comunicación", 
    description: "Curso de comprensión lectora, redacción y análisis textual.",
    icon: "comunicacion" as const, 
    color: "from-purple-500 to-purple-600", 
    isEnabled: true,
    lessonsCount: 8,
    questionsCount: 45,
  },
  { 
    id: "matematica", 
    name: "Matemáticas", 
    description: "Álgebra, aritmética, geometría y trigonometría.",
    icon: "matematica" as const, 
    color: "from-blue-500 to-blue-600", 
    isEnabled: false,
    lessonsCount: 0,
    questionsCount: 0,
  },
  { 
    id: "fisica", 
    name: "Física", 
    description: "Mecánica, termodinámica, ondas y electromagnetismo.",
    icon: "fisica" as const, 
    color: "from-cyan-500 to-cyan-600", 
    isEnabled: false,
    lessonsCount: 0,
    questionsCount: 0,
  },
  { 
    id: "quimica", 
    name: "Química", 
    description: "Química general, orgánica e inorgánica.",
    icon: "quimica" as const, 
    color: "from-green-500 to-green-600", 
    isEnabled: false,
    lessonsCount: 0,
    questionsCount: 0,
  },
  { 
    id: "razonamiento", 
    name: "Razonamiento", 
    description: "Razonamiento verbal y matemático.",
    icon: "razonamiento" as const, 
    color: "from-orange-500 to-orange-600", 
    isEnabled: false,
    lessonsCount: 0,
    questionsCount: 0,
  },
];

// Initial mock weeks data
const initialWeeksData: Record<string, Week[]> = {
  comunicacion: [
    { 
      week: 1, 
      isUnlocked: true, 
      lessons: [
        { 
          id: "l1-1", 
          name: "Comprensión Lectora I", 
          description: "Técnicas fundamentales de lectura", 
          questionsCount: 5 
        },
        { 
          id: "l1-2", 
          name: "Comprensión Lectora II", 
          description: "Análisis de textos complejos", 
          questionsCount: 5 
        },
      ] 
    },
    { 
      week: 2, 
      isUnlocked: true, 
      lessons: [
        { 
          id: "l2-1", 
          name: "Reglas Ortográficas", 
          description: "Domina las reglas de ortografía", 
          questionsCount: 4 
        },
        { 
          id: "l2-2", 
          name: "Práctica de Redacción", 
          description: "Mejora tu escritura", 
          questionsCount: 3 
        },
      ] 
    },
    { week: 3, isUnlocked: false, lessons: [] },
    { week: 4, isUnlocked: false, lessons: [] },
    { week: 5, isUnlocked: false, lessons: [] },
    { week: 6, isUnlocked: false, lessons: [] },
    { week: 7, isUnlocked: false, lessons: [] },
    { week: 8, isUnlocked: false, lessons: [] },
  ],
};

// Mock lesson details with full questions
const mockLessonDetails: Record<string, {
  id: string;
  name: string;
  description: string;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    solutionText?: string;
    solutionImage?: string;
  }>;
}> = {
  "l1-1": {
    id: "l1-1",
    name: "Comprensión Lectora I",
    description: "Técnicas fundamentales de lectura",
    questions: [
      { id: "q1", text: "¿Cuál es el sinónimo de 'efímero'?", options: ["Eterno", "Pasajero", "Sólido", "Firme"], correctAnswer: 1, solutionText: "Efímero significa pasajero, transitorio." },
      { id: "q2", text: "El texto instructivo se caracteriza por:", options: ["Narrar hechos", "Dar órdenes o pasos", "Describir lugares", "Argumentar ideas"], correctAnswer: 1 },
    ],
  },
  "l1-2": {
    id: "l1-2",
    name: "Comprensión Lectora II",
    description: "Análisis de textos complejos",
    questions: [
      { id: "q3", text: "La personificación consiste en:", options: ["Comparar dos cosas", "Dar cualidades humanas a objetos", "Exagerar algo", "Repetir palabras"], correctAnswer: 1 },
    ],
  },
};

const stats = [
  { label: "Total Lecciones", value: "24", icon: BookOpen, color: "bg-primary" },
  { label: "Preguntas Activas", value: "89", icon: ClipboardList, color: "bg-purple-500" },
  { label: "Alumnos Activos", value: "324", icon: Users, color: "bg-success" },
  { label: "Cursos Activos", value: "1", icon: MessageSquare, color: "bg-accent" },
];

interface User {
  code: string;
  name: string;
  role: string;
  area?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("cuestionarios");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  
  // Course and week management state
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
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
  }, [navigate]);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
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
    if (!selectedCourse) return;
    
    setWeeksData(prev => ({
      ...prev,
      [selectedCourse]: prev[selectedCourse].map(w =>
        w.week === weekNumber ? { ...w, isUnlocked: true } : w
      ),
    }));
    
    toast({
      title: "Semana desbloqueada",
      description: `La Semana ${weekNumber} ha sido desbloqueada para todos los alumnos.`,
    });
  };

  const handleAddWeek = () => {
    if (!selectedCourse) return;
    
    const currentWeeks = weeksData[selectedCourse] || [];
    const newWeekNumber = currentWeeks.length + 1;
    
    setWeeksData(prev => ({
      ...prev,
      [selectedCourse]: [
        ...prev[selectedCourse],
        { week: newWeekNumber, isUnlocked: false, lessons: [] },
      ],
    }));
    
    toast({
      title: "Semana agregada",
      description: `Semana ${newWeekNumber} creada exitosamente.`,
    });
  };

  const handleDeleteWeek = (weekNumber: number) => {
    if (!selectedCourse) return;
    
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
      solutionText?: string;
      solutionImage?: string;
    }>;
  }) => {
    if (!selectedCourse || selectedWeekForLesson === null) return;
    
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
    if (!selectedCourse || selectedWeekForDetails === null) return;
    
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
    if (!selectedCourse || selectedWeekForDetails === null) return [];
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

  // Render questionnaire management (unified view)
  const renderQuestionnaireManagement = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card-tesla p-4 lg:p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="card-tesla p-4 lg:p-6">
        {!selectedCourse ? (
          <CourseSelector
            courses={mockCourses}
            onSelectCourse={handleSelectCourse}
          />
        ) : (
          <WeekManager
            courseName={mockCourses.find(c => c.id === selectedCourse)?.name || ""}
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
