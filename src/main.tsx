import "./polyfills";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { configureCognito } from "./services/cognito.ts";

// 1. Inicializar Cognito para que esté listo desde el arranque
configureCognito();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

// 2. Renderizar directamente la aplicación. 
// El estado de carga y verificación de sesión lo manejará el router y los hooks (useAuth) internamente.
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);