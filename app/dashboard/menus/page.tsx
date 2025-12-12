// @ts-nocheck
"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Edit3,
  Trash2,
  X,
  ChefHat,
  Coffee,
  Cake,
  Layers,
  Copy,
  Share2,
  Link as LinkIcon,
  Eye,
} from "lucide-react"

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false })

/* =========================
   Tipos
========================= */
type Item = {
  id: number
  nombre: string
  precio: number
  categoria: string
  activo: boolean
}

type Menu = {
  id: number
  nombre: string
  slug: string
  items: number[] // ids de Item
  activo: boolean
  createdAt: number
  portada?: string
  logo?: string
}

/* =========================
   Utils
========================= */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

const tabs = [
  { key: "items", label: "Productos" },
  { key: "menus", label: "Menús" },
] as const

type TabKey = (typeof tabs)[number]["key"]

/* =========================
   Página
========================= */
export default function MenusPage() {
  // ----------------------
  // Estado: ITEMS
  // ----------------------
  const [items, setItems] = useState<Item[]>([
    { id: 1, nombre: "Hamburguesa Clásica", precio: 18.5, categoria: "Comida", activo: true },
    { id: 2, nombre: "Cerveza Artesanal", precio: 7.0, categoria: "Bebidas", activo: true },
    { id: 3, nombre: "Tiramisú Casero", precio: 9.5, categoria: "Postres", activo: false },
    { id: 4, nombre: "Pizza Margherita", precio: 22.0, categoria: "Comida", activo: true },
    { id: 5, nombre: "Mojito", precio: 8.5, categoria: "Bebidas", activo: true },
  ])

  const [form, setForm] = useState<Omit<Item, "id">>({
    nombre: "",
    precio: 0,
    categoria: "Comida",
    activo: true,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")

  const reset = () => {
    setForm({ nombre: "", precio: 0, categoria: "Comida", activo: true })
    setEditingId(null)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return alert("El nombre es obligatorio")
    if (form.precio <= 0) return alert("El precio debe ser mayor a 0")

    if (editingId) {
      setItems(items.map((it) => (it.id === editingId ? { ...it, ...form } : it)))
    } else {
      setItems([...items, { id: Date.now(), ...form }])
    }
    reset()
  }

  const onEdit = (id: number) => {
    const it = items.find((i) => i.id === id)
    if (it) {
      setForm({
        nombre: it.nombre,
        precio: it.precio,
        categoria: it.categoria,
        activo: it.activo,
      })
      setEditingId(it.id)
    }
  }

  const onDelete = (id: number) => {
    if (confirm("¿Eliminar este producto?")) {
      setItems(items.filter((i) => i.id !== id))
      // Limpieza en menús
      setMenus((ms) => ms.map((m) => ({ ...m, items: m.items.filter((iid) => iid !== id) })))
    }
  }

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "Comida":
        return <ChefHat className="w-4 h-4" />
      case "Bebidas":
        return <Coffee className="w-4 h-4" />
      case "Postres":
        return <Cake className="w-4 h-4" />
      default:
        return <ChefHat className="w-4 h-4" />
    }
  }

  const filteredItems =
    selectedCategory === "Todos" ? items : items.filter((item) => item.categoria === selectedCategory)

  const categories = ["Todos", "Comida", "Bebidas", "Postres"]

  // ----------------------
  // Estado: MENÚS
  // ----------------------
  const [menus, setMenus] = useState<Menu[]>([
    {
      id: 100,
      nombre: "Carta Principal",
      slug: "carta-principal",
      items: [1, 2, 4],
      activo: true,
      createdAt: Date.now(),
      portada: "",
      logo: "",
    },
  ])

  const [menuForm, setMenuForm] = useState<Omit<Menu, "id" | "createdAt">>({
    nombre: "",
    slug: "",
    items: [],
    activo: true,
    portada: "",
    logo: "",
  })
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("items")
  const [showPublicModal, setShowPublicModal] = useState<{ open: boolean; menu: Menu | null }>({
    open: false,
    menu: null,
  })

  // Genera slug si el usuario escribe nombre y no definió slug
  useEffect(() => {
    if (!editingMenuId && menuForm.nombre && !menuForm.slug) {
      setMenuForm((f) => ({ ...f, slug: slugify(f.nombre) }))
    }
  }, [menuForm.nombre, menuForm.slug, editingMenuId])

  const resetMenu = () => {
    setMenuForm({ nombre: "", slug: "", items: [], activo: true, portada: "", logo: "" })
    setEditingMenuId(null)
  }

  const onSubmitMenu = (e: React.FormEvent) => {
    e.preventDefault()
    if (!menuForm.nombre.trim()) return alert("El nombre del menú es obligatorio")
    if (!menuForm.slug.trim()) return alert("El slug del menú es obligatorio")

    const slugExists = menus.some((m) => m.slug === menuForm.slug && m.id !== editingMenuId)
    if (slugExists) return alert("Ese slug ya está en uso")

    if (editingMenuId) {
      setMenus((ms) => ms.map((m) => (m.id === editingMenuId ? { ...m, ...menuForm } : m)))
    } else {
      setMenus((ms) => [
        ...ms,
        {
          id: Date.now(),
          createdAt: Date.now(),
          ...menuForm,
        },
      ])
    }
    resetMenu()
  }

  const onEditMenu = (id: number) => {
    const m = menus.find((x) => x.id === id)
    if (!m) return
    setMenuForm({
      nombre: m.nombre,
      slug: m.slug,
      items: m.items,
      activo: m.activo,
      portada: m.portada || "",
      logo: m.logo || "",
    })
    setEditingMenuId(m.id)
    setActiveTab("menus")
  }

  const onDeleteMenu = (id: number) => {
    if (!confirm("¿Eliminar este menú?")) return
    setMenus((ms) => ms.filter((m) => m.id !== id))
    if (editingMenuId === id) resetMenu()
  }

  const onDuplicateMenu = (id: number) => {
    const base = menus.find((m) => m.id === id)
    if (!base) return
    const suffix = new Date().toISOString().slice(11, 19).replace(/:/g, "") // hhmmss
    const copy: Menu = {
      ...base,
      id: Date.now(),
      nombre: `${base.nombre} (Copia)`,
      slug: `${base.slug}-copy-${suffix}`,
      createdAt: Date.now(),
      items: [...base.items],
    }
    setMenus((ms) => [...ms, copy])
  }

  const publicUrlFor = (m: Menu) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://example.com"
    return `${origin}/menu/${m.slug}`
  }

  const selectableItems = useMemo(() => items, [items])

  // ----------------------
  // Animaciones
  // ----------------------
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, x: -100, transition: { duration: 0.2 } },
  }

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#050b16] to-[#010204]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.16),transparent_60%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.section
          variants={cardVariants}
          className="rounded-3xl border border-white/15 bg-white/5 px-6 py-10 text-center shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Gestión de menús</h1>
          <p className="mt-2 text-lg font-medium text-slate-300">
            Administra tus productos, organiza menús y comparte versiones públicas con un par de clics.
          </p>
        </motion.section>

        <motion.section variants={cardVariants} className="flex justify-center">
          <div className="inline-flex rounded-full border border-white/20 bg-white/5 p-2 shadow-lg backdrop-blur-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white shadow-lg border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                } rounded-full`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.section>

        {activeTab === "items" ? (
          <ItemsSection
            {...{
              categories,
              containerVariants,
              cardVariants,
              filteredItems,
              getCategoryIcon,
              onDelete,
              onEdit,
              onSubmit,
              reset,
              form,
              setForm,
              selectedCategory,
              setSelectedCategory,
              editingId,
            }}
          />
        ) : (
          <MenusSection
            {...{
              menus,
              setMenus,
              selectableItems,
              menuForm,
              setMenuForm,
              onSubmitMenu,
              resetMenu,
              editingMenuId,
              setEditingMenuId,
              onDeleteMenu,
              onDuplicateMenu,
              publicUrlFor,
              showPublicModal,
              setShowPublicModal,
              containerVariants,
              cardVariants,
              onEditMenu,
            }}
          />
        )}
      </motion.div>
    </div>
  )
}

