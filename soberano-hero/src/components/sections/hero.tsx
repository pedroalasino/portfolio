'use client'

import { useEffect, useState } from "react"
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight"

export function HeroSoberanoLab() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Escena 3D ocupando TODO el hero, sin huecos ni columnas.
          En mobile baja la opacidad para que no compita con el texto. */}
      <div className="absolute inset-0 w-full h-full opacity-60 md:opacity-100">
        {!reducedMotion && (
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        )}
      </div>

      {!reducedMotion && (
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20 z-10"
          fill="white"
        />
      )}

      {/* Overlay degradado para legibilidad del texto sobre el 3D */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />

      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
        <span className="text-sm text-neutral-400 mb-4 tracking-[0.2em] uppercase font-sans">
          SoberanoLab
        </span>
        <h1 className="text-5xl md:text-7xl leading-[1.05] text-white font-serif font-semibold">
          Tu propia IA.
          <br />
          Sin depender de nadie.
        </h1>
        <p className="mt-6 text-neutral-300 text-lg max-w-md font-sans">
          Infraestructura propia. Sin nube de terceros.
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="#ia-experience"
            className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            Hablar con la IA
          </a>
          <a
            href="#productos"
            className="px-6 py-3 border border-neutral-600 text-white rounded-full font-medium hover:border-neutral-400 transition font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            Ver catálogo
          </a>
        </div>
      </div>
    </section>
  )
}
