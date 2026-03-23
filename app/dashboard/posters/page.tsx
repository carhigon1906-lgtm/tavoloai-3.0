"use client"

import Link from "next/link"
import { ImagePlus } from "lucide-react"
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"
import { useEffect, useState } from "react"

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

const DETAILED_PROMPT_PRESETS = {
  plato:
    "Create a premium fine-dining food campaign image for a restaurant poster. The main dish must be the only clear hero subject and must occupy the visual center of attention. Use refined plating, appetizing textures, realistic ingredients, soft visible steam only if natural, rich warm side lighting, subtle specular highlights, shallow depth of field, dark editorial background, luxury gastronomy styling, and a polished advertising look. The image must feel expensive, cinematic, clean, and highly intentional. Keep the background elegant and controlled, with soft falloff and no distracting props. Reserve negative space for copy overlay. Do not add text, logos, hands, extra plates, cutlery clutter, random garnishes, menu boards, or decorative elements that compete with the hero dish.",
  bebida:
    "Create a luxury beverage campaign visual for a premium restaurant or cocktail bar poster. The drink must be the single dominant hero object with impeccable glass detail, condensation, crisp reflections, controlled highlights, optional ice with realistic transparency, deep moody background, and dramatic studio lighting inspired by nightlife hospitality advertising. The mood should feel exclusive, modern, seductive, and premium. Use strong contrast, glossy surfaces, and a clean composition with elegant negative space for later copy placement. Do not add text, brand labels, bar clutter, extra bottles, random fruit overload, messy splashes, hands, or multiple competing objects unless they are subtle and clearly secondary.",
  menu:
    "Create an editorial restaurant campaign background that suggests a curated menu experience rather than a single product shot. Use a magazine-inspired composition with sophisticated food styling, balanced spacing, premium materials, and a clear visual hierarchy. The image should feel like high-end hospitality advertising with elegant surfaces, controlled lighting, tasteful arrangement of 2 to 4 culinary elements maximum, and deliberate negative space for promotional copy. Keep the scene refined, coherent, and uncluttered. Avoid busy buffet aesthetics, cheap stock-photo styling, too many dishes, random utensils, visible text, logos, menus, chalkboards, or crowded table settings.",
  general:
    "Create a premium restaurant advertising background with a strong commercial look, elevated hospitality branding, cinematic contrast, polished composition, and clear focal hierarchy. The scene should communicate exclusivity, quality, and appetite appeal without becoming noisy. Use elegant lighting, realistic textures, premium restaurant atmosphere, and a composed frame with enough clean negative space for text overlay. The art direction must feel deliberate and campaign-ready, not generic. Do not include visible words, logos, watermarks, signage, cluttered objects, chaotic scenes, cheap decor, or low-end stock imagery aesthetics.",
  event:
    "Create a premium nightlife and restaurant event campaign background for a sophisticated venue poster. The scene must communicate atmosphere, anticipation, and upscale energy. Use cinematic venue lighting, controlled highlights, subtle haze only if it improves depth, elegant crowd energy, a refined sense of live performance or DJ ambience, premium hospitality mood, and a composition that feels like editorial nightlife advertising. The frame should preserve a strong dark area or negative space for event text overlay. Do not generate readable text, posters on walls, neon words, logos, watermarks, chaotic crowds, amateur club aesthetics, or overexposed stage effects.",
} as const

const PROMPT_PRESETS = {
  plato: "Fotografia gastronomica premium, plato protagonista en primer plano, fondo editorial oscuro, vapor sutil, luz calida lateral, texturas apetitosas, composicion limpia de campaña.",
  bebida: "Bebida protagonista con look nightlife premium, hielo, condensacion, brillos controlados, fondo profundo, iluminacion dramatica de estudio, reflejos elegantes, energia nocturna.",
  menu: "Composicion editorial para campana de menu, varios elementos bien estilizados, look premium de restaurante, jerarquia visual limpia, superficie sofisticada, direccion de arte de revista.",
  general: "Afiche comercial premium para restaurante, branding elegante, sujeto claro, composicion pulida, contraste cinematografico, atmosfera exclusiva, look publicitario refinado.",
  event: "Ambiente nocturno sofisticado, venue con energia real, luces tenues, profundidad cinematografica, publico elegante, escenario o performance insinuada, estilo editorial premium.",
} as const

