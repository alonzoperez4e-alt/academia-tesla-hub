import { Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  week: number;
  options: string[];
  correctAnswer: number;
  createdAt: string;
}

interface QuestionTableProps {
  questions: Question[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const QuestionTable = ({ questions, onEdit, onDelete }: QuestionTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-muted-foreground">Pregunta</TableHead>
            <TableHead className="text-muted-foreground">Semana</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Opciones</TableHead>
            <TableHead className="text-muted-foreground hidden lg:table-cell">Fecha</TableHead>
            <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id} className="border-border hover:bg-secondary/50">
              <TableCell className="font-medium text-foreground max-w-xs">
                <p className="truncate">{question.text}</p>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  Semana {question.week}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex gap-1">
                  {question.options.map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        index === question.correctAnswer
                          ? "bg-success text-white"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground hidden lg:table-cell">
                {question.createdAt}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(question.id)}
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(question.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
