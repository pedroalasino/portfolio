import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as PricingCard from "@/components/ui/pricing-card";
import { Sparkles, Building2, CheckCircle2 } from "lucide-react";

type ProductKey =
  | "asistente-comercial"
  | "cotizador-inteligente"
  | "atencion-cliente"
  | "web-inteligente";

const PRODUCTS: Record<ProductKey, { name: string; desc: string }> = {
  "asistente-comercial": {
    name: "Asistente Comercial 24/7",
    desc: "Responde dudas y guía la compra en tiendas online, las 24 horas, sin fuga de datos.",
  },
  "cotizador-inteligente": {
    name: "Cotizador Inteligente",
    desc: "Calcula precios y entrega el PDF de cotización al instante.",
  },
  "atencion-cliente": {
    name: "Atención al Cliente",
    desc: "Resuelve preguntas frecuentes, horarios y dudas básicas para cualquier rubro.",
  },
  "web-inteligente": {
    name: "Página Web Inteligente",
    desc: "E-commerce o landing page con un agente de IA integrado, corriendo en infraestructura propia.",
  },
};

const OPTIONS: { key: ProductKey; label: string }[] = [
  { key: "asistente-comercial", label: "Vender y atender clientes todo el día" },
  { key: "cotizador-inteligente", label: "Calcular precios o cotizaciones al instante" },
  { key: "atencion-cliente", label: "Responder preguntas frecuentes (horarios, dudas)" },
  { key: "web-inteligente", label: "Tener un agente integrado en mi página web" },
];

type Step = "idle" | "question" | "thinking" | "result";

function DiagnosticCard() {
  const [step, setStep] = useState<Step>("idle");
  const [match, setMatch] = useState<ProductKey | null>(null);

  function choose(key: ProductKey) {
    setMatch(key);
    setStep("thinking");
    window.setTimeout(() => setStep("result"), 900);
  }

  function reset() {
    setStep("idle");
    setMatch(null);
  }

  const product = match ? PRODUCTS[match] : null;

  return (
    <PricingCard.Card className="max-w-md">
      <PricingCard.Header>
        <PricingCard.Plan>
          <PricingCard.PlanName>
            <Sparkles />
            <span>Encontrá tu agente</span>
          </PricingCard.PlanName>
        </PricingCard.Plan>
        {step === "idle" && (
          <Button className="w-full font-semibold" onClick={() => setStep("question")}>
            Iniciar diagnóstico
          </Button>
        )}
      </PricingCard.Header>

      <PricingCard.Body>
        <PricingCard.Description>
          Respondé una pregunta y nuestra propia IA te dice qué sistema conviene para tu negocio.
          El precio lo ves recién al entrar a Mercado Pago.
        </PricingCard.Description>

        {step === "question" && (
          <div className="space-y-3">
            <p className="text-foreground text-sm">¿Qué necesitás resolver primero en tu negocio?</p>
            <ul className="space-y-2">
              {OPTIONS.map((opt) => (
                <li key={opt.key}>
                  <button
                    type="button"
                    onClick={() => choose(opt.key)}
                    className="border-border/80 text-foreground hover:border-primary w-full rounded-md border bg-white/[.02] px-4 py-3 text-left text-sm transition-colors hover:bg-white/[.06]"
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === "thinking" && (
          <p className="text-muted-foreground font-mono text-sm">analizando tu negocio con SOBERAI...</p>
        )}

        {step === "result" && product && (
          <div className="space-y-4">
            <PricingCard.Badge>recomendado para vos</PricingCard.Badge>
            <h4 className="text-foreground text-lg font-bold">{product.name}</h4>
            <p className="text-muted-foreground text-sm">{product.desc}</p>
            <Button asChild className="w-full font-semibold">
              <a
                href="https://www.mercadopago.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="buy-btn"
                data-product={product.name}
              >
                Ver precio y comprar
              </a>
            </Button>
            <button
              type="button"
              onClick={reset}
              className="text-muted-foreground hover:text-foreground block font-mono text-xs underline"
            >
              ‹ Volver a empezar
            </button>
          </div>
        )}
      </PricingCard.Body>
    </PricingCard.Card>
  );
}

function ProviderCard() {
  const benefits = [
    "Vendé IA con tu propia marca",
    "Corre sobre nuestra infraestructura",
    "Soporte técnico incluido",
    "Sin desarrollar nada desde cero",
  ];
  return (
    <PricingCard.Card className="max-w-md">
      <PricingCard.Header>
        <PricingCard.Plan>
          <PricingCard.PlanName>
            <Building2 />
            <span>Marca blanca</span>
          </PricingCard.PlanName>
        </PricingCard.Plan>
        <Button asChild className="w-full font-semibold">
          <a href="#contacto">Hablemos</a>
        </Button>
      </PricingCard.Header>
      <PricingCard.Body>
        <PricingCard.Description>
          ¿Vendés soluciones digitales? Ofrecele IA a tus clientes con tu propia marca.
        </PricingCard.Description>
        <PricingCard.List>
          {benefits.map((b) => (
            <PricingCard.ListItem key={b}>
              <CheckCircle2 className="text-foreground h-4 w-4" aria-hidden="true" />
              <span>{b}</span>
            </PricingCard.ListItem>
          ))}
        </PricingCard.List>
      </PricingCard.Body>
    </PricingCard.Card>
  );
}

export function CatalogoCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      <DiagnosticCard />
      <ProviderCard />
    </div>
  );
}
