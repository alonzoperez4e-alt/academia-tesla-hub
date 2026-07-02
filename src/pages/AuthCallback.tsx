import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Hub } from "aws-amplify/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const CALLBACK_TIMEOUT_MS = 8000;

const roleToPath = (role: string | null): string | null => {
  if (role === "alumno" || role === "estudiante") return "/dashboard";
  if (role === "admin" || role === "administrador") return "/admin";
  if (role === "padre" || role === "apoderado") return "/padre";
  return null;
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, role } = useAuth();
  const [failed, setFailed] = useState(false);

  // Cognito's Hosted UI redirects here both after sign-in (with ?code=...) and after
  // sign-out (bare URL, no query params) — the logout_urls list has no dedicated route.
  // A bare landing here is a sign-out completing, not a failed login: just go to /login.
  const isSignInAttempt = searchParams.has("code");

  useEffect(() => {
    if (!isSignInAttempt) {
      navigate("/login", { replace: true });
    }
  }, [isSignInAttempt, navigate]);

  useEffect(() => {
    if (!isSignInAttempt) return;

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signInWithRedirect_failure") {
        setFailed(true);
      }
    });
    return unsubscribe;
  }, [isSignInAttempt]);

  useEffect(() => {
    if (!isSignInAttempt || failed) return;

    const timeoutId = window.setTimeout(() => {
      if (!isAuthenticated) setFailed(true);
    }, CALLBACK_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isSignInAttempt, failed, isAuthenticated]);

  useEffect(() => {
    if (!isSignInAttempt || isLoading || failed) return;

    if (!isAuthenticated) {
      setFailed(true);
      return;
    }

    const target = roleToPath(role);
    navigate(target ?? "/login", { replace: true });
  }, [isSignInAttempt, isLoading, isAuthenticated, role, failed, navigate]);

  if (!isSignInAttempt) return null;

  if (failed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            No se pudo completar el inicio de sesión
          </h2>
          <p className="text-muted-foreground">
            Ocurrió un problema al validar tu sesión con Cognito. Intenta iniciar sesión nuevamente.
          </p>
          <Button onClick={() => navigate("/login", { replace: true })}>
            Volver a intentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Completando inicio de sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
