import { BookOpen, Calendar, FileText, Library, Users, Settings, LogOut, Zap, Menu, X, ClipboardList, TrendingUp, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  role: "student" | "admin" | "parent";
  activeItem: string;
  onItemClick: (item: string) => void;
  userName: string;
  userCode?: string;
  userArea?: string;
}

const studentMenuItems = [
  { id: "comunicacion", label: "Comunicación", icon: BookOpen, enabled: true },
  { id: "horario", label: "Horario", icon: Calendar, enabled: false },
  { id: "simulacros", label: "Simulacros", icon: FileText, enabled: false },
  { id: "biblioteca", label: "Biblioteca", icon: Library, enabled: false },
];

const adminMenuItems = [
  { id: "cuestionarios", label: "Gestionar Cuestionarios", icon: ClipboardList, enabled: true },
  { id: "alumnos", label: "Gestionar Alumnos", icon: Users, enabled: false },
  { id: "configuracion", label: "Configuración", icon: Settings, enabled: false },
];

const parentMenuItems = [
  { id: "progreso", label: "Progreso", icon: TrendingUp, enabled: true },
  { id: "notificaciones", label: "Notificaciones", icon: Bell, enabled: false },
  { id: "configuracion", label: "Configuración", icon: Settings, enabled: false },
];

export const Sidebar = ({ role, activeItem, onItemClick, userName, userCode, userArea }: SidebarProps) => {
  const menuItems = role === "student" 
    ? studentMenuItems 
    : role === "admin" 
    ? adminMenuItems 
    : parentMenuItems;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleItemClick = (itemId: string, enabled: boolean) => {
    if (enabled) {
      onItemClick(itemId);
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "student":
        return "Alumno";
      case "admin":
        return "Administrador";
      case "parent":
        return "Padre/Apoderado";
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className={cn("p-6 border-b border-sidebar-border", isCollapsed && "p-4")}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Academia</h1>
              <p className="text-sm text-sidebar-primary font-semibold -mt-1">TESLA</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 p-4 space-y-2", isCollapsed && "p-2")}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id, item.enabled)}
              className={cn(
                "sidebar-link w-full text-left",
                isActive && item.enabled && "sidebar-link-active",
                !item.enabled && "opacity-50 cursor-not-allowed",
                isCollapsed && "justify-center px-3"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className={cn("p-4 border-t border-sidebar-border", isCollapsed && "p-2")}>
        <div className={cn("flex items-center gap-3 mb-3", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sidebar-primary font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              {userCode && (
                <p className="text-xs text-sidebar-foreground/80 font-mono">{userCode}</p>
              )}
              {userArea && (
                <p className="text-xs text-sidebar-foreground/60">{userArea}</p>
              )}
              <p className="text-xs text-sidebar-primary/80">{getRoleLabel()}</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className={cn(
            "sidebar-link w-full text-left text-sidebar-foreground/60 hover:text-destructive",
            isCollapsed && "justify-center px-3"
          )}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <div className={cn("hidden lg:block p-4 border-t border-sidebar-border", isCollapsed && "p-2")}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-link w-full text-left justify-center"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {!isCollapsed && <span className="ml-2">Colapsar</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-primary rounded-lg text-primary-foreground shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky left-0 top-0 h-full bg-sidebar flex flex-col z-50 transition-all duration-300 lg:h-screen",
          // Desktop
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile
          isMobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
