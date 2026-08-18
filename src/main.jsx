import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PressaoQuest from "../pressao-quest-completo.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PressaoQuest />
  </StrictMode>
);
