import Image from "next/image"
import Link from "next/link"

export default function PagoPage() {
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
            <Link href="/" aria-label="Volver" className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </span>
            </Link>
            <span className="text-xl font-semibold text-white">Configura tu plan</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">Forma de pago</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#2b2b2b] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                      <input
                        type="text"
                        placeholder="Numero de tarjeta"
                        className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-400/40"
                      />
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <img src="/visa.png" alt="Visa" className="h-8 w-auto object-contain" />
                        <img src="/master.png" alt="Mastercard" className="h-8 w-auto object-contain" />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Fecha de vencimiento"
                        className="rounded-2xl border border-white/10 bg-[#2b2b2b] px-4 py-3 text-sm text-white placeholder-slate-400 outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] focus:ring-2 focus:ring-blue-400/40"
                      />
                      <input
                        type="text"
                        placeholder="Codigo de seguridad"
                        className="rounded-2xl border border-white/10 bg-[#2b2b2b] px-4 py-3 text-sm text-white placeholder-slate-400 outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] focus:ring-2 focus:ring-blue-400/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">
                    Direccion de facturacion
                  </h2>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="rounded-2xl border border-white/10 bg-[#2b2b2b] px-4 py-3 text-sm text-white placeholder-slate-400 outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] focus:ring-2 focus:ring-blue-400/40"
                    />
                    <input
                      type="text"
                      placeholder="Pais o region"
                      className="rounded-2xl border border-white/10 bg-[#2b2b2b] px-4 py-3 text-sm text-white placeholder-slate-400 outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] focus:ring-2 focus:ring-blue-400/40"
                    />
                    <input
                      type="text"
                      placeholder="Primera linea de la direccion"
                      className="w-full rounded-2xl border border-white/10 bg-[#2b2b2b] px-4 py-3 text-sm text-white placeholder-slate-400 outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] focus:ring-2 focus:ring-blue-400/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="space-y-5">
                <h3 className="text-2xl font-semibold text-white">Plan premium</h3>
                <div className="space-y-3 text-sm text-slate-200">
                  <p className="font-semibold text-slate-100">Caracteristicas principales</p>
                  <ul className="space-y-2">
                    {[
                      "Menus ilimitados",
                      "IA para fotos y textos",
                      "Analiticas en tiempo real",
                      "Banners y eventos",
                      "Multi idioma automatico",
                      "Filtros y PDF imprimible",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/10 pt-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Suscripcion mensualmente</span>
                    <span className="text-white">€ 29,00</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>VAT (0%)</span>
                    <span className="text-white">$ 0,00</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-base font-semibold text-white">
                    <span>Adeudado hoy</span>
                    <span>€ 29,00</span>
                  </div>
                </div>

                <button className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition hover:scale-[1.01]">
                  Suscribete
                </button>
                <p className="text-xs text-slate-400">
                  Al suscribirte, aceptas los Terminos de servicio y la Politica de privacidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
