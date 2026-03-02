// @ts-nocheck
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Dish = {
  id?: number
  foto_url?: string
}

type Category = {
  id?: number
  platos?: Dish[]
}

type MenuRow = {
  id: number
  logo_url?: string
  categories?: Category[]
}

type MediaImage = {
  id: string
  url: string
  label: string
  sources: Array<{ menuId: number; kind: "logo" | "dish"; dishId?: number }>
}

export default function MediaLabPage() {
  const [images, setImages] = useState<MediaImage[]>([])
  const [menus, setMenus] = useState<MenuRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<MediaImage | null>(null)
  const [enhancing, setEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState("")
  const [pendingUpdates, setPendingUpdates] = useState<
    Record<string, { image: MediaImage; originalUrl: string; tmpUrl: string }>
  >({})
  const [savingChanges, setSavingChanges] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Debes iniciar sesión para ver tus imágenes.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("menus")
        .select("id, logo_url, categories")
        .eq("user_id", session.user.id)

      if (error) {
        setError("No pudimos cargar tus imágenes.")
        setLoading(false)
        return
      }

      const imagesByUrl = new Map<string, MediaImage>()
      const menus = (data ?? []) as MenuRow[]

      menus.forEach((menu) => {
        if (menu.logo_url) {
          const existing = imagesByUrl.get(menu.logo_url)
          if (existing) {
            existing.sources.push({ menuId: menu.id, kind: "logo" })
          } else {
            imagesByUrl.set(menu.logo_url, {
              id: `media-${imagesByUrl.size + 1}`,
              url: menu.logo_url,
              label: "Logo",
              sources: [{ menuId: menu.id, kind: "logo" }],
            })
          }
        }

        const categories = Array.isArray(menu.categories) ? menu.categories : []
        categories.forEach((category, categoryIndex) => {
          const dishes = Array.isArray(category.platos) ? category.platos : []
          dishes.forEach((dish, dishIndex) => {
            if (!dish?.foto_url) return
            const existing = imagesByUrl.get(dish.foto_url)
            const dishId = typeof dish.id === "number" ? dish.id : undefined
            if (existing) {
              existing.sources.push({ menuId: menu.id, kind: "dish", dishId })
            } else {
              imagesByUrl.set(dish.foto_url, {
                id: `media-${imagesByUrl.size + 1}`,
                url: dish.foto_url,
                label: "Plato",
                sources: [{ menuId: menu.id, kind: "dish", dishId }],
              })
            }
          })
        })
      })

      setMenus(menus)
      setImages(Array.from(imagesByUrl.values()))
      setLoading(false)
    }

    loadImages()
  }, [])

  const hasImages = useMemo(() => images.length > 0, [images.length])
  const hasPendingChanges = useMemo(() => Object.keys(pendingUpdates).length > 0, [pendingUpdates])

  const parseStoragePath = (publicUrl: string) => {
    try {
      const url = new URL(publicUrl)
      const marker = "/storage/v1/object/public/"
      const idx = url.pathname.indexOf(marker)
      if (idx === -1) return null
      const remainder = url.pathname.slice(idx + marker.length)
      const [bucket, ...pathParts] = remainder.split("/")
      const path = pathParts.join("/")
      if (!bucket || !path) return null
      return { bucket, path }
    } catch {
      return null
    }
  }

  const uploadToStorage = async (file: File, path: string, bucket?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", path)
    if (bucket) formData.append("bucket", bucket)

    const response = await fetch("/api/menu/upload-dish-photo", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("No se pudo subir la imagen mejorada.")
    }

    const result = await response.json()
    if (!result?.publicUrl) {
      throw new Error("No se pudo obtener la URL de la imagen mejorada.")
    }

    return result.publicUrl as string
  }

  const enhanceWithClaid = async () => {
    if (!selected) return
    setEnhancing(true)
    setEnhanceError("")
    setSaveSuccess("")

    try {
      const originalUrl = selected.url
      const sourceResponse = await fetch(selected.url)
      if (!sourceResponse.ok) {
        throw new Error("No se pudo descargar la imagen.")
      }
      const sourceBlob = await sourceResponse.blob()
      const fileName = `media-${Date.now()}.png`
      const file = new File([sourceBlob], fileName, { type: sourceBlob.type || "image/png" })

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/media/claid-enhance", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload?.error || "No se pudo mejorar la imagen."
        const status = payload?.status
        const requestId = payload?.requestId
        const details = [status ? `status ${status}` : "", requestId ? `request ${requestId}` : ""]
          .filter(Boolean)
          .join(" · ")
        throw new Error(details ? `${message} (${details})` : message)
      }

      const payload = await response.json()
      const tmpUrl = payload?.tmpUrl
      if (!tmpUrl || typeof tmpUrl !== "string") {
        throw new Error("Respuesta inválida del servicio de mejora.")
      }

      setSelected((prev) => (prev ? { ...prev, url: tmpUrl } : prev))
      setImages((prev) => prev.map((img) => (img.id === selected.id ? { ...img, url: tmpUrl } : img)))
      setPendingUpdates((prev) => ({
        ...prev,
        [selected.id]: { image: selected, originalUrl, tmpUrl },
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo mejorar la imagen."
      setEnhanceError(message)
    } finally {
      setEnhancing(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!hasPendingChanges) return
    setSavingChanges(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Debes iniciar sesión para guardar cambios.")
      }

      const updates = Object.values(pendingUpdates)
      const nextMenus = [...menus]
      const menusById = new Map<number, MenuRow>(
        nextMenus.map((menu) => [
          menu.id,
          {
            ...menu,
            categories: Array.isArray(menu.categories) ? menu.categories : [],
          },
        ]),
      )
      const touchedMenus = new Set<number>()
      let nextImages = [...images]
      let nextSelected = selected

      for (const update of updates) {
        const { image, originalUrl, tmpUrl } = update
        const enhancedResponse = await fetch(tmpUrl)
        if (!enhancedResponse.ok) {
          throw new Error("No se pudo descargar la imagen mejorada.")
        }
        const blob = await enhancedResponse.blob()
        const file = new File([blob], `media-${Date.now()}.png`, { type: blob.type || "image/png" })

        const parsed = parseStoragePath(originalUrl)
        let publicUrl = originalUrl
        if (parsed) {
          publicUrl = await uploadToStorage(file, parsed.path, parsed.bucket)
        } else {
          const fallbackPath = `${session.user.id}/media-${Date.now()}.png`
          publicUrl = await uploadToStorage(file, fallbackPath, "menu-assets")
        }

        if (publicUrl !== originalUrl) {
          image.sources.forEach((source) => {
            const menu = menusById.get(source.menuId)
            if (!menu) return
            if (source.kind === "logo") {
              menu.logo_url = publicUrl
              touchedMenus.add(source.menuId)
              return
            }
            const categories = Array.isArray(menu.categories) ? menu.categories : []
            menu.categories = categories.map((category) => ({
              ...category,
              platos: Array.isArray(category.platos)
                ? category.platos.map((dish) =>
                    dish.id === source.dishId ? { ...dish, foto_url: publicUrl } : dish,
                  )
                : [],
            }))
            touchedMenus.add(source.menuId)
          })
        }

        nextImages = nextImages.map((img) => (img.id === image.id ? { ...img, url: publicUrl } : img))
        if (nextSelected?.id === image.id) {
          nextSelected = { ...nextSelected, url: publicUrl }
        }
      }

      for (const menuId of touchedMenus) {
        const menu = menusById.get(menuId)
        if (!menu) continue
        const { error } = await supabase
          .from("menus")
          .update({
            logo_url: menu.logo_url,
            categories: menu.categories,
            updated_at: new Date().toISOString(),
          })
          .eq("id", menuId)
        if (error) {
          throw new Error("No se pudieron guardar los cambios en el menú.")
        }
      }

      setMenus(Array.from(menusById.values()))
      setImages(nextImages)
      setSelected(nextSelected)
      setPendingUpdates({})
      setSaveSuccess("Cambios guardados.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron guardar los cambios."
      setSaveError(message)
    } finally {
      setSavingChanges(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#0a0b1f] to-[#020208] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(139,92,246,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_28%,rgba(217,70,239,0.18),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">
            ✨ Estudio Fotográfico IA
          </span>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Estudio fotográfico IA</h1>
          <p className="mt-2 text-base text-slate-300">
            Fotos de platos con acabado profesional, listas para publicar.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Volver al dashboard
          </Link>
        </section>

        <section className="grid gap-6">
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Cargando imágenes...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              {error}
            </div>
          )}

          {!loading && !error && !hasImages && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Aún no tienes imágenes guardadas.
            </div>
          )}

          {!loading && !error && hasImages && (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300">Selecciona una imagen para verla y mejorarla.</p>
                {hasPendingChanges && (
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={savingChanges}
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-cyan-300/40 bg-gradient-to-r from-cyan-500/25 via-white/5 to-cyan-500/25 px-4 py-2 text-xs font-semibold text-cyan-100 shadow-[0_0_18px_rgba(56,189,248,0.4)] transition hover:border-cyan-300/70 hover:text-white hover:shadow-[0_0_28px_rgba(56,189,248,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">{savingChanges ? "Guardando..." : "Guardar cambios"}</span>
                  </button>
                )}
              </div>
              {saveError && (
                <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-xs text-rose-200">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-xs text-emerald-100">
                  {saveSuccess}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelected(img)}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:-translate-y-1 hover:border-white/30"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-black/20">
                      <img
                        src={img.url}
                        alt={img.label}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="px-4 py-3 text-xs text-slate-300">{img.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4" role="dialog">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar"
            onClick={() => setSelected(null)}
          />
          <div className="photo-modal relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1f]/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <p className="text-sm font-semibold text-white">{selected.label}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={enhanceWithClaid}
                  disabled={enhancing}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-300/40 bg-gradient-to-r from-emerald-500/30 via-white/5 to-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.4)] transition hover:border-emerald-300/80 hover:text-white hover:shadow-[0_0_26px_rgba(52,211,153,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="rainbow-orbit pointer-events-none absolute -inset-[2px] rounded-full bg-[conic-gradient(from_180deg,rgba(59,130,246,0.6),rgba(236,72,153,0.6),rgba(250,204,21,0.6),rgba(34,197,94,0.6),rgba(59,130,246,0.6))] opacity-70 blur-[6px] transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute -inset-px rounded-full border border-white/30 opacity-30" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{enhancing ? "Mejorando..." : "Mejorar con IA"}</span>
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
                  onClick={() => setSelected(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="relative flex max-h-[80vh] items-center justify-center overflow-hidden bg-transparent">
              <div className="pointer-events-none absolute inset-0 -z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.28),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.22),transparent_60%)]" />
              </div>
              <img
                src={selected.url}
                alt={selected.label}
                className="photo-image relative z-10 max-h-[80vh] w-auto max-w-full object-contain"
              />
            </div>
            {enhanceError && (
              <div className="border-t border-rose-400/30 bg-rose-500/10 px-6 py-3 text-xs text-rose-100">
                {enhanceError}
              </div>
            )}
            <style>{`
              @keyframes photoModalEnter {
                0% { opacity: 0; transform: translateY(16px) scale(0.96); }
                60% { opacity: 1; transform: translateY(0) scale(1.01); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes photoImageEnter {
                0% { opacity: 0; transform: scale(0.98); }
                100% { opacity: 1; transform: scale(1); }
              }
              .photo-modal {
                animation: photoModalEnter 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
              }
              .photo-image {
                animation: photoImageEnter 500ms ease-out;
              }
              @keyframes rainbowSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes rainbowPulse {
                0%, 100% { opacity: 0.55; }
                50% { opacity: 1; }
              }
              .rainbow-orbit {
                animation: rainbowSpin 3s linear infinite, rainbowPulse 1.6s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  )
}
