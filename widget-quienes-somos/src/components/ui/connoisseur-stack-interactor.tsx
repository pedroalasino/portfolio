import { cn } from "@/lib/utils";
import { useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";

interface MenuItem {
  num: string;
  name: string;
  desc: string;
  clipId: string;
  image: string;
}

const defaultItems: MenuItem[] = [
  {
    num: "01",
    name: "Infraestructura privada",
    desc: "Corre en tu propio servidor. Nada de lo que pasa ahí sale a la nube de un tercero.",
    clipId: "clip-bands",
    // TODO: reemplazar por la foto real que va a mandar Pedro
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    num: "02",
    name: "Marca blanca",
    desc: "Vendé IA con tu propia marca, corriendo sobre nuestra infraestructura por detrás.",
    clipId: "clip-hexagons",
    // TODO: reemplazar por la foto real que va a mandar Pedro
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    num: "03",
    name: "Agentes a medida",
    desc: "Entrenados con tu información y alojados donde vos decidas.",
    clipId: "clip-pixels",
    // TODO: reemplazar por la foto real que va a mandar Pedro
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
];

export const Component = ({
  items = defaultItems,
  className,
}: { items?: MenuItem[]; className?: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<SVGImageElement>(null);
  const mainGroupRef = useRef<SVGGElement>(null);
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  const createLoop = (index: number) => {
    const item = items[index];
    const selector = `#${item.clipId} .path`;

    if (masterTl.current) masterTl.current.kill();

    if (imageRef.current) imageRef.current.setAttribute("href", item.image);
    if (mainGroupRef.current) mainGroupRef.current.setAttribute("clip-path", `url(#${item.clipId})`);

    gsap.set(selector, { scale: 0, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    tl.to(selector, {
      scale: 1,
      duration: 0.8,
      stagger: { amount: 0.4, from: "random" },
      ease: "expo.out",
    })
      .to(selector, {
        scale: 1.05,
        duration: 1.5,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
        stagger: { amount: 0.2, from: "center" },
      })
      .to(selector, {
        scale: 0,
        duration: 0.6,
        stagger: { amount: 0.3, from: "edges" },
        ease: "expo.in",
      });

    masterTl.current = tl;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      createLoop(0);
    }, containerRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemHover = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    createLoop(index);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col w-full p-8 md:p-16 overflow-hidden bg-[#0A0A0A]",
        className
      )}
    >
      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.95] text-white mt-6 mb-16">
        Quiénes somos y qué hacemos
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-16">
      {/* IZQUIERDA: LISTA */}
      <div className="z-20 w-full md:w-1/2">
        <nav>
          <ul className="flex flex-col gap-14">
            {items.map((item, index) => (
              <li
                key={item.num}
                onMouseEnter={() => handleItemHover(index)}
                className="group cursor-pointer"
              >
                <div className="flex items-start gap-6">
                  <span
                    className={cn(
                      "text-3xl font-bold transition-all duration-500 mt-2",
                      activeIndex === index ? "text-orange-500 scale-110" : "text-zinc-600"
                    )}
                  >
                    {item.num}
                  </span>

                  <div className="flex flex-col">
                    <h2
                      className={cn(
                        "text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] transition-all duration-700",
                        activeIndex === index
                          ? "text-white opacity-100 translate-x-4"
                          : "text-transparent opacity-70 translate-x-0 [-webkit-text-stroke:1.5px_#52525b]"
                      )}
                    >
                      {item.name}
                    </h2>
                    <p
                      className={cn(
                        "text-zinc-400 text-sm md:text-base max-w-[36ch] overflow-hidden transition-all duration-500 ease-out",
                        activeIndex === index
                          ? "max-h-20 opacity-100 translate-x-4 mt-3"
                          : "max-h-0 opacity-0 translate-x-0 mt-0"
                      )}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* DERECHA: IMAGEN CON RECORTES ANIMADOS */}
      <div className="relative w-full md:w-1/2 flex justify-center items-center">
        <svg
          viewBox="0 0 500 500"
          className="w-full max-w-[440px] h-auto z-10 drop-shadow-[0_0_60px_rgba(0,0,0,0.8)]"
        >
          <defs>
            <clipPath id="clip-bands">
              <rect className="path" x="20" y="20" width="460" height="55" rx="27" />
              <rect className="path" x="20" y="95" width="460" height="85" rx="20" />
              <rect className="path" x="20" y="200" width="460" height="65" rx="20" />
              <rect className="path" x="20" y="285" width="460" height="85" rx="20" />
              <rect className="path" x="20" y="390" width="460" height="90" rx="27" />
            </clipPath>

            <clipPath id="clip-hexagons">
              <rect className="path" x="20" y="20" width="200" height="280" rx="12" />
              <rect className="path" x="20" y="320" width="200" height="160" rx="12" />
              <rect className="path" x="240" y="20" width="240" height="140" rx="12" />
              <rect className="path" x="240" y="180" width="110" height="160" rx="12" />
              <rect className="path" x="370" y="180" width="110" height="160" rx="12" />
              <rect className="path" x="240" y="360" width="240" height="120" rx="12" />
            </clipPath>

            <clipPath id="clip-pixels">
              {Array.from({ length: 9 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x={(i % 3) * 160 + 20}
                  y={Math.floor(i / 3) * 160 + 20}
                  width="140"
                  height="140"
                  rx="4"
                />
              ))}
            </clipPath>
          </defs>

          <g ref={mainGroupRef} clipPath={`url(#${items[0].clipId})`}>
            <image
              ref={imageRef}
              href={items[0].image}
              width="500"
              height="500"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </svg>
      </div>
      </div>
    </div>
  );
};
