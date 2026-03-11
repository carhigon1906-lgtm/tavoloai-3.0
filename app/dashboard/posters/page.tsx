"use client"

import Link from "next/link"
import { ImagePlus } from "lucide-react"
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"
import { useState } from "react"

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

export default function PostersPage() {
  const [mode, setMode] = useState<"promotion" | "event">("promotion")
  const [promotionType, setPromotionType] = useState("plato")
  const [promoText, setPromoText] = useState("Jueves 2x1")
  const [promoDate, setPromoDate] = useState("Todos los jueves")
  const [eventName, setEventName] = useState("Concierto en vivo")
  const [eventDate, setEventDate] = useState("Viernes 21:00")
  const [eventText, setEventText] = useState("Musica en vivo y ambiente especial")
  const [generatedImageUrl, setGeneratedImageUrl] = useState("")
  const [generationError, setGenerationError] = useState("")
  const [generationStatus, setGenerationStatus] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePoster = async () => {
    const cleanTitle =
      mode === "promotion"
        ? `${promoText.trim() || "Promocion especial"} - ${promotionType.trim() || "general"}`
        : eventName.trim() || "Evento especial"

    const cleanDescription =
      mode === "promotion"
        ? `${promoText.trim() || "Promocion especial"} para ${promotionType.trim() || "general"}, ${promoDate.trim() || "disponible por tiempo limitado"}.`
        : `${eventDate.trim() || "Proximamente"}. ${eventText.trim() || "Evento especial en el local"}.`

    if (!cleanTitle || !cleanDescription) {
      setGenerationError("Completa el titulo y la descripcion.")
      setGenerationStatus("")
      setGeneratedImageUrl("")
      return
    }

    setIsGenerating(true)
    setGenerationError("")
    setGenerationStatus("Generando afiche con Hugging Face...")

    try {
      const response = await fetch("/api/posters/huggingface", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          subtitle: cleanDescription,
          mode,
          promotionType: mode === "promotion" ? promotionType.trim() : undefined,
          promoDate: mode === "promotion" ? promoDate.trim() : undefined,
          eventDate: mode === "event" ? eventDate.trim() : undefined,
          eventText: mode === "event" ? eventText.trim() : undefined,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setGenerationError(payload?.error || "No se pudo generar el afiche.")
        setGenerationStatus("")
        setGeneratedImageUrl("")
        return
      }

      setGeneratedImageUrl(payload?.imageUrl || "")
      setGenerationStatus("Afiche generado.")
    } catch {
      setGenerationError("Ocurrio un error al generar el afiche.")
      setGenerationStatus("")
      setGeneratedImageUrl("")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.28em] text-white/45 ${bodyFont.className}`}>Poster Studio</p>
            <h1 className={`mt-3 text-3xl text-white sm:text-4xl ${displayFont.className}`}>Generador de afiches</h1>
            <p className={`mt-3 max-w-xl text-sm text-white/65 ${bodyFont.className}`}>
              Version simple para probar la generacion con Hugging Face.
            </p>
          </div>
          <Link
            href="/dashboard"
            className={`rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 ${bodyFont.className}`}
          >
            Volver
          </Link>
        </div>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <ImagePlus className="h-5 w-5 text-white/80" />
            </div>
            <div>
              <h2 className={`text-lg text-white ${displayFont.className}`}>Brief minimo</h2>
              <p className={`text-sm text-white/55 ${bodyFont.className}`}>Muy pocos campos. La IA completa el resto.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("promotion")}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  mode === "promotion" ? "border-[#d6a35d] bg-[#d6a35d]/15 text-white" : "border-white/10 bg-white/5 text-white/70"
                } ${bodyFont.className}`}
              >
                Crear promocion
              </button>
              <button
                type="button"
                onClick={() => setMode("event")}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  mode === "event" ? "border-[#d6a35d] bg-[#d6a35d]/15 text-white" : "border-white/10 bg-white/5 text-white/70"
                } ${bodyFont.className}`}
              >
                Crear evento
              </button>
            </div>

            {mode === "promotion" ? (
              <>
                <label className={`grid gap-2 text-sm text-white/70 ${bodyFont.className}`}>
                  Que quieres promocionar?
                  <select
                    value={promotionType}
                    onChange={(event) => setPromotionType(event.target.value)}
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-white/25 focus:outline-none"
                  >
                    <option value="plato">plato</option>
                    <option value="bebida">bebida</option>
                    <option value="menu">menu</option>
                    <option value="general">general</option>
                  </select>
                </label>

                <label className={`grid gap-2 text-sm text-white/70 ${bodyFont.className}`}>
                  Texto corto de la promo
                  <input
                    value={promoText}
                    onChange={(event) => setPromoText(event.target.value)}
                    placeholder="Ej: Jueves 2x1"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
                  />
                </label>

                <label className={`grid gap-2 text-sm text-white/70 ${bodyFont.className}`}>
                  Fecha o dia
                  <input
                    value={promoDate}
                    onChange={(event) => setPromoDate(event.target.value)}
                    placeholder="Ej: Todos los jueves"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
                  />
                </label>
              </>
            ) : (
              <>
                <label className={`grid gap-2 text-sm text-white/70 ${bodyFont.className}`}>
                  Nombre del evento
                  <input
                    value={eventName}
                    onChange={(event) => setEventName(event.target.value)}
                    placeholder="Ej: Concierto en vivo"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
                  />
                </label>

                <label className={`grid gap-2 text-sm text-white/70 ${bodyFont.className}`}>
                  Dia y hora
                  <input
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                    placeholder="Ej: Viernes 21:00"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
                  />
                </label>

                <label className={`grid gap-2 text-sm text-white/70 ${bodyFont.className}`}>
                  Texto corto
                  <input
                    value={eventText}
                    onChange={(event) => setEventText(event.target.value)}
                    placeholder="Ej: Musica en vivo y ambiente especial"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
                  />
                </label>
              </>
            )}

            <button
              type="button"
              onClick={generatePoster}
              disabled={isGenerating}
              className={`inline-flex h-12 items-center justify-center rounded-2xl bg-[#d6a35d] px-5 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${bodyFont.className}`}
            >
              {isGenerating ? "Generando..." : "Generar afiche"}
            </button>
          </div>

          {generationError && (
            <div className={`mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 ${bodyFont.className}`}>
              {generationError}
            </div>
          )}

          {!generationError && generationStatus && (
            <div className={`mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 ${bodyFont.className}`}>
              {generationStatus}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          {generatedImageUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className={`text-lg text-white ${displayFont.className}`}>Resultado</h3>
                  <p className={`text-sm text-white/55 ${bodyFont.className}`}>Imagen generada con el brief actual.</p>
                </div>
                <a
                  href={generatedImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 ${bodyFont.className}`}
                >
                  Abrir imagen
                </a>
              </div>

              <img src={generatedImageUrl} alt="Afiche generado con Hugging Face" className="w-full rounded-[22px] border border-white/10" />
            </div>
          ) : (
            <div className={`flex min-h-[320px] items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-black/20 text-sm text-white/35 ${bodyFont.className}`}>
              Aqui aparecera el afiche generado.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
