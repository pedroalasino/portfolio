import { createRoot } from "react-dom/client";
import { Component as ServiciosStack } from "@/components/ui/connoisseur-stack-interactor";
import "./index.css";

function mount() {
  const el = document.getElementById("servicios-stack-root");
  if (!el) return;
  createRoot(el).render(<ServiciosStack />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
