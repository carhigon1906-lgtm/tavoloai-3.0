// @ts-nocheck
"use client"

import Link from "next/link"
import { LayoutTemplate, Sparkles } from "lucide-react"
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

const secondaryFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

export default function PostersPage() {
  const [title, setTitle] = useState("Martes de pastas")
  const [subtitle, setSubtitle] = useState("2x1 en salsas artesanales")
  const [cta, setCta] = useState("Reserva hoy")
  const [format, setFormat] = useState("feed-4-5")
  const [tone, setTone] = useState("premium")
  const [palette, setPalette] = useState("cyan")
  const [includePrice, setIncludePrice] = useState(true)
  const [mood, setMood] = useState("elegant")
  const [presetName, setPresetName] = useState("")
  const [savedPresets, setSavedPresets] = useState<any[]>([])
  const [presetsLoading, setPresetsLoading] = useState(false)
  const [presetsError, setPresetsError] = useState("")
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  const posterSize = useMemo(() => {
    switch (format) {
      case "story":
        return "aspect-[9/16]"
      case "square":
        return "aspect-square"
      case "menu-header":
        return "aspect-[16/9]"
      default:
        return "aspect-[4/5]"
    }
  }, [format])

  const toneLabel = useMemo(() => {
    if (tone === "fresh") return "Fresh Signature"
    if (tone === "bold") return "Bold Atelier"
    return "Premium Nocturne"
  }, [tone])

  const paletteStyle = useMemo(() => {
    if (palette === "amber") {
      return "from-amber-200/90 via-orange-300/75 to-rose-400/55"
    }
    if (palette === "emerald") {
      return "from-emerald-200/85 via-teal-300/70 to-cyan-400/55"
    }
    return "from-cyan-200/90 via-sky-300/70 to-indigo-400/60"
  }, [palette])

  const paletteUi = useMemo(() => {
    if (palette === "amber") {
      return {
        focus: "focus:border-amber-300/65",
        button:
          "border-amber-200/40 bg-amber-300/20 text-amber-50 shadow-[0_14px_40px_rgba(251,191,36,0.28)] hover:bg-amber-300/30",
        selectedPreset: "border-amber-300/60 bg-amber-400/15 text-amber-50",
        dot: "bg-amber-200/90",
        badge: "text-amber-100/90",
        hover: "hover:border-amber-300/40",
      }
    }
    if (palette === "emerald") {
      return {
        focus: "focus:border-emerald-300/65",
        button:
          "border-emerald-200/40 bg-emerald-300/20 text-emerald-50 shadow-[0_14px_40px_rgba(16,185,129,0.28)] hover:bg-emerald-300/30",
        selectedPreset: "border-emerald-300/60 bg-emerald-400/15 text-emerald-50",
        dot: "bg-emerald-200/90",
        badge: "text-emerald-100/90",
        hover: "hover:border-emerald-300/40",
      }
    }
    return {
      focus: "focus:border-cyan-300/65",
      button:
        "border-cyan-200/40 bg-cyan-300/20 text-cyan-50 shadow-[0_14px_40px_rgba(34,211,238,0.28)] hover:bg-cyan-300/30",
      selectedPreset: "border-cyan-300/60 bg-cyan-400/15 text-cyan-50",
      dot: "bg-cyan-200/90",
      badge: "text-cyan-100/90",
      hover: "hover:border-cyan-300/40",
    }
  }, [palette])

  const moodStyle = useMemo(() => {
    if (mood === "editorial") {
      return {
        title: `${displayFont.className} tracking-tight`,
        body: `${secondaryFont.className} text-slate-200/90`,
        badge: `${secondaryFont.className} uppercase tracking-[0.2em]`,
        cta: `${displayFont.className} tracking-wide`,
        price: `${displayFont.className} tracking-wide`,
      }
    }
    if (mood === "modern") {
      return {
        title: `${secondaryFont.className} uppercase tracking-[0.08em]`,
        body: `${secondaryFont.className} text-slate-200/90`,
        badge: `${secondaryFont.className} uppercase tracking-[0.3em]`,
        cta: `${secondaryFont.className} uppercase tracking-[0.22em]`,
        price: `${secondaryFont.className} uppercase tracking-[0.2em]`,
      }
    }
    return {
      title: `${displayFont.className} tracking-tight`,
      body: `${secondaryFont.className} text-slate-200/90`,
      badge: `${secondaryFont.className} uppercase tracking-[0.18em]`,
      cta: `${displayFont.className} tracking-wide`,
      price: `${displayFont.className} tracking-wide`,
    }
  }, [mood])

  const buildPresetPayload = () => ({
    title,
    subtitle,
    cta,
    format,
    tone,
    palette,
    includePrice,
    mood,
  })

  const resolvePresetError = (error: any, fallback: string) => {
    const code = error?.code
    if (code === "PGRST205") {
      return "Falta la tabla 'poster_presets' en Supabase. Ejecuta el script SQL de creación."
    }
    if (code === "42501") {
      return "No tienes permisos para leer/escribir presets (RLS/policies)."
    }
    return fallback
  }

  const applyPreset = (preset: any) => {
    const data = preset?.data || {}
    if (data.title !== undefined) setTitle(data.title)
    if (data.subtitle !== undefined) setSubtitle(data.subtitle)
    if (data.cta !== undefined) setCta(data.cta)
    if (data.format !== undefined) setFormat(data.format)
    if (data.tone !== undefined) setTone(data.tone)
    if (data.palette !== undefined) setPalette(data.palette)
    if (data.includePrice !== undefined) setIncludePrice(data.includePrice)
    if (data.mood !== undefined) setMood(data.mood)
    setSelectedPresetId(preset?.id ?? null)
  }

  const loadPresets = async () => {
    setPresetsLoading(true)
    setPresetsError("")
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setPresetsError("Inicia sesión para cargar presets.")
      setPresetsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("poster_presets")
      .select("id, name, data, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      setPresetsError(resolvePresetError(error, "No pudimos cargar tus presets."))
      setPresetsLoading(false)
      return
    }

    setSavedPresets(Array.isArray(data) ? data : [])
    setPresetsLoading(false)
  }

  const savePreset = async () => {
    setPresetsLoading(true)
    setPresetsError("")
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setPresetsError("Inicia sesión para guardar presets.")
      setPresetsLoading(false)
      return
    }

    const name = presetName.trim() || title?.trim() || `Preset ${savedPresets.length + 1}`

    const { data, error } = await supabase
      .from("poster_presets")
      .insert({
        user_id: session.user.id,
        name,
        data: buildPresetPayload(),
      })
      .select("id, name, data, created_at")
      .single()

    if (error) {
      setPresetsError(resolvePresetError(error, "No pudimos guardar el preset."))
      setPresetsLoading(false)
      return
    }

    setSavedPresets((prev) => [data, ...prev])
    setPresetName("")
    setSelectedPresetId(data?.id ?? null)
    setPresetsLoading(false)
  }

  useEffect(() => {
    loadPresets()
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0c10] via-[#11131a] to-[#0c0d11] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.05),transparent_45%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 lg:px-8">
        <section className="rounded-[34px] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] p-8 shadow-[0_36px_95px_rgba(0,0,0,0.58)] backdrop-blur-2xl md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-200/90">Poster Studio</span>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">Dirección de arte premium para cada campaña</h1>
              <p className="mt-3 text-base text-slate-300">
                Diseño limpio, elegante y consistente para menú, feed y stories.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-black/40"
            >
              Volver al dashboard
            </Link>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(155deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/25">
                  <LayoutTemplate className="h-5 w-5 text-slate-100" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Brief creativo</h2>
                  <p className="text-xs text-slate-300">Mensaje comercial, promesa y llamada a la acción.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2 text-sm text-slate-300">
                  Título principal
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className={`h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none ${paletteUi.focus}`}
                    placeholder="Ej: Noche de autor"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Subtítulo
                  <input
                    value={subtitle}
                    onChange={(event) => setSubtitle(event.target.value)}
                    className={`h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none ${paletteUi.focus}`}
                    placeholder="Ej: Menú degustación + copa de cortesía"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Llamado a la acción
                  <input
                    value={cta}
                    onChange={(event) => setCta(event.target.value)}
                    className={`h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none ${paletteUi.focus}`}
                    placeholder="Ej: Reserva tu mesa"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/25">
                  <Sparkles className="h-5 w-5 text-slate-100" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Estilo visual</h2>
                  <p className="text-xs text-slate-300">Control de formato, tono, paleta y lenguaje tipográfico.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-300">
                  Formato
                  <select
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                    className={`h-12 rounded-2xl border border-white/10 bg-[#0b1424] px-4 text-sm text-white focus:outline-none ${paletteUi.focus}`}
                  >
                    <option value="feed-4-5">Feed 4:5</option>
                    <option value="story">Story 9:16</option>
                    <option value="square">Square 1:1</option>
                    <option value="menu-header">Header menú 16:9</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Tono
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    className={`h-12 rounded-2xl border border-white/10 bg-[#0b1424] px-4 text-sm text-white focus:outline-none ${paletteUi.focus}`}
                  >
                    <option value="premium">Premium Nocturne</option>
                    <option value="fresh">Fresco y luminoso</option>
                    <option value="bold">Bold Atelier</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Paleta
                  <select
                    value={palette}
                    onChange={(event) => setPalette(event.target.value)}
                    className={`h-12 rounded-2xl border border-white/10 bg-[#0b1424] px-4 text-sm text-white focus:outline-none ${paletteUi.focus}`}
                  >
                    <option value="cyan">Cian y azul</option>
                    <option value="emerald">Esmeralda</option>
                    <option value="amber">Ámbar</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Mood tipográfico
                  <select
                    value={mood}
                    onChange={(event) => setMood(event.target.value)}
                    className={`h-12 rounded-2xl border border-white/10 bg-[#0b1424] px-4 text-sm text-white focus:outline-none ${paletteUi.focus}`}
                  >
                    <option value="elegant">Elegante</option>
                    <option value="editorial">Editorial</option>
                    <option value="modern">Moderno</option>
                  </select>
                  <span className={`rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs ${moodStyle.title}`}>
                    Vista previa: Tavolo Bistro
                  </span>
                </label>
                <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={includePrice}
                    onChange={(event) => setIncludePrice(event.target.checked)}
                    className={`h-5 w-5 rounded border-white/30 bg-white/10 ${
                      palette === "emerald"
                        ? "text-emerald-300 focus:ring-emerald-300/50"
                        : palette === "amber"
                          ? "text-amber-300 focus:ring-amber-300/50"
                          : "text-cyan-300 focus:ring-cyan-300/50"
                    }`}
                  />
                  Mostrar bloque de precio destacado
                </label>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
                <button
                  type="button"
                  className={`inline-flex h-12 min-w-[152px] items-center justify-center rounded-full border px-6 text-sm font-semibold transition ${paletteUi.button}`}
                >
                  Generar afiche
                </button>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    className={`h-12 min-w-[180px] rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none ${paletteUi.focus}`}
                    placeholder="Nombre del preset"
                  />
                  <button
                    type="button"
                    onClick={savePreset}
                    disabled={presetsLoading}
                    className="inline-flex h-12 min-w-[132px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    Guardar preset
                  </button>
                  <button
                    type="button"
                    onClick={loadPresets}
                    disabled={presetsLoading}
                    className="inline-flex h-12 min-w-[132px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    Recargar presets
                  </button>
                </div>
                <span className="text-xs text-slate-300 sm:col-span-2">Sistema visual coherente para campañas premium.</span>
              </div>

              {presetsError && (
                <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">
                  {presetsError}
                </div>
              )}
              {presetsLoading && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
                  Cargando presets...
                </div>
              )}
              {!presetsLoading && savedPresets.length > 0 && (
                <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                  {savedPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`rounded-2xl border px-3 py-2 text-left transition ${
                        selectedPresetId === preset.id
                          ? paletteUi.selectedPreset
                          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <div className={`text-sm font-semibold ${moodStyle.title}`}>{preset.name}</div>
                      <div className={`mt-1 text-[11px] ${moodStyle.body}`}>
                        {preset?.data?.mood || "mood"} · {preset?.data?.format || "formato"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(150deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className={`relative overflow-hidden rounded-[24px] border border-white/15 bg-gradient-to-br ${paletteStyle} p-[1px]`}>
                <div className={`relative ${posterSize} w-full rounded-[23px] bg-[#0b1424]/88 p-6`}>
                  <div className="absolute inset-0 rounded-[23px] bg-[radial-gradient(circle_at_24%_16%,rgba(255,255,255,0.24),transparent_52%)]" />
                  <div className="absolute inset-0 rounded-[23px] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),transparent_45%)]" />
                  <div className="absolute inset-0 rounded-[23px] bg-[linear-gradient(0deg,rgba(2,6,23,0.65),rgba(2,6,23,0.18))]" />
                  <div className="absolute inset-4 rounded-[18px] border border-white/15" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] ${paletteUi.badge} ${moodStyle.badge}`}>{toneLabel}</span>
                      <span
                        className={`rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] text-white/90 ${moodStyle.badge}`}
                      >
                        Tavolo AI
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h3 className={`text-2xl font-semibold leading-tight text-white sm:text-3xl ${moodStyle.title}`}>
                        {title || "Título principal"}
                      </h3>
                      <p className={`max-w-[95%] text-sm ${moodStyle.body}`}>{subtitle || "Subtítulo del afiche"}</p>
                      {includePrice && (
                        <div
                          className={`inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/20 px-4 py-2 text-xs font-semibold text-white ${moodStyle.price}`}
                        >
                          Desde $9.990
                          <span className={`h-1.5 w-1.5 rounded-full ${paletteUi.dot}`} />
                          Edición limitada
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/75">
                      <span className={moodStyle.body}>Disponible en salón y delivery</span>
                      <span className={`rounded-full border border-white/30 bg-black/25 px-3 py-1 text-white/90 ${moodStyle.cta}`}>
                        {cta || "CTA"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400">Vista previa en tiempo real</div>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <h3 className="text-lg font-semibold text-white">Kit de entregables premium</h3>
              <p className="mt-2 text-sm text-slate-300">Exporta tu diseño en todos los formatos con coherencia visual.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Feed 4:5", "Story 9:16", "Square 1:1", "Header menú 16:9"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`h-12 rounded-2xl border border-white/15 bg-black/20 px-4 text-sm text-slate-200 transition ${paletteUi.hover} hover:bg-black/35`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
