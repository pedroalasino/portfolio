import { createRoot } from "react-dom/client";
import { CatalogoCards } from "@/components/ui/catalogo-cards";
import "./index.css";

function mount() {
  const el = document.getElementById("catalogo-cards-root");
  if (!el) return;
  createRoot(el).render(<CatalogoCards />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
