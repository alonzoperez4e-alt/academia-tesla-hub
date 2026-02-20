import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { api } from "./services/api";
import { authSession } from "./services/authSession";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

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