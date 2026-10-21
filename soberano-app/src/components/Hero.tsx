'use client'

import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export function Hero() {
  return (
    <Card className="w-full min-h-[100svh] bg-black relative overflow-hidden border-0 rounded-none">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="flex flex-col md:flex-row h-full min-h-[100svh]">
        {/* Izquierda: nuestro copy */}
        <div className="flex-1 p-8 md:p-14 relative z-10 flex flex-col justify-center">
          <span className="font-mono text-xs tracking-[0.16em] uppercase text-neutral-400 mb-4">
            Agentes de IA propios
          </span>
          <h1 className="font-mono font-extrabold text-4xl md:text-5xl leading-[1.05] text-white">
            Tu propia IA.
            <br />
            Sin depender de nadie.
          </h1>
          <p className="mt-4 text-neutral-400 max-w-md">
            Infraestructura propia. Sin nube de terceros.
          </p>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <a
              href="#ia-experience"
              className="inline-flex items-center justify-center rounded-[3px] border border-white bg-white px-6 py-3 font-mono text-sm uppercase tracking-wide text-black transition-colors hover:bg-neutral-300"
            >
              Hablar con la IA
            </a>
            <a
              href="#productos"
              className="inline-flex items-center justify-center rounded-[3px] border border-neutral-700 px-6 py-3 font-mono text-sm uppercase tracking-wide text-white transition-colors hover:border-white"
            >
              Ver catálogo
            </a>
          </div>
        </div>

        {/* Derecha: escena 3D */}
        <div className="flex-1 relative min-h-[320px]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
