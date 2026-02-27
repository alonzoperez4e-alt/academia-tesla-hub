import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { api } from "./services/api";
import { authSession } from "./services/authSession";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary text-muted-foreground">
    <div className="flex items-center gap-3 text-sm font-medium">
      <span className="h-3 w-3 rounded-full bg-primary animate-pulse" aria-hidden />
      Cargando...
    </div>
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

// Show a lightweight splash while refresco de sesión corre para evitar pantalla en blanco.
root.render(<LoadingScreen />);

const bootstrap = async () => {
  try {
    const { data } = await api.post<{ accessToken: string; role?: string | null }>("/auth/refresh");
    authSession.set(data.accessToken, data.role ?? null);
  } catch (error) {
    authSession.clear();
  } finally {
    root.render(<App />);
  }
};

void bootstrap();