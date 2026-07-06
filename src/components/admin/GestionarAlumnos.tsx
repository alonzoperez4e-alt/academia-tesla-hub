import { useEffect, useState } from "react";
import { UserPlus, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { adminService } from "@/services/adminService";
import { CrearUsuarioModal } from "@/components/admin/CrearUsuarioModal";
import { ReintentarCognitoModal } from "@/components/admin/ReintentarCognitoModal";
import type { UsuarioDTO } from "@/types/api.types";

export const GestionarAlumnos = () => {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [usuarioParaReintentar, setUsuarioParaReintentar] = useState<UsuarioDTO | null>(null);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.listarUsuarios();
      setUsuarios(data);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreated = (usuario: UsuarioDTO) => {
    setUsuarios((prev) => [usuario, ...prev]);
  };

  const handleRetried = (usuario: UsuarioDTO) => {
    setUsuarios((prev) => prev.map((u) => (u.idUsuario === usuario.idUsuario ? usuario : u)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="text-primary" />
            Gestionar Alumnos
          </h1>
          <p className="text-muted-foreground mt-1">
            Crea cuentas de alumno o administrador. Quedan reflejadas en Cognito y en la base de datos.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="btn-tesla-primary">
          <UserPlus className="w-4 h-4 mr-2" />
          Crear Alumno / Admin
        </Button>
      </div>

      <div className="card-tesla overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground">Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Aún no se han creado cuentas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border text-muted-foreground">
                  <th className="p-3 font-semibold">Código</th>
                  <th className="p-3 font-semibold">Nombre</th>
                  <th className="p-3 font-semibold">Rol</th>
                  <th className="p-3 font-semibold">Estado</th>
                  <th className="p-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.idUsuario} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{usuario.codigoUsuario}</td>
                    <td className="p-3 text-foreground">{usuario.nombre} {usuario.apellido}</td>
                    <td className="p-3 capitalize text-foreground">{usuario.rol}</td>
                    <td className="p-3">
                      {usuario.pendienteCognito ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30">
                          Pendiente de Cognito
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {usuario.pendienteCognito && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsuarioParaReintentar(usuario)}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-2" />
                          Reintentar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CrearUsuarioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />

      <ReintentarCognitoModal
        usuario={usuarioParaReintentar}
        onClose={() => setUsuarioParaReintentar(null)}
        onRetried={handleRetried}
      />
    </div>
  );
};
