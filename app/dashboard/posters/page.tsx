"use client"

import Link from "next/link"
import { ImagePlus } from "lucide-react"
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"
import { useEffect, useMemo, useRef, useState } from "react"

// ─── Fuentes ──────────────────────────────────────────────────────────────────

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PosterMode       = "promotion" | "event"
type VisualStyleChoice = "elegante" | "comercial" | "nocturno" | "premium"

/**
 * Máquina de estados para el flujo de generación.
 * Evita combinaciones imposibles como isGenerating=true + imageUrl poblado.
 */
type GenerationState =
  | { status: "idle" }
  | { status: "loading"; step: number }
  | { status: "success"; imageUrl: string; meta: string }
  | { status: "error"; message: string; code: string }

// ─── Constantes ───────────────────────────────────────────────────────────────

const GENERATION_STEPS = [
  "Construyendo el prompt visual...",
  "TavoloAI generando imagen base...",
  "Componiendo overlay y tipografía...",
  "Finalizando afiche...",
]

// Tiempo aprox por step (ms). Total ~50 s para cubrir el caso típico de ~30-45s.
const STEP_DURATIONS = [3_000, 30_000, 10_000, 7_000]

const VISUAL_STYLE_LABELS: Record<VisualStyleChoice, string> = {
  elegante:  "Elegante",
  comercial: "Comercial",
  nocturno:  "Nocturno",
  premium:   "Premium",
}

