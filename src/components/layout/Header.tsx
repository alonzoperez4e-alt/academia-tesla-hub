import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  userName: string;
  userArea?: string;
  showSearch?: boolean;
}

export const Header = ({ userName, userArea, showSearch = true }: HeaderProps) => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Hola, <span className="text-primary">{userName}</span>
          </h2>
          {userArea && (
            <span className="badge-area mt-1">
              Área: {userArea}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos, materiales..."
              className="pl-10 w-64 input-tesla"
            />
          </div>
        )}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>
      </div>
    </header>
  );
};
