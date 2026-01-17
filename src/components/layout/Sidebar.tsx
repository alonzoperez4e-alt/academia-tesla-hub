import { BookOpen, Calendar, FileText, Library, Users, Upload, Settings, LogOut, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "student" | "admin";
  activeItem: string;
  onItemClick: (item: string) => void;
  userName: string;
  userArea?: string;
}

const studentMenuItems = [
  { id: "cursos", label: "Mis Cursos", icon: BookOpen },
  { id: "horario", label: "Horario", icon: Calendar },
  { id: "simulacros", label: "Simulacros", icon: FileText },
  { id: "biblioteca", label: "Biblioteca", icon: Library },
];

const adminMenuItems = [
  { id: "alumnos", label: "Gestionar Alumnos", icon: Users },
  { id: "material", label: "Subir Material", icon: Upload },
  { id: "cursos", label: "Gestionar Cursos", icon: BookOpen },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export const Sidebar = ({ role, activeItem, onItemClick, userName, userArea }: SidebarProps) => {
  const menuItems = role === "student" ? studentMenuItems : adminMenuItems;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Academia</h1>
            <p className="text-sm text-sidebar-primary font-semibold -mt-1">TESLA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "sidebar-link w-full text-left",
                isActive && "sidebar-link-active"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
            <span className="text-sidebar-primary font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            {userArea && (
              <p className="text-xs text-sidebar-foreground/60">{userArea}</p>
            )}
          </div>
        </div>
        <button className="sidebar-link w-full text-left text-sidebar-foreground/60 hover:text-destructive">
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
