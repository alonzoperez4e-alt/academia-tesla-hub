import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weekNumber: number) => Promise<void>;
  existingWeeks: number[];
}

export const WeekFormModal = ({
  isOpen,
  onClose,
  onSave,
  existingWeeks,
}: WeekFormModalProps) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate an array from 1 to 48 
  const allPossibleWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  useEffect(() => {
    if (isOpen) {
      const firstAvailable = allPossibleWeeks.find((w) => !existingWeeks.includes(w));
      if (firstAvailable) {
        setSelectedWeek(firstAvailable);
      }
    }
  }, [isOpen, existingWeeks]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingWeeks.includes(selectedWeek)) return;

    try {
      setIsSubmitting(true);
      await onSave(selectedWeek);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-md rounded-2xl border-2 border-border shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b-2 border-border">
            <h2 className="text-xl font-bold text-foreground">Crear Semana</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Número de Semana
              </label>
              <select
                className="w-full h-11 px-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                required
              >
                {allPossibleWeeks.map((weekNum) => (
                  <option
                    key={weekNum}
                    value={weekNum}
                    disabled={existingWeeks.includes(weekNum)}
                  >
                    Semana {weekNum} {existingWeeks.includes(weekNum) ? "(Ya creada)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 btn-tesla-primary" disabled={isSubmitting || existingWeeks.includes(selectedWeek)}>
                {isSubmitting ? "Creando..." : "Crear"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
