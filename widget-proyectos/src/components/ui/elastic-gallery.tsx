import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

interface ElasticItemProps {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
  href: string;
}

const defaultItems: ElasticItemProps[] = [
  {
    id: "01",
    title: "SoberanoLab",
    category: "Empresa de IA Soberana",
    src: "img/proyectos/soberanolab.jpg",
    alt: "SoberanoLab",
    href: "https://elegant-druid-1eeeec.netlify.app/",
  },
  {
    id: "02",
    title: "LMASM Deco",
    category: "Sistema de Cotización Inteligente",
    src: "img/proyectos/lmasm.jpg",
    alt: "LMASM Deco",
    href: "https://lmasm.com/",
  },
  {
    id: "03",
    title: "INTBIZ",
    category: "Sitio Corporativo Internacional",
    src: "img/proyectos/intbiz.jpg",
    alt: "INTBIZ",
    href: "https://extraordinary-duckanoo-881294.netlify.app/",
  },
  {
    id: "04",
    title: "Bodegas Gianochio",
    category: "Sistema Multi-Agente",
    src: "img/proyectos/gianochio.jpg",
    alt: "Bodegas Gianochio",
    href: "https://tubular-alfajores-f38bff.netlify.app/",
  },
  {
    id: "05",
    title: "Expolajas",
    category: "Sistema Laboral con IA",
    src: "img/proyectos/expolajas.jpg",
    alt: "Expolajas",
    href: "https://beamish-youtiao-8a4648.netlify.app/",
  },
  {
    id: "06",
    title: "Salvatierra",
    category: "Asistente Comercial con IA",
    src: "img/proyectos/salvatierra.jpg",
    alt: "Salvatierra",
    href: "https://boisterous-boba-b1d665.netlify.app/",
  },
];

function ElasticGallery({ items = defaultItems }: { items?: ElasticItemProps[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="w-full bg-[#DDDDDA]">
      <div className="flex h-[500px] w-full flex-col gap-2 md:h-[600px] md:flex-row md:gap-4">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setActiveId(item.id)}
            onClick={(e) => {
              // En touch/mobile, el primer tap solo activa el panel.
              if (activeId !== item.id) {
                e.preventDefault();
                setActiveId(item.id);
              }
            }}
            className={cn(
              "relative block cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950",
              "transition-[flex,filter] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
              activeId === item.id ? "flex-[4]" : "flex-[1]",
              activeId === item.id ? "brightness-100" : "brightness-50 hover:brightness-75"
            )}
          >
            <div className="absolute inset-0 h-full w-full">
              <img
                src={item.src}
                alt={item.alt}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-1000",
                  activeId === item.id ? "scale-100" : "scale-110"
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500",
                  activeId === item.id ? "opacity-100" : "opacity-0"
                )}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex h-full flex-col justify-end p-4 md:p-8">
              <div
                className={cn(
                  "flex flex-col gap-2 transition-all duration-500",
                  activeId === item.id
                    ? "translate-y-0 opacity-100 delay-200"
                    : "translate-y-12 opacity-0"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md md:px-3 md:text-xs">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-2xl font-black uppercase leading-none text-white md:text-5xl">
                  {item.title}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 md:mt-4 md:text-sm">
                  Ver proyecto <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </div>

              <div
                className={cn(
                  "absolute transition-all duration-500",
                  "bottom-4 left-1/2 -translate-x-1/2 md:bottom-8",
                  activeId === item.id ? "opacity-0 scale-50" : "opacity-100 delay-500"
                )}
              >
                <span className="hidden whitespace-nowrap text-xl font-bold uppercase tracking-widest text-white [writing-mode:vertical-rl] md:block">
                  {item.title}
                </span>
                <span className="block text-xs font-bold text-white md:hidden">{item.id}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export { ElasticGallery };
