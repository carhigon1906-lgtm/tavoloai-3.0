// @ts-nocheck
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Dish = {
  foto_url?: string
}

type Category = {
  platos?: Dish[]
}

type MenuRow = {
  logo_url?: string
  categories?: Category[]
}

type MediaImage = {
  url: string
  label: string
}

export default function MediaLabPage() {
  const [images, setImages] = useState<MediaImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<MediaImage | null>(null)

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
        .select("logo_url, categories")
        .eq("user_id", session.user.id)

      if (error) {
        setError("No pudimos cargar tus imágenes.")
        setLoading(false)
        return
      }

      const seen = new Set<string>()
      const results: MediaImage[] = []

      const menus = (data ?? []) as MenuRow[]
      menus.forEach((menu) => {
        if (menu.logo_url && !seen.has(menu.logo_url)) {
          seen.add(menu.logo_url)
          results.push({ url: menu.logo_url, label: "Logo" })
        }

        const categories = Array.isArray(menu.categories) ? menu.categories : []
        categories.forEach((category) => {
          const dishes = Array.isArray(category.platos) ? category.platos : []
          dishes.forEach((dish) => {
            if (dish?.foto_url && !seen.has(dish.foto_url)) {
              seen.add(dish.foto_url)
              results.push({ url: dish.foto_url, label: "Plato" })
            }
          })
        })
      })

      setImages(results)
      setLoading(false)
    }

    loadImages()
  }, [])

  const hasImages = useMemo(() => images.length > 0, [images.length])

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setSelected(img)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:-translate-y-1 hover:border-white/30"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.label}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-sm text-slate-300">{img.label}</div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" role="dialog">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1f] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <p className="text-sm font-semibold text-white">{selected.label}</p>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
                onClick={() => setSelected(null)}
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-black">
              <img src={selected.url} alt={selected.label} className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