const VISUAL_STYLE_DESCRIPTIONS: Record<VisualStyleChoice, string> = {
  elegante: "Más editorial, sobrio y minimalista, con lujo silencioso y mucho aire visual.",
  comercial: "Más directo, brillante y vendedor, pensado para captar atención rápido.",
  nocturno: "Más oscuro, cinematográfico y atmosférico, con energía de noche premium.",
  premium: "Más aspiracional, exclusivo y art-directed, con sensación de campaña de alta gama.",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDisplaySchedule(date: string, hour: string) {
  const d = date.trim()
  const h = hour.trim()
  if (d && h) return `${d} ${h}`
  if (d)     return d
  if (h)     return h
  return ""
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PostersPage() {
  // Formulario
  const [mode,           setMode]          = useState<PosterMode>("promotion")
  const [title,          setTitle]         = useState("Jueves 2x1")
  const [description,    setDescription]   = useState("Promoción especial para compartir en redes y atraer clientes.")
  const [dateValue,      setDateValue]     = useState("Todos los jueves")
  const [hourValue,      setHourValue]     = useState("")
  const [visualStyle,    setVisualStyle]   = useState<VisualStyleChoice>("comercial")
  const [referenceImage, setReferenceImage]= useState<File | null>(null)

  // Estado unificado de generación
  const [generation, setGeneration] = useState<GenerationState>({ status: "idle" })

  // Ref para el intervalo de steps
  const stepIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleLabel = useMemo(() => buildDisplaySchedule(dateValue, hourValue), [dateValue, hourValue])

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => { if (stepIntervalRef.current) clearTimeout(stepIntervalRef.current) }
  }, [])

  // ─── Avance de steps de progreso ──────────────────────────────────────────

  function startStepProgress() {
    let step = 0
    setGeneration({ status: "loading", step })

    function advance() {
      step++
      if (step < GENERATION_STEPS.length - 1) {
        setGeneration({ status: "loading", step })
        stepIntervalRef.current = setTimeout(advance, STEP_DURATIONS[step] ?? 8_000)
      }
    }

    stepIntervalRef.current = setTimeout(advance, STEP_DURATIONS[0] ?? 3_000)
  }

  function stopStepProgress() {
    if (stepIntervalRef.current) {
      clearTimeout(stepIntervalRef.current)
      stepIntervalRef.current = null
    }
  }

  // ─── Generación ───────────────────────────────────────────────────────────

  const generatePoster = async () => {
    const cleanTitle       = title.trim()
    const cleanDescription = description.trim()
    const cleanSchedule    = scheduleLabel.trim()

    if (!cleanTitle || !cleanDescription) {
      setGeneration({ status: "error", message: "Completa el título y la descripción.", code: "validation_error" })
      return
    }

    const subtitle =
      mode === "event"
        ? `${cleanSchedule || "Próximamente"}. ${cleanDescription}`
        : cleanSchedule
          ? `${cleanDescription}. ${cleanSchedule}.`
          : cleanDescription

    const footerText =
      mode === "event"
        ? cleanSchedule ? `Reserva y asistencia ${cleanSchedule.toLowerCase()}` : "Reserva anticipada recomendada"
        : cleanSchedule ? `Disponible ${cleanSchedule.toLowerCase()}`           : "Promoción activa por tiempo limitado"

    startStepProgress()

    try {
      const formData = new FormData()
      formData.append("title",         cleanTitle)
      formData.append("subtitle",      subtitle)
      formData.append("metaText",      cleanSchedule)
      formData.append("secondaryText", cleanDescription)
      formData.append("footerText",    footerText)
      formData.append("visualStyle",   visualStyle)
      formData.append("mode",          mode)
      formData.append("size",          "1024x1536")
      formData.append("quality",       "medium")

      if (mode === "promotion") {
        formData.append("promoDate", cleanSchedule)
      } else {
        formData.append("eventDate",  cleanSchedule)
        formData.append("eventText",  cleanDescription)
      }

      if (referenceImage) {
        formData.append("referenceImage", referenceImage)
      }

      // Avanzar al último step mientras esperamos la respuesta
      setGeneration({ status: "loading", step: GENERATION_STEPS.length - 1 })

      const response = await fetch("/api/posters/openai", { method: "POST", body: formData })
      const payload  = await response.json().catch(() => null)

      if (!response.ok) {
        setGeneration({
          status:  "error",
          message: payload?.error  || "No se pudo generar el afiche.",
          code:    payload?.errorCode || "unknown_error",
        })
        return
      }

      const imageUrl = payload?.imageUrl || ""
      const meta = payload?.usedReferenceImage
        ? `Afiche compuesto con imagen de referencia${payload?.processingMs ? ` · ${payload.processingMs} ms` : ""}.`
        : `Afiche generado correctamente${payload?.processingMs ? ` · ${payload.processingMs} ms` : ""}.`

      setGeneration({ status: "success", imageUrl, meta })
    } catch {
      setGeneration({ status: "error", message: "Ocurrió un error al generar el afiche.", code: "client_fetch_error" })
    } finally {
      stopStepProgress()
    }
  }

  // ─── Derivados de estado ──────────────────────────────────────────────────

  const isGenerating   = generation.status === "loading"
  const generatedUrl   = generation.status === "success" ? generation.imageUrl : ""
  const currentStep    = generation.status === "loading"  ? generation.step : 0
  const currentStepMsg = generation.status === "loading"  ? (GENERATION_STEPS[currentStep] ?? GENERATION_STEPS[0]!) : ""

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-[#070b12] via-[#0a111d] to-[#05070c] text-white ${bodyFont.className}`}>
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.14),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_42%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Poster Studio</p>
            <h1 className={`mt-3 text-3xl text-white sm:text-5xl ${displayFont.className}`}>Crear afiche</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Completa solo lo esencial. La dirección visual, el prompt y la composición se resuelven internamente.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/15"
          >
            Volver
          </Link>
        </div>

        {/* Grid principal */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

          {/* Panel izquierdo — formulario */}
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_38%,rgba(34,211,238,0.08)_100%)]" />

            <div className="relative">
              {/* Cabecera del panel */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/10 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                    <ImagePlus className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <h2 className={`text-xl text-white ${displayFont.className}`}>Crea tu afiche en segundos</h2>
                    <p className="text-sm text-slate-300">El cliente solo define el mensaje. El sistema arma el resto.</p>
                  </div>
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.12)]">
                  OpenAI
                </div>
              </div>

              {/* Toggle modo */}
              <div className="mt-6 rounded-[24px] border border-white/10 bg-[#0b1525]/70 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["promotion", "event"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                        mode === m
                          ? "bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-white shadow-[0_12px_24px_rgba(34,211,238,0.18)]"
                          : "text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {m === "promotion" ? "Promoción" : "Evento"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos del formulario */}
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm text-slate-300">
                  Título
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={mode === "promotion" ? "Ej: Jueves 2x1" : "Ej: Concierto en vivo"}
                    className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-300">
                  Descripción
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      mode === "promotion"
                        ? "Ej: 2x1 en platos seleccionados con una presentación premium."
                        : "Ej: Noche especial con música en vivo y ambiente exclusivo."
                    }
                    rows={4}
                    className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm text-slate-300">
                    Fecha
                    <input
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      placeholder={mode === "promotion" ? "Ej: Todos los jueves" : "Ej: Viernes 15 de mayo"}
                      className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-slate-300">
                    Hora
                    <input
                      value={hourValue}
                      onChange={(e) => setHourValue(e.target.value)}
                      placeholder="Ej: 21:00"
                      className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                    />
                  </label>
                </div>

                {/* Estilo visual */}
                <div className="grid gap-2 text-sm text-slate-300">
                  Estilo visual
                  <div className="flex flex-wrap gap-2">
                    {(["elegante", "comercial", "nocturno", "premium"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setVisualStyle(s)}
                        className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                          visualStyle === s
                            ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {VISUAL_STYLE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{VISUAL_STYLE_DESCRIPTIONS[visualStyle]}</p>
                </div>

                {/* Imagen de referencia */}
                <label className="grid gap-2 text-sm text-slate-300">
                  Imagen de referencia
                  <span className="text-xs text-slate-500">PNG con transparencia, JPG o WEBP · máx. 20 MB</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setReferenceImage(e.target.files?.[0] || null)}
                    className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-100"
                  />
                  {referenceImage && (
                    <span className="text-xs text-cyan-300/80">{referenceImage.name} · {(referenceImage.size / 1024 / 1024).toFixed(1)} MB</span>
                  )}
                </label>

                {/* Botón de generación */}
                <button
                  type="button"
                  onClick={generatePoster}
                  disabled={isGenerating}
                  className="inline-flex h-14 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#101727,#1d2942)] px-5 text-sm font-semibold text-white shadow-[0_22px_35px_rgba(18,28,49,0.28)] transition hover:translate-y-[-1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGenerating ? "Generando..." : "Crear afiche"}
                </button>
              </div>

              {/* Progress steps */}
              {generation.status === "loading" && (
                <div className="mt-4 rounded-[22px] border border-cyan-300/20 bg-cyan-400/8 px-4 py-4 backdrop-blur-xl">
                  <div className="mb-3 flex gap-1">
                    {GENERATION_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          i <= currentStep ? "bg-cyan-400" : "bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-cyan-100">{currentStepMsg}</p>
                  <p className="mt-1 text-xs text-slate-400">La generación tarda entre 20 y 60 segundos.</p>
                </div>
              )}

              {/* Error */}
              {generation.status === "error" && (
                <div className="mt-4 rounded-[22px] border border-red-300/30 bg-red-400/10 px-4 py-3 backdrop-blur-xl">
                  <p className="text-sm text-red-200">{generation.message}</p>
                  {generation.code && (
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-red-100/75">Código: {generation.code}</p>
                  )}
                </div>
              )}

              {/* Éxito (meta info) */}
              {generation.status === "success" && (
                <div className="mt-4 rounded-[22px] border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 backdrop-blur-xl">
                  <p className="text-sm text-emerald-200">{generation.meta}</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho — resultado */}
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/10 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0)_52%),linear-gradient(180deg,rgba(34,211,238,0.1),rgba(255,255,255,0)_40%)]" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className={`text-xl text-white ${displayFont.className}`}>Tu afiche</h3>
                  <p className="mt-1 text-sm text-slate-300">Aquí verás el resultado listo para compartir en redes o usar en tu local.</p>
                </div>
                {generatedUrl && (
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={generatedUrl}
                      download="afiche-tavoloai.png"
                      className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-cyan-400/15"
                    >
                      Descargar
                    </a>
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/15"
                    >
                      Abrir
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-5 flex min-h-[520px] flex-1 items-center justify-center rounded-[28px] border border-white/10 bg-[#0a1220]/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {/* Generando — skeleton animado */}
                {isGenerating && (
                  <div className="w-full max-w-[420px]">
                    <div className="animate-pulse space-y-3">
                      <div className="h-[480px] rounded-[26px] bg-white/8" />
                    </div>
                    <p className="mt-3 text-center text-xs text-slate-500">Generando tu afiche...</p>
                  </div>
                )}

                {/* Resultado */}
                {!isGenerating && generatedUrl && (
                  <div className="relative w-full max-w-[420px]">
                    <div className="pointer-events-none absolute inset-[-8%] rounded-[34px] bg-[radial-gradient(circle,_rgba(34,211,238,0.24)_0%,_rgba(34,211,238,0)_65%)] blur-2xl" />
                    <img
                      src={generatedUrl}
                      alt="Afiche generado con OpenAI"
                      className="relative w-full rounded-[30px] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                )}

                {/* Placeholder inicial */}
                {!isGenerating && !generatedUrl && (
                  <div className="w-full max-w-[420px] rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_22px_50px_rgba(0,0,0,0.32)]">
                    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#0f1a2d,#0b1220)] p-5">
                      <div className="rounded-[22px] bg-[linear-gradient(180deg,#102033,#1b3150)] p-5 text-white shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
                          {mode === "promotion" ? "Promoción" : "Evento"}
                        </p>
                        <h4 className={`mt-4 text-3xl leading-tight ${displayFont.className}`}>
                          {title || "Tu mensaje aparece aquí"}
                        </h4>
                        <p className="mt-3 text-sm text-white/72">
                          {scheduleLabel || "Fecha y hora"}
                        </p>
                        <div className="mt-6 rounded-[18px] bg-white/10 p-3 backdrop-blur-xl">
                          <p className="text-sm text-white/78">
                            {description || "La descripción se usará para construir la dirección visual y el copy del afiche."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  )
}
