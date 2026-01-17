import { FileText, Video, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Material {
  id: string;
  name: string;
  course: string;
  week: number;
  type: "pdf" | "video";
  uploadDate: string;
}

interface MaterialTableProps {
  materials: Material[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MaterialTable = ({ materials, onEdit, onDelete }: MaterialTableProps) => {
  return (
    <div className="card-tesla overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold">Nombre</TableHead>
            <TableHead className="font-semibold">Curso</TableHead>
            <TableHead className="font-semibold">Semana</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Fecha</TableHead>
            <TableHead className="font-semibold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id} className="hover:bg-secondary/30">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {material.type === "pdf" ? (
                    <FileText className="w-4 h-4 text-destructive" />
                  ) : (
                    <Video className="w-4 h-4 text-primary" />
                  )}
                  {material.name}
                </div>
              </TableCell>
              <TableCell>{material.course}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Semana {material.week}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  material.type === "pdf" 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {material.type.toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{material.uploadDate}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-border">
                    <DropdownMenuItem onClick={() => onEdit(material.id)} className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(material.id)} 
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
