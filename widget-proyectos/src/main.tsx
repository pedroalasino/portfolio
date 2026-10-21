import { createRoot } from "react-dom/client";
import { ElasticGallery } from "@/components/ui/elastic-gallery";
import "./index.css";

function mount() {
  const el = document.getElementById("proyectos-gallery-root");
  if (!el) return;
  createRoot(el).render(<ElasticGallery />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
