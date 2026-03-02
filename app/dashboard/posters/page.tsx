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

  const paletteStyle = useMemo(() => {
    if (palette === "amber") {
      return "from-amber-300/60 via-orange-400/50 to-rose-500/50"
    }
    if (palette === "emerald") {
      return "from-emerald-300/60 via-teal-400/50 to-cyan-500/50"
    }
    return "from-cyan-300/70 via-sky-500/55 to-indigo-500/50"
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
      setPresetsError("No pudimos cargar tus presets.")
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

    const name =
      presetName.trim() ||
      title?.trim() ||
      `Preset ${savedPresets.length + 1}`

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
      setPresetsError("No pudimos guardar el preset.")
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04070f] via-[#0b1324] to-[#02040a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(34,211,238,0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_30%,rgba(59,130,246,0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(15,23,42,0.75),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 lg:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                DISEÑADOR DE AFICHES IA
              </span>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Diseñador de afiches IA</h1>
              <p className="mt-2 max-w-2xl text-base text-slate-300">
                Afiches listos para redes y menú con estética premium, transparencias y estilo iOS.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Volver al dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <LayoutTemplate className="h-5 w-5 text-cyan-100" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Brief creativo</h2>
                  <p className="text-xs text-slate-400">Define el contenido y el tono del afiche.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2 text-sm text-slate-300">
                  Título principal
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
                    placeholder="Ej: Miércoles de sushi"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Subtítulo
                  <input
                    value={subtitle}
                    onChange={(event) => setSubtitle(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
                    placeholder="Ej: 20% off en rolls premium"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Llamado a la acción
                  <input
                    value={cta}
                    onChange={(event) => setCta(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
                    placeholder="Ej: Reserva ahora"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Sparkles className="h-5 w-5 text-cyan-100" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Estilo visual</h2>
                  <p className="text-xs text-slate-400">Transparencias y glassmorphism con acentos.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-300">
                  Formato
                  <select
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-[#0b1424] px-4 py-3 text-sm text-white focus:border-cyan-300/60 focus:outline-none"
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
                    className="rounded-2xl border border-white/10 bg-[#0b1424] px-4 py-3 text-sm text-white focus:border-cyan-300/60 focus:outline-none"
                  >
                    <option value="premium">Premium nocturno</option>
                    <option value="fresh">Fresco y luminoso</option>
                    <option value="bold">Bold y contrastado</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Paleta
                  <select
                    value={palette}
                    onChange={(event) => setPalette(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-[#0b1424] px-4 py-3 text-sm text-white focus:border-cyan-300/60 focus:outline-none"
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
                    className="rounded-2xl border border-white/10 bg-[#0b1424] px-4 py-3 text-sm text-white focus:border-cyan-300/60 focus:outline-none"
                  >
                    <option value="elegant">Elegante</option>
                    <option value="editorial">Editorial</option>
                    <option value="modern">Moderno</option>
                  </select>
                  <span className={`rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs ${moodStyle.title}`}>
                    Vista previa: Tavolo Bistro
                  </span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={includePrice}
                    onChange={(event) => setIncludePrice(event.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-cyan-300 focus:ring-cyan-300/50"
                  />
                  Mostrar precio destacado
                </label>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-50 shadow-[0_15px_45px_rgba(34,211,238,0.3)] transition hover:bg-cyan-400/30"
                >
                  Generar afiche
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    className="min-w-[180px] flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
                    placeholder="Nombre del preset"
                  />
                  <button
                    type="button"
                    onClick={savePreset}
                    disabled={presetsLoading}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    Guardar preset
                  </button>
                  <button
                    type="button"
                    onClick={loadPresets}
                    disabled={presetsLoading}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    Recargar presets
                  </button>
                </div>
                <span className="text-xs text-slate-400">Generación instantánea con estilo iOS.</span>
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
                          ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-50"
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
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${paletteStyle} p-[1px]`}>
                <div className={`relative ${posterSize} w-full rounded-[23px] bg-[#0b1424]/85 p-6`}>
                  <div className="absolute inset-0 rounded-[23px] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
                  <div className="absolute inset-0 rounded-[23px] bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_45%)]" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] text-cyan-100/80 ${moodStyle.badge}`}>
                        {tone === "fresh" ? "Fresh" : tone === "bold" ? "Bold" : "Premium"}
                      </span>
                      <span
                        className={`rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-white/80 ${moodStyle.badge}`}
                      >
                        Tavolo AI
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h3 className={`text-2xl font-semibold text-white sm:text-3xl ${moodStyle.title}`}>
                        {title || "Título principal"}
                      </h3>
                      <p className={`text-sm ${moodStyle.body}`}>{subtitle || "Subtítulo del afiche"}</p>
                      {includePrice && (
                        <div
                          className={`inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold text-white ${moodStyle.price}`}
                        >
                          Desde $9.990
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-200/80" />
                          Solo hoy
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span className={moodStyle.body}>Disponible en pedido online</span>
                      <span
                        className={`rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/80 ${moodStyle.cta}`}
                      >
                        {cta || "CTA"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>Vista previa dinámica</span>
                <span>•</span>
                <span>Transparencias y glow suave</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <h3 className="text-lg font-semibold text-white">Entregables rápidos</h3>
              <p className="mt-2 text-sm text-slate-400">
                Genera versiones para feed, story y encabezado del menú en un clic.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Feed 4:5", "Story 9:16", "Square 1:1", "Header menú 16:9"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10"
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
