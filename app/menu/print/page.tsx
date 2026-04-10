"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

type Dish = {
  id: number | string
  nombre: string
  descripcion?: string
  ingredientes?: string
  foto_url?: string
  precio?: number
  activo?: boolean
}

type Category = {
  id: number | string
  nombre: string
  platos?: Dish[]
}

type MenuPayload = {
  id?: number | string
  nombre?: string
  logo_url?: string
  categories?: Category[]
}

const formatPrice = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-"
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value)
}

export default function PrintMenuPage() {
  const searchParams = useSearchParams()
  const menuId = searchParams.get("menu") ?? ""
  const autoPrint = searchParams.get("autoprint") === "1"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menu, setMenu] = useState<MenuPayload | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const params = menuId ? `?menu=${encodeURIComponent(menuId)}` : ""
        const response = await fetch(`/api/menu/public${params}`, { cache: "no-store" })
        if (!response.ok) {
          setError("Non e stato possibile caricare il menu per la stampa.")
          setLoading(false)
          return
        }

        const result = await response.json()
        setMenu(result?.menu ?? null)
      } catch {
        setError("Non e stato possibile caricare il menu per la stampa.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [menuId])

  const printableCategories = useMemo(() => {
    const categories = Array.isArray(menu?.categories) ? menu.categories : []
    return categories
      .map((category) => ({
        id: String(category.id),
        nombre: category.nombre || "Categoria",
        platos: (category.platos ?? []).filter((dish) => dish.activo !== false),
      }))
      .filter((category) => category.platos.length > 0)
  }, [menu])

  useEffect(() => {
    if (!autoPrint || loading || error || !menu) return
    const id = window.setTimeout(() => window.print(), 450)
    return () => window.clearTimeout(id)
  }, [autoPrint, loading, error, menu])

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <main className="print-page min-h-screen bg-gradient-to-b from-[#071425] via-[#0b1a2f] to-[#081120] text-[#f2e6c9]">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
          <div className="no-print mb-5 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">
            <span>Vista pronta per la stampa in PDF</span>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-100 transition hover:bg-black/40"
            >
              Stampa / Salva PDF
            </button>
          </div>

          <header className="mb-7 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-4">
              {menu?.logo_url ? (
                <img src={menu.logo_url} alt="Logo" className="h-16 w-16 rounded-2xl border border-white/20 bg-white/95 object-contain p-2" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl">TL</div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9b87b]">Tavolo Menu</p>
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{menu?.nombre || "Menu"}</h1>
                <p className="mt-1 text-sm text-slate-200">Catalogo stampabile con immagini e prezzi</p>
              </div>
            </div>
          </header>

          {loading && <p className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">Caricamento menu...</p>}
          {!loading && error && <p className="rounded-2xl border border-red-300/35 bg-red-400/15 px-4 py-3 text-sm text-red-100">{error}</p>}

          {!loading && !error && printableCategories.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">Non ci sono categorie attive da stampare.</p>
          )}

          {!loading &&
            !error &&
            printableCategories.map((category) => (
              <section key={category.id} className="print-section mb-8">
                <h2 className="mb-3 text-lg font-semibold uppercase tracking-[0.12em] text-[#e6c88f]">{category.nombre}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {category.platos.map((dish) => (
                    <article
                      key={String(dish.id)}
                      className="print-card grid grid-cols-[88px_1fr] gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
                    >
                      {dish.foto_url ? (
                        <img src={dish.foto_url} alt={dish.nombre || "Piatto"} className="h-[88px] w-[88px] rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-xl bg-white/10 text-xl">PI</div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold leading-tight text-white">{dish.nombre || "Piatto"}</h3>
                          <span className="shrink-0 text-sm font-bold text-[#f3d79e]">{formatPrice(dish.precio)}</span>
                        </div>
                        {dish.descripcion ? <p className="mt-1 text-xs text-slate-200/90">{dish.descripcion}</p> : null}
                        {dish.ingredientes ? <p className="mt-1 text-[11px] text-slate-300">{dish.ingredientes}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>
    </>
  )
}



