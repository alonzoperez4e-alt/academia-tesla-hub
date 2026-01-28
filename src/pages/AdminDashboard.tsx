import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MaterialTable } from "@/components/admin/MaterialTable";
import { UploadModal } from "@/components/admin/UploadModal";
import { QuestionUploadModal } from "@/components/admin/QuestionUploadModal";
import { QuestionTable } from "@/components/admin/QuestionTable";
import { Button } from "@/components/ui/button";
import { Upload, Filter, FileText, Video, Users, BookOpen, Construction, Plus, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockMaterials = [
  { id: "1", name: "Introducción a la Cinemática", course: "Física", week: 1, type: "pdf" as const, uploadDate: "2024-01-15" },
  { id: "2", name: "MRU - Teoría Completa", course: "Física", week: 2, type: "pdf" as const, uploadDate: "2024-01-16" },
  { id: "3", name: "Solución de Ejercicios MRU", course: "Física", week: 2, type: "video" as const, uploadDate: "2024-01-17" },
  { id: "4", name: "Tabla Periódica Moderna", course: "Química", week: 1, type: "pdf" as const, uploadDate: "2024-01-15" },
  { id: "5", name: "Enlaces Químicos", course: "Química", week: 3, type: "pdf" as const, uploadDate: "2024-01-18" },
  { id: "6", name: "Práctica de Álgebra", course: "Álgebra", week: 3, type: "pdf" as const, uploadDate: "2024-01-19" },
];

const mockQuestions = [
  { 
    id: "q1", 
    text: "¿Cuál es el sinónimo de 'efímero'?", 
    week: 1, 
    options: ["Eterno", "Pasajero", "Sólido", "Firme"], 
    correctAnswer: 1, 
    createdAt: "2024-01-15" 
  },
  { 
    id: "q2", 
    text: "Identifica el tipo de texto: 'La receta indica mezclar todos los ingredientes...'", 
    week: 1, 
    options: ["Narrativo", "Instructivo", "Descriptivo", "Argumentativo"], 
    correctAnswer: 1, 
    createdAt: "2024-01-16" 
  },
  { 
    id: "q3", 
    text: "¿Qué figura literaria se usa en 'El viento susurraba secretos'?", 
    week: 2, 
    options: ["Metáfora", "Símil", "Personificación", "Hipérbole"], 
    correctAnswer: 2, 
    createdAt: "2024-01-17" 
  },
];

const stats = [
  { label: "Total Materiales", value: "156", icon: FileText, color: "bg-primary" },
  { label: "Preguntas Activas", value: "89", icon: MessageSquare, color: "bg-purple-500" },
  { label: "Alumnos Activos", value: "324", icon: Users, color: "bg-success" },
  { label: "Cursos Activos", value: "12", icon: BookOpen, color: "bg-accent" },
];

interface User {
  code: string;
  name: string;
  role: string;
  area?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("material");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterWeek, setFilterWeek] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState(mockQuestions);

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleUpload = (data: { name: string; course: string; week: string; file: File | null }) => {
    console.log("Uploading:", data);
  };

  const handleSaveQuestion = (question: { text: string; options: string[]; correctAnswer: number; imageUrl?: string }) => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      ...question,
      week: 1,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setQuestions([...questions, newQuestion]);
  };

  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter((material) => {
      const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           material.course.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = filterCourse === "all" || material.course.toLowerCase() === filterCourse;
      return matchesSearch && matchesCourse;
    });
  }, [searchQuery, filterCourse]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = question.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWeek = filterWeek === "all" || question.week.toString() === filterWeek;
      return matchesSearch && matchesWeek;
    });
  }, [searchQuery, filterWeek, questions]);

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

  // Render question management view
  const renderQuestionManagement = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Question Management Section */}
      <div className="card-tesla p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Gestión de Preguntas - Comunicación
            </h2>
            <p className="text-muted-foreground">
              Crea y administra las preguntas del curso de Comunicación
            </p>
          </div>

          <Button
            onClick={() => setIsQuestionModalOpen(true)}
            className="btn-tesla-accent"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Pregunta
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger className="w-full sm:w-40 input-tesla">
                <SelectValue placeholder="Filtrar por semana" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                <SelectItem value="all">Todas las semanas</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    Semana {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Questions Table */}
        {filteredQuestions.length > 0 ? (
          <QuestionTable
            questions={filteredQuestions}
            onEdit={(id) => console.log("Edit:", id)}
            onDelete={(id) => setQuestions(questions.filter((q) => q.id !== id))}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron preguntas para los filtros seleccionados
          </div>
        )}
      </div>
    </>
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
          showSearch={activeItem === "material" || activeItem === "preguntas"}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="p-4 lg:p-6">
          {activeItem === "material" ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

              {/* Material Management Section */}
              <div className="card-tesla p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Gestión de Materiales
                    </h2>
                    <p className="text-muted-foreground">
                      Administra todo el contenido académico
                    </p>
                  </div>

                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="btn-tesla-accent"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Subir Nuevo Material
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center gap-2 flex-1">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={filterCourse} onValueChange={setFilterCourse}>
                      <SelectTrigger className="w-full sm:w-40 input-tesla">
                        <SelectValue placeholder="Filtrar por curso" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border">
                        <SelectItem value="all">Todos los cursos</SelectItem>
                        <SelectItem value="física">Física</SelectItem>
                        <SelectItem value="química">Química</SelectItem>
                        <SelectItem value="álgebra">Álgebra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Materials Table */}
                {filteredMaterials.length > 0 ? (
                  <MaterialTable
                    materials={filteredMaterials}
                    onEdit={(id) => console.log("Edit:", id)}
                    onDelete={(id) => console.log("Delete:", id)}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No se encontraron materiales para "{searchQuery}"
                  </div>
                )}
              </div>
            </>
          ) : activeItem === "preguntas" ? (
            renderQuestionManagement()
          ) : (
            renderComingSoon()
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* Question Upload Modal */}
      <QuestionUploadModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSave={handleSaveQuestion}
      />
    </div>
  );
};

export default AdminDashboard;
