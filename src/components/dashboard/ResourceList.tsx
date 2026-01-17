import { FileText, Video, Download, ChevronDown, ChevronRight, CheckCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  name: string;
  type: "pdf" | "video";
  completed: boolean;
}

interface ResourceCategory {
  id: string;
  name: string;
  resources: Resource[];
}

interface ResourceListProps {
  categories: ResourceCategory[];
  onResourceClick: (resourceId: string) => void;
}

export const ResourceList = ({ categories, onResourceClick }: ResourceListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const isExpanded = expandedCategories.includes(category.id);
        const completedCount = category.resources.filter((r) => r.completed).length;

        return (
          <div key={category.id} className="card-tesla overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">{category.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{category.resources.length} completados
              </span>
            </button>

            {/* Resources */}
            {isExpanded && (
              <div className="border-t border-border">
                {category.resources.map((resource) => (
                  <button
                    key={resource.id}
                    onClick={() => onResourceClick(resource.id)}
                    className="w-full flex items-center justify-between p-4 pl-12 hover:bg-secondary/30 transition-colors border-b border-border/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {resource.type === "pdf" ? (
                        <FileText className="w-5 h-5 text-destructive" />
                      ) : (
                        <Video className="w-5 h-5 text-primary" />
                      )}
                      <span className={cn(
                        "text-sm",
                        resource.completed ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {resource.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.completed && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      <Download className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
