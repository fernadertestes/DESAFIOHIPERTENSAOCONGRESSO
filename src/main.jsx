import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PressaoQuest, { AppErrorBoundary } from "../pressao-quest-completo.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <PressaoQuest />
    </AppErrorBoundary>
  </StrictMode>
);