/* =========================
   ITEMS
========================= */
function ItemsSection({
  categories,
  containerVariants,
  cardVariants,
  filteredItems,
  getCategoryIcon,
  onDelete,
  onEdit,
  onSubmit,
  reset,
  form,
  setForm,
  selectedCategory,
  setSelectedCategory,
  editingId,
}: any) {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form producto */}
      <motion.div variants={cardVariants} className="lg:col-span-1">
        <form
          onSubmit={onSubmit}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] p-8 space-y-8 will-change-transform text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400/30 to-purple-400/30 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg border border-white/20">
              <Plus className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{editingId ? "Editar Producto" : "Nuevo Producto"}</h2>
              <p className="text-slate-400 font-medium">{editingId ? "Modifica los detalles" : "Añade un nuevo elemento"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Nombre del producto</label>
              <input
                className="w-full bg-white/10 backdrop-blur-sm border border-white/40 rounded-2xl px-5 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-transparent transition-all shadow-sm"
                placeholder="Ej. Hamburguesa Clásica"
                value={form.nombre}
                onChange={(e: any) => setForm((f: any) => ({ ...f, nombre: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Precio</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/40 rounded-2xl pl-10 pr-5 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-transparent transition-all shadow-sm"
                  placeholder="0.00"
                  value={form.precio || ""}
                  onChange={(e: any) => setForm((f: any) => ({ ...f, precio: Number.parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Categoría</label>
              <select
                className="w-full bg-white/10 backdrop-blur-sm border border-white/40 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-transparent transition-all shadow-sm"
                value={form.categoria}
                onChange={(e: any) => setForm((f: any) => ({ ...f, categoria: e.target.value }))}
              >
                <option value="Comida">🍔 Comida</option>
                <option value="Bebidas">☕ Bebidas</option>
                <option value="Postres">🍰 Postres</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm rounded-3xl border border-white/30">
              <div>
                <p className="text-base font-semibold text-white">Producto activo</p>
                <p className="text-sm text-slate-400">Visible para los clientes</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f: any) => ({ ...f, activo: !f.activo }))}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${
                  form.activo ? "bg-green-300/60" : "bg-slate-200/60"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white/10 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 ${
                    form.activo ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-blue-400/70 to-purple-400/70 backdrop-blur-sm text-white text-lg font-semibold py-4 rounded-2xl shadow-lg border border-white/20 transition-all hover:from-blue-500/80 hover:to-purple-500/80"
            >
              {editingId ? "Guardar Cambios" : "Crear Producto"}
            </motion.button>
            {editingId && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="px-6 py-4 bg-white/10 backdrop-blur-sm text-slate-300 rounded-2xl font-semibold transition-all shadow-md border border-white/30 hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Lista productos */}
      <motion.div variants={cardVariants} className="lg:col-span-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Productos ({filteredItems.length})</h3>
          </div>

          <motion.div className="grid gap-5" variants={containerVariants} initial="hidden" animate="visible">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item: Item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] p-6 will-change-transform text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-300/20 to-purple-300/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-md border border-white/20">
                        <span className="text-slate-400">{getCategoryIcon(item.categoria)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-white text-xl">{item.nombre}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                              item.activo
                                ? "bg-green-200/40 text-green-600 border-green-300/40"
                                : "bg-slate-200/20 text-slate-400 border-slate-300/40"
                            }`}
                          >
                            {item.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            ${item.precio.toFixed(2)}
                          </p>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-slate-300 border border-white/30 backdrop-blur-sm">
                            {item.categoria}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(item.id)}
                        className="w-12 h-12 bg-blue-200/30 hover:bg-blue-300/40 text-blue-500 rounded-2xl flex items-center justify-center transition-all shadow-md backdrop-blur-sm border border-white/20"
                      >
                        <Edit3 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(item.id)}
                        className="w-12 h-12 bg-red-200/30 hover:bg-red-300/40 text-red-500 rounded-2xl flex items-center justify-center transition-all shadow-md backdrop-blur-sm border border-white/20"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredItems.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200/40 to-slate-300/40 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/20">
                <ChefHat className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-300 mb-3">No hay productos</h3>
              <p className="text-slate-400 text-lg">
                {selectedCategory === "Todos"
                  ? "Añade tu primer producto para comenzar"
                  : `No hay productos en la categoría "${selectedCategory}"`}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Filtro por categoría (arriba) */}
      <motion.div variants={cardVariants} className="lg:col-span-3 flex justify-center order-first lg:order-none">
        <div className="bg-white/5 backdrop-blur-xl rounded-full p-2 inline-flex shadow-lg border border-white/20">
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-white/10 text-white shadow-md transform scale-105 backdrop-blur-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* =========================
   MENÚS
========================= */
function MenusSection({
  menus,
  setMenus,
  selectableItems,
  menuForm,
  setMenuForm,
  onSubmitMenu,
  resetMenu,
  editingMenuId,
  setEditingMenuId,
  onDeleteMenu,
  onDuplicateMenu,
  publicUrlFor,
  showPublicModal,
  setShowPublicModal,
  containerVariants,
  cardVariants,
  onEditMenu,
}: any) {
  const toggleMenuItem = (id: number) => {
    setMenuForm((f: any) => ({
      ...f,
      items: f.items.includes(id) ? f.items.filter((x: number) => x !== id) : [...f.items, id],
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  // ---- Uploads: Portada y Logo ----
  const portadaInput = useRef<HTMLInputElement | null>(null)
  const logoInput = useRef<HTMLInputElement | null>(null)

  const onImgSelected = (target: "portada" | "logo") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setMenuForm((prev: any) => ({ ...prev, [target]: String(reader.result || "") }))
    reader.readAsDataURL(f)
  }

  const UploadTile = ({
    label,
    value,
    onPick,
    hint,
    square = true,
  }: {
    label: string
    value?: string
    onPick: () => void
    hint?: string
    square?: boolean
  }) => (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">{label}</div>
      <button
        type="button"
        onClick={onPick}
        className={`w-full ${square ? "aspect-square" : "h-28"} rounded-2xl border border-white/40 bg-white/10 hover:bg-white/10 transition flex items-center justify-center text-white`}
      >
        {value ? "Cambiar imagen" : "Subir imagen"}
      </button>
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
      {value && (
        <img
          src={value}
          alt={label}
          className={`w-full ${square ? "h-28" : "h-24"} object-cover rounded-2xl border border-white/40 bg-white`}
        />
      )}
    </div>
  )

  return (
    // Layout amplio y limpio: form 7/12–8/12, lista 5/12–4/12
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Formulario de menú (más grande, con uploads) */}
      <motion.div variants={cardVariants} className="lg:col-span-7 xl:col-span-8">
        <form
          onSubmit={onSubmitMenu}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.55)] p-8 md:p-10 space-y-8 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-400/25 to-cyan-400/25 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{editingMenuId ? "Editar Menú" : "Crear Menú"}</h2>
              <p className="text-slate-400 font-medium">Agrupa productos y genera una vista pública</p>
            </div>
          </div>

          {/* Uploads: Portada y Logo */}
          <div className="grid sm:grid-cols-2 gap-6">
            <UploadTile
              label="Portada"
              value={menuForm.portada}
              onPick={() => portadaInput.current?.click()}
              hint="Recomendado 1200×600px"
              square={false}
            />
            <UploadTile
              label="Logo"
              value={menuForm.logo}
              onPick={() => logoInput.current?.click()}
              hint="Recomendado 512×512px"
              square={true}
            />
          </div>
          <input ref={portadaInput} type="file" accept="image/*" className="hidden" onChange={onImgSelected("portada")} />
          <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={onImgSelected("logo")} />

          {/* Campos en dos columnas */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Nombre del menú</label>
              <input
                className="w-full bg-white/5 backdrop-blur-sm border border-white/50 rounded-2xl px-5 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all shadow-sm"
                placeholder="Ej. Carta Vegana"
                value={menuForm.nombre}
                onChange={(e: any) => setMenuForm((f: any) => ({ ...f, nombre: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Slug público</label>
              <input
                className="w-full bg-white/5 backdrop-blur-sm border border-white/50 rounded-2xl px-5 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all shadow-sm"
                placeholder="carta-vegana"
                value={menuForm.slug}
                onChange={(e: any) => setMenuForm((f: any) => ({ ...f, slug: slugify(e.target.value) }))}
              />
            </div>

            {/* Selector de productos ocupa ancho completo debajo */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Productos</label>
              <div className="max-h-80 overflow-auto pr-2 grid sm:grid-cols-2 gap-3">
                {selectableItems.map((it: Item) => (
                  <label
                    key={it.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/40 bg-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={menuForm.items.includes(it.id)}
                        onChange={() => toggleMenuItem(it.id)}
                      />
                      <span className="text-white font-medium">{it.nombre}</span>
                    </div>
                    <span className="text-slate-400 text-sm">${it.precio.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-3xl border border-white/40">
            <div>
              <p className="text-base font-semibold text-white">Menú activo</p>
              <p className="text-sm text-slate-400">Visible en la vista pública</p>
            </div>
            <button
              type="button"
              onClick={() => setMenuForm((f: any) => ({ ...f, activo: !f.activo }))}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${
                menuForm.activo ? "bg-green-300/60" : "bg-slate-200/60"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white/10 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 ${
                  menuForm.activo ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 md:flex-none md:min-w-[220px] bg-gradient-to-r from-emerald-400/80 to-cyan-400/80 backdrop-blur-sm text-white text-lg font-semibold py-4 rounded-2xl shadow-lg border border-white/30 transition-all hover:from-emerald-500/90 hover:to-cyan-500/90"
            >
              {editingMenuId ? "Guardar Menú" : "Crear Menú"}
            </motion.button>
            {editingMenuId && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetMenu}
                className="px-6 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold transition-all shadow-md border border-white/40 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Lista de menús (columna derecha) */}
      <motion.div variants={cardVariants} className="lg:col-span-5 xl:col-span-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Menús ({menus.length})</h3>
          </div>

          <motion.div className="grid gap-5" variants={containerVariants} initial="hidden" animate="visible">
            <AnimatePresence mode="popLayout">
              {menus.map((m: Menu) => (
                <motion.div
                  key={m.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.55)] p-6 text-white"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-300/25 to-cyan-300/25 border border-white/40 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-white text-xl">{m.nombre}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                              m.activo
                                ? "bg-green-200/40 text-green-600 border-green-300/40"
                                : "bg-slate-200/20 text-slate-400 border-slate-300/40"
                            }`}
                          >
                            {m.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-slate-400 text-sm">
                          <span className="inline-flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />/{m.slug}
                          </span>
                          <span>• {m.items.length} productos</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:gap-3">
                      <IconButton title="Editar" onClick={() => onEditMenu(m.id)}>
                        <Edit3 className="w-5 h-5" />
                      </IconButton>
                      <IconButton title="Duplicar" onClick={() => onDuplicateMenu(m.id)}>
                        <Copy className="w-5 h-5" />
                      </IconButton>
                      <IconButton title="Ver público" onClick={() => setShowPublicModal({ open: true, menu: m })}>
                        <Eye className="w-5 h-5" />
                      </IconButton>
                      <IconButton title="Eliminar" onClick={() => onDeleteMenu(m.id)} danger>
                        <Trash2 className="w-5 h-5" />
                      </IconButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de vista pública + QR */}
      <AnimatePresence>
        {showPublicModal.open && showPublicModal.menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#050910] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-white/10 p-6 md:p-8 text-white"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Vista pública: {showPublicModal.menu.nombre}</h3>
                  <p className="text-slate-400">Comparte este menú con tus clientes</p>
                </div>
                <button
                  className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                  onClick={() => setShowPublicModal({ open: false, menu: null })}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* QR y enlace */}
                <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <QRCode value={publicUrlFor(showPublicModal.menu)} size={160} />
                  <div className="w-full">
                    <div className="text-xs text-slate-400 mb-1">URL pública</div>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={publicUrlFor(showPublicModal.menu)}
                        className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white"
                      />
                      <button
                        onClick={() => copyToClipboard(publicUrlFor(showPublicModal.menu!))}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-white text-sm hover:opacity-90"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview simple del menú público */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/20 max-h-96 overflow-auto text-white">
                  <h4 className="font-bold text-white mb-3">{showPublicModal.menu.nombre}</h4>
                  <ul className="space-y-2">
                    {selectableItems
                      .filter((it: Item) => showPublicModal.menu!.items.includes(it.id))
                      .map((it: Item) => (
                        <li key={it.id} className="flex items-center justify-between text-white">
                          <span>{it.nombre}</span>
                          <span className="font-semibold">${it.precio.toFixed(2)}</span>
                        </li>
                      ))}
                    {showPublicModal.menu.items.length === 0 && (
                      <li className="text-slate-400">Este menú aún no tiene productos.</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =========================
   Botón reutilizable
========================= */
function IconButton({ children, onClick, title, danger = false }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={title}
      onClick={onClick}
      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg backdrop-blur-sm border ${
        danger
          ? "bg-red-400/20 hover:bg-red-500/30 text-red-200 border-white/20"
          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
      }`}
    >
      {children}
    </motion.button>
  )
}
