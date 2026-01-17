import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Role = "alumno" | "admin";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("alumno");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (role === "alumno") {
      navigate("/dashboard");
    } else {
      navigate("/admin");
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
            <div className="w-24 h-24 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Zap className="w-14 h-14 text-primary" />
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
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Academia TESLA</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-secondary rounded-xl p-1 mb-8">
            <button
              onClick={() => setRole("alumno")}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200",
                role === "alumno"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Alumno
            </button>
            <button
              onClick={() => setRole("admin")}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200",
                role === "admin"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Administrador
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
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
