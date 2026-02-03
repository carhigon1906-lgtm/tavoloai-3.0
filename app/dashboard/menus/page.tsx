// @ts-nocheck
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Edit3, Eye, Layers, Plus, Trash2 } from "lucide-react"
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

  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true)
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Debes iniciar sesion para ver tus menus.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("menus")
        .select("id, nombre, slug, activo, categories, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        setError("No pudimos cargar tus menus.")
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
    if (!confirm("Eliminar este menu?")) return
    const { error } = await supabase.from("menus").delete().eq("id", menuId)
    if (error) return
    setMenus((prev) => prev.filter((m) => String(m.id) != String(menuId)))
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
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Mis menus</h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Administra tus menus, decide cuales mostrar y edita cuando lo necesites.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{menus.length} menus</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{totalDishes} platos</span>
          </div>
        </motion.section>

        <motion.section
          variants={card}
          className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Lista de menus</h2>
              <p className="text-sm text-slate-400">Activa o desactiva menus desde aqui.</p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/menu/new")}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/40 bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-lg transition hover:bg-emerald-400/30"
            >
              <Plus className="h-4 w-4" />
              Añadir menú
            </motion.button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span>Nombre</span>
              <span className="pr-2">Accion</span>
            </div>

            {loading && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-300">
                Cargando menus...
              </div>
            )}

            {error && !loading && (
              <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-5 text-center text-sm text-red-200">
                {error}
              </div>
            )}

            {!loading && !error && menus.length == 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-400">
                No hay menus creados todavia.
              </div>
            )}

            {!loading && !error && menus.length > 0 && (
              <div className="divide-y divide-white/5">
                {menus.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-emerald-200" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{m.nombre}</p>
                        <p className="text-xs text-slate-400">{(m.categories ?? []).length} categorias</p>
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
                          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-all duration-300 ${
                            m.activo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        title="Vista previa"
                        onClick={() => router.push(`/menu?menu=${encodeURIComponent(String(m.id))}`)}
                        className="h-9 w-9 rounded-xl border border-white/15 bg-white/10 text-slate-200 hover:bg-white/20 transition"
                      >
                        <Eye className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => router.push(`/dashboard/menu/edit?menu=${encodeURIComponent(String(m.id))}`)}
                        className="h-9 w-9 rounded-xl border border-white/15 bg-white/10 text-slate-200 hover:bg-white/20 transition"
                      >
                        <Edit3 className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => deleteMenu(m.id)}
                        className="h-9 w-9 rounded-xl border border-red-300/30 bg-red-500/15 text-red-200 hover:bg-red-500/25 transition"
                      >
                        <Trash2 className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
