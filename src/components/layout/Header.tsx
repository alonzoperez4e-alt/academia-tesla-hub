import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  userName: string;
  userArea?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const Header = ({ userName, userArea, showSearch = true, searchValue = "", onSearchChange }: HeaderProps) => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4 ml-12 lg:ml-0">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-foreground">
            Hola, <span className="text-primary">{userName}</span>
          </h2>
          {userArea && (
            <span className="badge-area mt-1">
              Área: {userArea}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 w-32 sm:w-48 lg:w-64 input-tesla"
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
