import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import logo from "@/elements/526536997_1332296692230643_53059892068269174_n.jpg";

import { loginService } from "@/services/loginService";

const Login = () => {
  const navigate = useNavigate();
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginService.LogearUsuario({
        codigo: userCode,
        password: password
      });

      if (response) {
        // Map backend response to the structure expected by the dashboard (UserSession)
        const sessionUser = {
          token: response.token,
          // Dashboard expects 'name' but backend returns 'nombre'
          name: response.nombre,
          // Dashboard expects 'role' but backend returns 'rol'
          role: response.rol,
          // Dashboard expects 'code'; use response.codigo if available, or fallback to input
          code: response.codigo || userCode,
          // Dashboard expects 'id' (number) for API calls
          id: response.idUsuario 
        };

        // Store user data in sessionStorage for the session
        sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));
        
        // Map backend roles to routes
        const role = response.rol?.toLowerCase();

        if (role === "alumno" || role === "estudiante") {
          navigate("/dashboard");
        } else if (role === "admin" || role === "administrador") {
          navigate("/admin");
        } else if (role === "padre" || role === "apoderado") {
          navigate("/padre");
        } else {
          // Default fallback or error if role is unknown
          setError("Rol de usuario no reconocido");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Código de usuario o contraseña incorrectos");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="w-48 h-48 bg-transparent flex items-center justify-center mx-auto mb-8">
              <img src={logo} alt="Tesla Logo" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-4xl font-bold text-primary-foreground mb-2">
              Academia
            </h1>
            <p className="text-5xl font-bold text-accent mb-8">TESLA</p>

            <div className="max-w-md mx-auto">
              <p className="text-lg text-primary-foreground/80 italic">
                "La educación es el arma más poderosa que puedes usar para cambiar el mundo."
              </p>
              <p className="text-sm text-primary-foreground/60 mt-4">
                — Nelson Mandela
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-8 left-8 flex items-center gap-2 text-primary-foreground/60">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm">Formando futuros profesionales</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-32 h-32 flex items-center justify-center mx-auto mb-4">
              <img src={logo} alt="Tesla Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Academia TESLA</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-muted-foreground">
              Ingresa tu código de usuario para continuar
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="userCode">Código de Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="userCode"
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="Ej: ALU001"
                  className="pl-10 input-tesla h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 input-tesla h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-muted-foreground">Recordarme</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 btn-tesla-accent text-lg"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-2">Credenciales de prueba:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Contraseña:</strong> 1234 </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿Necesitas ayuda?{" "}
            <button className="text-primary hover:underline">
              Contacta a soporte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
