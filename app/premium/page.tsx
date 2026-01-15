import Image from "next/image"
import Link from "next/link"

const premiumHighlights = [
  "Menús ilimitados con edición avanzada",
  "IA para textos e imágenes con plantillas pro",
  "QR avanzado con opciones de personalización",
  "Descarga en PDF y exportaciones rápidas",
  "Multiidioma automático para turistas",
  "Promociones, afiches y banners listos",
  "Estadísticas de visitas y platos top",
  "Comparte tu carta en redes en un clic",
]

const freeVsPremium = [
  { label: "Cantidad de menús", free: "1 menú", premium: "Ilimitados" },
  { label: "Edición de platos", free: "Básica", premium: "Completa + IA" },
  { label: "QR", free: "Básico", premium: "Avanzado y personalizable" },
  { label: "Exportaciones", free: "No", premium: "PDF y descargas" },
  { label: "Analíticas", free: "No", premium: "Sí, en tiempo real" },
  { label: "Promociones", free: "No", premium: "Sí, listas para redes" },
]

export default function PremiumInfoPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-slate-100">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />

        <div className="absolute left-6 top-6 z-10">
          <Image src="/logoblanco.png" alt="TavoloAI" width={40} height={40} className="h-10 w-10 object-contain" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Link href="/#pricing" aria-label="Volver a precios" className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </span>
            </Link>
            <span className="text-xl font-semibold text-white">Plan Premium</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-white">Todo lo que necesitas para vender más</h2>
                  <p className="text-base text-slate-300">
                    El plan Premium centraliza tu carta digital, la promoción de platos y la analítica en un solo lugar.
                    Diseñado para equipos que quieren velocidad, control y resultados.
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-[0_12px_28px_rgba(16,185,129,0.25)]">
                    Sin contratos. Cancela cuando quieras.
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">Incluye</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {premiumHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                        <span className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-blue-400" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Free vs Premium</h3>
                  <p className="text-sm text-slate-300">
                    Lo esencial para arrancar en Free, y todas las mejoras clave para escalar en Premium.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-slate-200">
                  {freeVsPremium.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">{row.label}</p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Free: {row.free}</span>
                        <span className="text-white">Premium: {row.premium}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <Link
                    href="/pago"
                    className="inline-flex w-full items-center justify-center rounded-full bg-white py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
                  >
                    Continuar con el pago
                  </Link>
                  <p className="mt-3 text-xs text-slate-400">
                    Puedes volver al plan Free cuando quieras desde tu panel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
