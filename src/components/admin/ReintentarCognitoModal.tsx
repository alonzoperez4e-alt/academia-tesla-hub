import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { adminService } from "@/services/adminService";
import { isCognitoUsuarioYaExisteError, isCognitoNoDisponibleError, getApiErrorMessage } from "@/utils/apiErrors";
import type { UsuarioDTO } from "@/types/api.types";

interface ReintentarCognitoModalProps {
  usuario: UsuarioDTO | null;
  onClose: () => void;
  onRetried: (usuario: UsuarioDTO) => void;
}

export const ReintentarCognitoModal = ({ usuario, onClose, onRetried }: ReintentarCognitoModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setEmail("");
    setPassword("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!usuario) return;
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Ingresa el email y la contraseña para reintentar.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const actualizado = await adminService.reintentarCognito(usuario.idUsuario, {
        email: email.trim(),
        password,
      });
      toast({ title: "Éxito", description: "La cuenta quedó vinculada a Cognito." });
      onRetried(actualizado);
      handleClose();
    } catch (error: unknown) {
      let description = "No se pudo vincular la cuenta a Cognito. Intenta nuevamente.";
      if (isCognitoUsuarioYaExisteError(error)) {
        description = "Ya existe un usuario en Cognito con ese email. Usa otro email.";
      } else if (isCognitoNoDisponibleError(error)) {
        description = "Cognito sigue sin estar disponible. Intenta más tarde.";
      } else {
        description = getApiErrorMessage(error) ?? description;
      }
      toast({ title: "Error al reintentar", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={usuario !== null} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Reintentar vínculo con Cognito{usuario ? ` — ${usuario.codigoUsuario}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La contraseña no se guarda en la base de datos, así que debes volver a ingresarla para completar el vínculo con Cognito.
          </p>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-tesla" />
          </div>
          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-tesla" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 btn-tesla-primary">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Vinculando...</>
              ) : (
                "Reintentar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
