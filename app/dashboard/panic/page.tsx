import Link from "next/link"

export default function PanicPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#0b0f1a] to-[#020208] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(220,38,38,0.18),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">
            BOTÓN DE PÁNICO
          </span>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Botón de pánico</h1>
          <p className="mt-2 text-base text-slate-300">
            Gestión inmediata para ocultar platos agotados del menú QR.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Volver al dashboard
          </Link>
        </section>

        <section className="grid gap-6" />
      </div>
    </div>
  )
}
