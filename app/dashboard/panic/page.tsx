// @ts-nocheck
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Utensils } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const card = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
}

export default function PanicPage() {
  const [menus, setMenus] = useState<MenuRow[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState("")
  const [menusLoading, setMenusLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  useEffect(() => {
    const loadMenus = async () => {
      setMenusLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setMenuError("Debes iniciar sesion para ver tus menus.")
        setMenusLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("menus")
        .select("id, nombre")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        setMenuError("No pudimos cargar tus menus.")
        setMenusLoading(false)
        return
      }

      const list = Array.isArray(data) ? data : []
      setMenus(list)
      setMenusLoading(false)
    }

    loadMenus()
  }, [])

  useEffect(() => {
    const loadMenuDetails = async () => {
      if (!selectedMenuId) return
      setMenuLoading(true)
      setMenuError("")
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setMenuError("Debes iniciar sesion para ver tus menus.")
        setMenuLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("menus")
        .select("id, categories")
        .eq("id", selectedMenuId)
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (error) {
        setMenuError("No pudimos cargar tu menu.")
        setMenuLoading(false)
        return
      }

      if (data) {
        const normalized = Array.isArray(data.categories)
          ? data.categories.map((cat) => ({
              ...cat,
              platos: Array.isArray(cat.platos)
                ? cat.platos.map((dish) => ({ ...dish, activo: dish.activo ?? true }))
                : [],
            }))
          : []
        setCategories(normalized)
      } else {
        setCategories([])
      }

      setMenuLoading(false)
    }

    loadMenuDetails()
  }, [selectedMenuId])

  const totalDishes = useMemo(
    () => categories.reduce((acc, category) => acc + (category.platos?.length ?? 0), 0),
    [categories],
  )
  const hiddenDishes = useMemo(
    () =>
      categories.reduce(
        (acc, category) => acc + (category.platos?.filter((dish) => dish.activo === false).length ?? 0),
        0,
      ),
    [categories],
  )

  const persistCategories = async (nextCategories: Category[]) => {
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess("")

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || !selectedMenuId) {
      setSaveError("Debes iniciar sesion para guardar cambios.")
      setIsSaving(false)
      return
    }

    const payload = { categories: nextCategories, updated_at: new Date().toISOString() }
    const { error } = await supabase.from("menus").update(payload).eq("id", selectedMenuId)

    if (error) {
      setSaveError("No se pudo actualizar el menu. Intenta nuevamente.")
    } else {
      setSaveSuccess("Actualizado.")
    }

    setIsSaving(false)
  }

  const toggleDish = async (categoryId: number | string, dishId: number | string) => {
    let nextCategories: Category[] = []
    setCategories((prev) => {
      nextCategories = prev.map((cat) =>
        String(cat.id) === String(categoryId)
          ? {
              ...cat,
              platos: cat.platos.map((dish) =>
                String(dish.id) === String(dishId) ? { ...dish, activo: !(dish.activo ?? true) } : dish,
              ),
            }
          : cat,
      )
      return nextCategories
    })

    await persistCategories(nextCategories)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#0b0f1a] to-[#020208] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(220,38,38,0.18),transparent_55%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12"
      >
        <motion.section variants={card} className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Boton de panico</h1>
              <p className="mt-1 text-sm text-slate-300 sm:text-base">
                Oculta platos agotados del menu QR con un solo toque.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              {totalDishes} platos · {hiddenDishes} ocultos
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={card}
          className="rounded-[32px] border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Selecciona un menu</h2>
              <p className="text-sm text-slate-400">Elige el menu donde quieres ocultar platos.</p>
            </div>
            <span
              className={`rounded-full border border-white/10 px-4 py-2 text-xs font-semibold ${
                isSaving ? "bg-amber-400/20 text-amber-200" : "bg-white/5 text-slate-300"
              }`}
            >
              {isSaving ? "Guardando..." : "Listo para editar"}
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span>Nombre</span>
              <span className="pr-2">Accion</span>
            </div>

            {menusLoading ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-300">
                Cargando menus...
              </div>
            ) : menus.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-300">
                No hay menus creados.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {menus.map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => setSelectedMenuId(String(menu.id))}
                    className={`flex w-full items-center justify-between gap-4 py-4 text-left transition ${
                      selectedMenuId === String(menu.id)
                        ? "text-white"
                        : "text-slate-200 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-2xl border flex items-center justify-center ${
                          selectedMenuId === String(menu.id)
                            ? "border-amber-300/40 bg-amber-400/15"
                            : "border-white/20 bg-white/10"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-200" />
                      </div>
                      <span className="text-sm font-semibold">{menu.nombre}</span>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        selectedMenuId === String(menu.id) ? "text-amber-200" : "text-slate-400"
                      }`}
                    >
                      Seleccionar
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {!!selectedMenuId && (
          <motion.section
            variants={card}
            className="rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Platos del menu</h2>
                <p className="text-sm text-slate-400">
                  Cambia el estado para ocultar o mostrar cada plato en tiempo real.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {menuLoading && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-300">
                  Cargando platos...
                </div>
              )}
              {menuError && (
                <div className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-5 text-center text-sm text-red-200">
                  {menuError}
                </div>
              )}
              {!menuLoading && !menuError && categories.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-300">
                  Aun no hay platos en tu menu.
                </div>
              )}

              {!menuLoading &&
                !menuError &&
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-[24px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{category.nombre}</h3>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {category.platos.length} platos
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {category.platos.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-400">
                          Esta categoria todavia no tiene platos.
                        </div>
                      )}
                      {category.platos.map((dish) => {
                        const isActive = dish.activo !== false
                        return (
                          <div
                            key={dish.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <div className="flex min-w-[220px] items-center gap-3">
                              {dish.foto_url ? (
                                <img
                                  src={dish.foto_url}
                                  alt={dish.nombre ? `Foto de ${dish.nombre}` : "Foto del plato"}
                                  className="h-12 w-12 rounded-xl border border-white/10 object-cover shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                                  <Utensils className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-white">{dish.nombre || "Plato sin nombre"}</p>
                                <p className="text-xs text-slate-400">
                                  {dish.ingredientes || "Ingredientes por definir"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                                  isActive
                                    ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
                                    : "border-slate-300/30 bg-white/5 text-slate-300"
                                }`}
                              >
                                {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                {isActive ? "Visible" : "Oculto"}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isActive}
                                onClick={() => toggleDish(category.id, dish.id)}
                                className={`relative h-9 w-16 rounded-full border transition-all duration-300 ${
                                  isActive
                                    ? "border-emerald-200/40 bg-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
                                    : "border-white/20 bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-all duration-300 ${
                                    isActive ? "translate-x-7" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>

            {saveError && <p className="mt-4 text-sm text-red-200">{saveError}</p>}
            {saveSuccess && <p className="mt-4 text-sm text-emerald-200">{saveSuccess}</p>}
          </motion.section>
        )}
      </motion.div>
    </div>
  )
}
