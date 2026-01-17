import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MaterialTable } from "@/components/admin/MaterialTable";
import { UploadModal } from "@/components/admin/UploadModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, Filter, FileText, Video, Users, BookOpen } from "lucide-react";
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

const stats = [
  { label: "Total Materiales", value: "156", icon: FileText, color: "bg-primary" },
  { label: "Videos Subidos", value: "42", icon: Video, color: "bg-tesla-blue-light" },
  { label: "Alumnos Activos", value: "324", icon: Users, color: "bg-success" },
  { label: "Cursos Activos", value: "12", icon: BookOpen, color: "bg-accent" },
];

const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState("material");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");

  const handleUpload = (data: { name: string; course: string; week: string; file: File | null }) => {
    console.log("Uploading:", data);
    // Here you would handle the actual upload
  };

  const filteredMaterials = mockMaterials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === "all" || material.course.toLowerCase() === filterCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="min-h-screen bg-secondary">
      <Sidebar
        role="admin"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName="Dr. María García"
      />

      <div className="ml-64">
        <Header userName="María" showSearch={false} />

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="card-tesla p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Material Management Section */}
          <div className="card-tesla p-6">
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar materiales..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-tesla"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger className="w-40 input-tesla">
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
            <MaterialTable
              materials={filteredMaterials}
              onEdit={(id) => console.log("Edit:", id)}
              onDelete={(id) => console.log("Delete:", id)}
            />
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default AdminDashboard;
