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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { adminService } from "@/services/adminService";
import {
  isCodigoYaExisteError,
  isCognitoUsuarioYaExisteError,
  getApiErrorMessage,
} from "@/utils/apiErrors";
import type { CrearUsuarioRequest, UsuarioDTO } from "@/types/api.types";

interface CrearUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (usuario: UsuarioDTO) => void;
}

const emptyForm = {
  codigoUsuario: "",
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "alumno" as CrearUsuarioRequest["rol"],
  area: "",
  tipoAlumno: "",
};

export const CrearUsuarioModal = ({ isOpen, onClose, onCreated }: CrearUsuarioModalProps) => {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => setForm(emptyForm);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.codigoUsuario.trim() || !form.nombre.trim() || !form.apellido.trim() || !form.email.trim() || !form.password.trim()) {
      toast({ title: "Error", description: "Todos los campos marcados son obligatorios.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const usuario = await adminService.crearUsuario({
        codigoUsuario: form.codigoUsuario.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
        area: form.rol === "alumno" && form.area.trim() ? form.area.trim() : undefined,
        tipoAlumno: form.rol === "alumno" && form.tipoAlumno.trim() ? form.tipoAlumno.trim() : undefined,
      });

      if (usuario.pendienteCognito) {
        toast({
          title: "Usuario creado, Cognito pendiente",
          description: "Se guardó en la base de datos, pero Cognito no está disponible ahora mismo. Podrás reintentar el vínculo desde la lista.",
        });
      } else {
        toast({ title: "Éxito", description: `Cuenta de ${form.rol} creada correctamente.` });
      }

      onCreated(usuario);
      resetForm();
      onClose();
    } catch (error: unknown) {
      let description = "Hubo un problema al crear la cuenta. Intenta nuevamente.";
      if (isCodigoYaExisteError(error)) {
        description = "Ya existe un usuario con ese código.";
      } else if (isCognitoUsuarioYaExisteError(error)) {
        description = "Ya existe un usuario en Cognito con ese email. Usa otro email.";
      } else {
        description = getApiErrorMessage(error) ?? description;
      }
      toast({ title: "Error al crear", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Crear Alumno / Administrador</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select value={form.rol} onValueChange={(value) => setForm({ ...form, rol: value as CrearUsuarioRequest["rol"] })}>
              <SelectTrigger className="input-tesla">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alumno">Alumno</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código de Usuario *</Label>
              <Input
                value={form.codigoUsuario}
                onChange={(e) => setForm({ ...form, codigoUsuario: e.target.value })}
                placeholder="Ej: TESLA2026-001"
                className="input-tesla"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="input-tesla"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="input-tesla"
              />
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                className="input-tesla"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="La cuenta podrá iniciar sesión de inmediato con esta contraseña"
              className="input-tesla"
            />
          </div>

          {form.rol === "alumno" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Área (opcional)</Label>
                <Input
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="input-tesla"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Alumno (opcional)</Label>
                <Input
                  value={form.tipoAlumno}
                  onChange={(e) => setForm({ ...form, tipoAlumno: e.target.value })}
                  className="input-tesla"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 btn-tesla-primary">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...</>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
