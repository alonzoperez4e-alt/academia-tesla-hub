import { useState } from "react";
import { Button } from "@/components/ui/button";

import { getAssetUrl } from "@/lib/utils";

import { useAuth } from "@/contexts/AuthContext";

const logo = getAssetUrl("logo/logo-academia.jpg");

const Login = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signIn();
      // signIn() triggers a full-page redirect to the Cognito Hosted UI;
      // execution normally never reaches past this point.
    } catch (err) {
      console.error("No se pudo iniciar el flujo de inicio de sesión:", err);
      setError("No se pudo iniciar sesión. Intenta nuevamente.");
      setIsLoading(false);
    }
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

      {/* Right Side - Login */}
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
              Inicia sesión con tu cuenta institucional para continuar
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="button"
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full h-12 btn-tesla-accent text-lg"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

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
