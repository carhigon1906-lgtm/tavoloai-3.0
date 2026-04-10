// @ts-nocheck
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Edit3, Eye, Layers, Plus, Trash2, QrCode as QrCodeIcon } from "lucide-react"
import QRCode from "react-qr-code"
import { supabase } from "@/lib/supabaseClient"

type Dish = {
  id: number | string
  nombre: string
  ingredientes: string
  precio: number
  foto_url?: string
  activo?: boolean
}

type Category = {
  id: number | string
  nombre: string
  platos: Dish[]
}

type MenuRow = {
  id: number | string
  nombre: string
  slug?: string
  activo?: boolean
  categories?: Category[]
  logo_url?: string
  created_at?: string
}

const container = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
}

const card = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
}

export default function MenusPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<MenuRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menuToDelete, setMenuToDelete] = useState<MenuRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [qrMenu, setQrMenu] = useState<MenuRow | null>(null)
  const qrRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true)
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Devi accedere per vedere i tuoi menu.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("menus")
        .select("id, nombre, slug, activo, categories, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        setError("Non siamo riusciti a caricare i tuoi menu.")
        setLoading(false)
        return
      }

      setMenus(Array.isArray(data) ? data : [])
      setLoading(false)
    }

    loadMenus()
  }, [])

  const totalDishes = useMemo(
    () =>
      menus.reduce((acc, menu) => {
        const categories = Array.isArray(menu.categories) ? menu.categories : []
        return acc + categories.reduce((sum, cat) => sum + (cat.platos?.length ?? 0), 0)
      }, 0),
    [menus],
  )

  const qrMenuUrl = useMemo(() => {
    if (!qrMenu) return ""
    const menuId = encodeURIComponent(String(qrMenu.id))
    if (typeof window === "undefined") return `/menu?menu=${menuId}`
    return `${window.location.origin}/menu?menu=${menuId}`
  }, [qrMenu])

  const downloadQrImage = () => {
    const container = qrRef.current
    if (!container || !qrMenu) return
    const svg = container.querySelector("svg") as SVGSVGElement | null
    if (!svg) return

    const serializer = new XMLSerializer()
    let source = serializer.serializeToString(svg)
    if (!source.match(/^<svg[^>]+xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink=\"http:\/\/www\.w3\.org\/1999\/xlink\"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
    }

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    const size = 512

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        return
      }
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)

      const pngUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = pngUrl
      link.download = `menu-qr-${qrMenu.id}.png`
      link.click()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  const toggleMenuActive = async (menuId: number | string) => {
    const current = menus.find((m) => String(m.id) == String(menuId))
    if (!current) return
    const nextValue = !current.activo

    setMenus((prev) => prev.map((m) => (String(m.id) == String(menuId) ? { ...m, activo: nextValue } : m)))

    const { error } = await supabase.from("menus").update({ activo: nextValue }).eq("id", menuId)
    if (error) {
      setMenus((prev) => prev.map((m) => (String(m.id) == String(menuId) ? { ...m, activo: !nextValue } : m)))
    }
  }

  const deleteMenu = async (menuId: number | string) => {
    setIsDeleting(true)
    setDeleteError("")
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setDeleteError("Devi accedere per eliminare il menu.")
      setIsDeleting(false)
      return
    }

    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("id", menuId)
      .eq("user_id", session.user.id)
      .select("id")

    if (error) {
      setDeleteError(error.message || "Non e stato possibile eliminare il menu. Riprova.")
      setIsDeleting(false)
      return
    }

    const { data: check, error: checkError } = await supabase
      .from("menus")
      .select("id")
      .eq("id", menuId)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (checkError) {
      setDeleteError(checkError.message || "Non e stato possibile verificare l'eliminazione. Riprova.")
      setIsDeleting(false)
      return
    }
    if (check?.id) {
      setDeleteError("Non e stato possibile eliminare il menu. Verifica i permessi.")
      setIsDeleting(false)
      return
    }

    setMenus((prev) => prev.filter((m) => String(m.id) != String(menuId)))
    setMenuToDelete(null)
    setIsDeleting(false)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#050b16] to-[#010204]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.16),transparent_60%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.section
          variants={card}
          className="rounded-3xl border border-white/15 bg-white/5 px-6 py-8 text-left shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">I miei menu</h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Gestisci i tuoi menu, scegli quali mostrare e modificali quando vuoi.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{menus.length} menu</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{totalDishes} piatti</span>
          </div>
        </motion.section>

        <motion.section
          variants={card}
          className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Elenco menu</h2>
              <p className="text-sm text-slate-400">Attiva o disattiva i menu da qui.</p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/menu/new")}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/40 bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-lg transition hover:bg-emerald-400/30"
            >
              <Plus className="h-4 w-4" />
              Aggiungi menu
            </motion.button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span>Nome</span>
              <span className="pr-2">Azione</span>
            </div>

            {loading && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-300">
                Caricamento menu...
              </div>
            )}

            {error && !loading && (
              <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-5 text-center text-sm text-red-200">
                {error}
              </div>
            )}

            {!loading && !error && menus.length == 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-400">
                Non hai ancora creato nessun menu.
              </div>
            )}

            {!loading && !error && menus.length > 0 && (
              <div className="divide-y divide-white/5">
                {menus.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                        <Layers className="h-4 w-4 text-emerald-200" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{m.nombre}</p>
                        <p className="text-xs text-slate-400">{(m.categories ?? []).length} categorie</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!!m.activo}
                        onClick={() => toggleMenuActive(m.id)}
                        className={`relative h-7 w-12 rounded-full border transition-all duration-300 ${
                          m.activo
                            ? "border-emerald-200/50 bg-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
                            : "border-white/20 bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-all duration-300 ${
                            m.activo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        title="Vedi QR"
                        onClick={() => setQrMenu(m)}
                        className="h-9 w-9 rounded-xl border border-indigo-300/30 bg-indigo-400/15 text-indigo-100 transition hover:bg-indigo-400/25"
                      >
                        <QrCodeIcon className="mx-auto h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        title="Anteprima"
                        onClick={() => router.push(`/menu?menu=${encodeURIComponent(String(m.id))}`)}
                        className="h-9 w-9 rounded-xl border border-white/15 bg-white/10 text-slate-200 transition hover:bg-white/20"
                      >
                        <Eye className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Modifica"
                        onClick={() => router.push(`/dashboard/menu/edit?menu=${encodeURIComponent(String(m.id))}`)}
                        className="h-9 w-9 rounded-xl border border-white/15 bg-white/10 text-slate-200 transition hover:bg-white/20"
                      >
                        <Edit3 className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Elimina"
                        onClick={() => {
                          setMenuToDelete(m)
                          setDeleteError("")
                        }}
                        className="h-9 w-9 rounded-xl border border-red-300/30 bg-red-500/15 text-red-200 transition hover:bg-red-500/25"
                      >
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {qrMenu && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1220] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 16, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">QR del menu</h3>
                  <p className="mt-1 text-sm text-slate-300">Scansionalo o condividilo per aprire questo menu.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQrMenu(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                >
                  Chiudi
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
                <div ref={qrRef} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white p-4">
                  <QRCode value={qrMenuUrl || `/menu?menu=${encodeURIComponent(String(qrMenu.id))}`} size={180} />
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200">
                    {qrMenuUrl || `/menu?menu=${encodeURIComponent(String(qrMenu.id))}`}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/menu?menu=${encodeURIComponent(String(qrMenu.id))}`)}
                      className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/70 bg-cyan-400/20 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-400/30"
                    >
                      Apri menu
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!qrMenuUrl) return
                        try {
                          await navigator.clipboard.writeText(qrMenuUrl)
                        } catch {
                          // ignore clipboard errors
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/50 bg-emerald-400/20 px-4 py-2 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-400/30"
                    >
                      Copia link
                    </button>
                    <button
                      type="button"
                      onClick={downloadQrImage}
                      className="inline-flex items-center justify-center rounded-2xl border border-indigo-300/60 bg-indigo-400/20 px-4 py-2 text-xs font-semibold text-indigo-50 transition hover:bg-indigo-400/30"
                    >
                      Scarica QR
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {menuToDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1220] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 16, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Elimina menu</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Stai per eliminare <span className="font-semibold text-white">{menuToDelete.nombre}</span>. Questa azione non puo essere annullata.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMenuToDelete(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Annulla
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => deleteMenu(menuToDelete.id)}
                  disabled={isDeleting}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-red-300/50 bg-gradient-to-r from-red-500/40 via-red-400/20 to-red-500/40 px-4 py-2 text-sm font-semibold text-red-100 shadow-[0_0_22px_rgba(239,68,68,0.55)] transition hover:border-red-300/90 hover:text-white hover:shadow-[0_0_32px_rgba(239,68,68,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-300/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{isDeleting ? "Eliminazione..." : "Elimina"}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