const PROMPT_PRESET_LABELS = {
  plato: "Chef Signature",
  bebida: "After Dark",
  menu: "Editorial Spread",
  general: "Brand Poster",
  event: "Live Night",
} as const

type PromptPresetKey = keyof typeof PROMPT_PRESETS

function getDefaultPromptPresetKey(mode: "promotion" | "event", promotionType: string): PromptPresetKey {
  if (mode === "event") {
    return "event"
  }

  if (promotionType === "plato" || promotionType === "bebida" || promotionType === "menu" || promotionType === "general") {
    return promotionType
  }

  return "general"
}

export default function PostersPage() {
  const [mode, setMode] = useState<"promotion" | "event">("promotion")
  const [promotionType, setPromotionType] = useState("plato")
  const [promoText, setPromoText] = useState("Jueves 2x1")
  const [promoDate, setPromoDate] = useState("Todos los jueves")
  const [secondaryText, setSecondaryText] = useState("")
  const [selectedPromptPreset, setSelectedPromptPreset] = useState<PromptPresetKey>("plato")
  const [promptDetails, setPromptDetails] = useState<string>(DETAILED_PROMPT_PRESETS["plato"])
  const [posterSize, setPosterSize] = useState<"1024x1536" | "1024x1024" | "1536x1024">("1024x1536")
  const [renderQuality, setRenderQuality] = useState<"medium" | "high" | "auto">("medium")
  const [eventName, setEventName] = useState("Concierto en vivo")
  const [eventDate, setEventDate] = useState("Viernes 21:00")
  const [eventText, setEventText] = useState("Musica en vivo y ambiente especial")
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState("")
  const [generationError, setGenerationError] = useState("")
  const [generationErrorCode, setGenerationErrorCode] = useState("")
  const [generationStatus, setGenerationStatus] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const nextPreset = getDefaultPromptPresetKey(mode, promotionType)
    setSelectedPromptPreset(nextPreset)
    setPromptDetails(DETAILED_PROMPT_PRESETS[nextPreset])
  }, [mode, promotionType])

  const applyPromptPreset = (presetKey: PromptPresetKey) => {
    setSelectedPromptPreset(presetKey)
    setPromptDetails(DETAILED_PROMPT_PRESETS[presetKey])
  }

  const generatePoster = async () => {
    const cleanTitle =
      mode === "promotion"
        ? promoText.trim() || "Promocion especial"
        : eventName.trim() || "Evento especial"

    const cleanDescription =
      mode === "promotion"
        ? `${promoText.trim() || "Promocion especial"} para ${promotionType.trim() || "general"}, ${promoDate.trim() || "disponible por tiempo limitado"}.`
        : `${eventDate.trim() || "Proximamente"}. ${eventText.trim() || "Evento especial en el local"}.`

    if (!cleanTitle || !cleanDescription) {
      setGenerationError("Completa el titulo y la descripcion.")
      setGenerationErrorCode("validation_error")
      setGenerationStatus("")
      setGeneratedImageUrl("")
      return
    }

    setIsGenerating(true)
    setGenerationError("")
    setGenerationErrorCode("")
    setGenerationStatus("Generando afiche con OpenAI...")

    try {
      const formData = new FormData()
      formData.append("title", cleanTitle)
      formData.append("subtitle", cleanDescription)
      formData.append("secondaryText", secondaryText.trim())
      formData.append("creativeBrief", promptDetails.trim())
      formData.append("mode", mode)
      formData.append("size", posterSize)
      formData.append("quality", renderQuality)
      if (mode === "promotion") {
        formData.append("promotionType", promotionType.trim())
        formData.append("promoDate", promoDate.trim())
      }
      if (mode === "event") {
        formData.append("eventDate", eventDate.trim())
        formData.append("eventText", eventText.trim())
      }
      if (referenceImage) {
        formData.append("referenceImage", referenceImage)
      }

      const response = await fetch("/api/posters/openai", {
        method: "POST",
        body: formData,
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setGenerationError(payload?.error || "No se pudo generar el afiche.")
        setGenerationErrorCode(payload?.errorCode || "")
        setGenerationStatus("")
        setGeneratedImageUrl("")
        return
      }

      setGeneratedImageUrl(payload?.imageUrl || "")
      setGenerationErrorCode("")
      setGenerationStatus(
        payload?.usedReferenceImage
          ? `Afiche final compuesto con imagen de referencia${payload?.processingMs ? ` en ${payload.processingMs} ms` : ""}.`
          : `Afiche final compuesto${payload?.processingMs ? ` en ${payload.processingMs} ms` : ""}.`,
      )
    } catch {
      setGenerationError("Ocurrio un error al generar el afiche.")
      setGenerationErrorCode("client_fetch_error")
      setGenerationStatus("")
      setGeneratedImageUrl("")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#070b12] via-[#0a111d] to-[#05070c] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.14),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_42%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.28em] text-white/45 ${bodyFont.className}`}>Poster Studio</p>
            <h1 className={`mt-3 text-3xl text-white sm:text-5xl ${displayFont.className}`}>Generador de afiches</h1>
            <p className={`mt-3 max-w-2xl text-sm text-slate-300 sm:text-base ${bodyFont.className}`}>
              Una interfaz mas limpia para armar promociones y eventos con una estetica inspirada en superficies de iOS.
            </p>
          </div>
          <Link
            href="/dashboard"
            className={`rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/15 ${bodyFont.className}`}
          >
            Volver
          </Link>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_38%,rgba(34,211,238,0.08)_100%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/10 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                    <ImagePlus className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <h2 className={`text-xl text-white ${displayFont.className}`}>Crea tu afiche en segundos</h2>
                    <p className={`text-sm text-slate-300 ${bodyFont.className}`}>Completa unos pocos datos y genera una pieza lista para promocionar tu negocio.</p>
                  </div>
                </div>
                <div className={`rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.12)] ${bodyFont.className}`}>
                  OpenAI
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-[#0b1525]/70 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMode("promotion")}
                    className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                      mode === "promotion"
                        ? "bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-white shadow-[0_12px_24px_rgba(34,211,238,0.18)]"
                        : "text-slate-400 hover:bg-white/5"
                    } ${bodyFont.className}`}
                  >
                    Crear promocion
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("event")}
                    className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                      mode === "event"
                        ? "bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-white shadow-[0_12px_24px_rgba(34,211,238,0.18)]"
                        : "text-slate-400 hover:bg-white/5"
                    } ${bodyFont.className}`}
                  >
                    Crear evento
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {mode === "promotion" ? (
                  <>
                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Que quieres promocionar?
                      <select
                        value={promotionType}
                        onChange={(event) => setPromotionType(event.target.value)}
                        className="h-13 rounded-[22px] border border-white/10 bg-[#0b1525] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      >
                        <option value="plato" className="bg-[#0b1525] text-white">
                          plato
                        </option>
                        <option value="bebida" className="bg-[#0b1525] text-white">
                          bebida
                        </option>
                        <option value="menu" className="bg-[#0b1525] text-white">
                          menu
                        </option>
                        <option value="general" className="bg-[#0b1525] text-white">
                          general
                        </option>
                      </select>
                    </label>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Texto corto de la promo
                      <input
                        value={promoText}
                        onChange={(event) => setPromoText(event.target.value)}
                        placeholder="Ej: Jueves 2x1"
                        className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      />
                    </label>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Fecha o dia
                      <input
                        value={promoDate}
                        onChange={(event) => setPromoDate(event.target.value)}
                        placeholder="Ej: Todos los jueves"
                        className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      />
                    </label>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Texto secundario opcional
                      <input
                        value={secondaryText}
                        onChange={(event) => setSecondaryText(event.target.value)}
                        placeholder="Ej: Solo por tiempo limitado"
                        className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      />
                    </label>

                    <div className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Direccion visual
                      <div className="flex flex-wrap gap-2">
                        {(["plato", "bebida", "menu", "general"] as const).map((presetKey) => (
                          <button
                            key={presetKey}
                            type="button"
                            onClick={() => applyPromptPreset(presetKey)}
                            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] transition ${
                              selectedPromptPreset === presetKey
                                ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {PROMPT_PRESET_LABELS[presetKey]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                        Formato
                        <select
                          value={posterSize}
                          onChange={(event) => setPosterSize(event.target.value as "1024x1536" | "1024x1024" | "1536x1024")}
                          className="h-13 rounded-[22px] border border-white/10 bg-[#0b1525] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                        >
                          <option value="1024x1536" className="bg-[#0b1525] text-white">
                            Vertical poster
                          </option>
                          <option value="1024x1024" className="bg-[#0b1525] text-white">
                            Cuadrado
                          </option>
                          <option value="1536x1024" className="bg-[#0b1525] text-white">
                            Horizontal
                          </option>
                        </select>
                      </label>

                      <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                        Calidad
                        <select
                          value={renderQuality}
                          onChange={(event) => setRenderQuality(event.target.value as "medium" | "high" | "auto")}
                          className="h-13 rounded-[22px] border border-white/10 bg-[#0b1525] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                        >
                          <option value="medium" className="bg-[#0b1525] text-white">
                            Media
                          </option>
                          <option value="high" className="bg-[#0b1525] text-white">
                            Alta
                          </option>
                          <option value="auto" className="bg-[#0b1525] text-white">
                            Auto
                          </option>
                        </select>
                      </label>
                    </div>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Imagen de referencia
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => setReferenceImage(event.target.files?.[0] || null)}
                        className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-100"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Nombre del evento
                      <input
                        value={eventName}
                        onChange={(event) => setEventName(event.target.value)}
                        placeholder="Ej: Concierto en vivo"
                        className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      />
                    </label>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Dia y hora
                      <input
                        value={eventDate}
                        onChange={(event) => setEventDate(event.target.value)}
                        placeholder="Ej: Viernes 21:00"
                        className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      />
                    </label>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Texto corto
                      <input
                        value={eventText}
                        onChange={(event) => setEventText(event.target.value)}
                        placeholder="Ej: Musica en vivo y ambiente especial"
                        className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      />
                    </label>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Texto secundario opcional
                      <input
                        value={secondaryText}
                        onChange={(event) => setSecondaryText(event.target.value)}
                        placeholder="Ej: Cupos limitados y reserva recomendada"
                        className="h-13 rounded-[22px] border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                      />
                    </label>

                    <div className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Direccion visual
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyPromptPreset("event")}
                          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] transition ${
                            selectedPromptPreset === "event"
                              ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {PROMPT_PRESET_LABELS["event"]}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                        Formato
                        <select
                          value={posterSize}
                          onChange={(event) => setPosterSize(event.target.value as "1024x1536" | "1024x1024" | "1536x1024")}
                          className="h-13 rounded-[22px] border border-white/10 bg-[#0b1525] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                        >
                          <option value="1024x1536" className="bg-[#0b1525] text-white">
                            Vertical poster
                          </option>
                          <option value="1024x1024" className="bg-[#0b1525] text-white">
                            Cuadrado
                          </option>
                          <option value="1536x1024" className="bg-[#0b1525] text-white">
                            Horizontal
                          </option>
                        </select>
                      </label>

                      <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                        Calidad
                        <select
                          value={renderQuality}
                          onChange={(event) => setRenderQuality(event.target.value as "medium" | "high" | "auto")}
                          className="h-13 rounded-[22px] border border-white/10 bg-[#0b1525] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl focus:border-cyan-400/60 focus:outline-none"
                        >
                          <option value="medium" className="bg-[#0b1525] text-white">
                            Media
                          </option>
                          <option value="high" className="bg-[#0b1525] text-white">
                            Alta
                          </option>
                          <option value="auto" className="bg-[#0b1525] text-white">
                            Auto
                          </option>
                        </select>
                      </label>
                    </div>

                    <label className={`grid gap-2 text-sm text-slate-300 ${bodyFont.className}`}>
                      Imagen de referencia
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => setReferenceImage(event.target.files?.[0] || null)}
                        className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-100"
                      />
                    </label>
                  </>
                )}

                <button
                  type="button"
                  onClick={generatePoster}
                  disabled={isGenerating}
                  className={`inline-flex h-14 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#101727,#1d2942)] px-5 text-sm font-semibold text-white shadow-[0_22px_35px_rgba(18,28,49,0.28)] transition hover:translate-y-[-1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${bodyFont.className}`}
                >
                  {isGenerating ? "Generando..." : "Generar afiche"}
                </button>
              </div>

              {generationError && (
                <div className={`mt-4 rounded-[22px] border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl ${bodyFont.className}`}>
                  <p>{generationError}</p>
                  {generationErrorCode && <p className="mt-2 text-xs uppercase tracking-[0.2em] text-red-100/75">Codigo: {generationErrorCode}</p>}
                </div>
              )}

              {!generationError && generationStatus && (
                <div className={`mt-4 rounded-[22px] border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 backdrop-blur-xl ${bodyFont.className}`}>
                  {generationStatus}
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/10 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0)_52%),linear-gradient(180deg,rgba(34,211,238,0.1),rgba(255,255,255,0)_40%)]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className={`text-xl text-white ${displayFont.className}`}>Tu afiche</h3>
                  <p className={`mt-1 text-sm text-slate-300 ${bodyFont.className}`}>Aqui veras el resultado listo para compartir en redes o usar en tu local.</p>
                </div>
                {generatedImageUrl && (
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={generatedImageUrl}
                      download="afiche-tavoloai.png"
                      className={`rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-cyan-400/15 ${bodyFont.className}`}
                    >
                      Descargar afiche
                    </a>
                    <a
                      href={generatedImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/15 ${bodyFont.className}`}
                    >
                      Abrir imagen
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-5 flex min-h-[520px] flex-1 items-center justify-center rounded-[28px] border border-white/10 bg-[#0a1220]/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {generatedImageUrl ? (
                  <div className="relative w-full max-w-[420px]">
                    <div className="pointer-events-none absolute inset-[-8%] rounded-[34px] bg-[radial-gradient(circle,_rgba(34,211,238,0.24)_0%,_rgba(34,211,238,0)_65%)] blur-2xl" />
                    <img
                      src={generatedImageUrl}
                      alt="Afiche generado con OpenAI"
                      className="relative w-full rounded-[30px] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[420px] rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_22px_50px_rgba(0,0,0,0.32)]">
                    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#0f1a2d,#0b1220)] p-5">
                      <div className="rounded-[22px] bg-[linear-gradient(180deg,#102033,#1b3150)] p-5 text-white shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
                        <p className={`text-[11px] uppercase tracking-[0.28em] text-white/60 ${bodyFont.className}`}>
                          {mode === "promotion" ? "Promocion" : "Evento"}
                        </p>
                        <h4 className={`mt-4 text-3xl leading-tight ${displayFont.className}`}>
                          {mode === "promotion" ? promoText || "Tu oferta aparece aqui" : eventName || "Tu evento aparece aqui"}
                        </h4>
                        <p className={`mt-3 text-sm text-white/72 ${bodyFont.className}`}>
                          {mode === "promotion" ? promoDate || "Fecha o disponibilidad" : eventDate || "Dia y hora"}
                        </p>
                        <div className="mt-6 rounded-[18px] bg-white/10 p-3 backdrop-blur-xl">
                          <p className={`text-sm text-white/78 ${bodyFont.className}`}>
                            {mode === "promotion"
                              ? "La composicion final se genera aqui con look editorial, luz suave y tipografia protagonista."
                              : eventText || "El texto corto del evento se usara para darle tono y jerarquia visual."}
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
