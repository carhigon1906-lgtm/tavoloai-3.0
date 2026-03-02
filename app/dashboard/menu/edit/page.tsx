// @ts-nocheck
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon, UtensilsCrossed } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useSearchParams } from "next/navigation"

type Dish = {
  id: number
  nombre: string
  descripcion?: string
  ingredientes: string
  precio: number
  foto_url?: string
  activo?: boolean
}

type Category = {
  id: number
  nombre: string
  icono?: string
  platos: Dish[]
}

const container = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
}

const card = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
}

const CATEGORY_ICON_OPTIONS = ["🍔", "\u{1F355}", "\u{1F32E}", "\u{1F957}", "\u{1F363}", "\u{1F964}", "\u{2615}", "\u{1F370}", "🍽️", "\u{2B50}"]

export default function EditMenuPage() {
  const searchParams = useSearchParams()
  const menuIdParam = searchParams.get("menu") ?? ""
  const [menuId, setMenuId] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [logoName, setLogoName] = useState<string>("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string>("")
  const [saveError, setSaveError] = useState<string>("")
  const [saveSuccess, setSaveSuccess] = useState<string>("")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [hasExistingMenu, setHasExistingMenu] = useState(false)
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState("")
  const [menuName, setMenuName] = useState<string>("")
  const [menuSlug, setMenuSlug] = useState<string>("")
  const [uploadingDish, setUploadingDish] = useState<Record<number, boolean>>({})
  const [removingBackground, setRemovingBackground] = useState<Record<number, boolean>>({})
  const [processingPreview, setProcessingPreview] = useState<string>("")
  const [processedPreview, setProcessedPreview] = useState<string>("")
  const [showProcessedPreview, setShowProcessedPreview] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingDishId, setProcessingDishId] = useState<number | null>(null)
  const [processingCategoryId, setProcessingCategoryId] = useState<number | null>(null)
  const [processingPreviousUrl, setProcessingPreviousUrl] = useState<string>("")
  const [backgroundRemovedFile, setBackgroundRemovedFile] = useState<File | null>(null)
  const [enhancingWithAi, setEnhancingWithAi] = useState(false)
  const [aiEnhanced, setAiEnhanced] = useState(false)
  
  const [processingError, setProcessingError] = useState<string>("")
  const [pendingDishUploads, setPendingDishUploads] = useState<
    Record<number, { file: File; previousUrl: string }>
  >({})
  const [confirmDishDelete, setConfirmDishDelete] = useState<{
    categoryId: number
    dishId: number
    dishName: string
  } | null>(null)
  const [confirmCategoryDelete, setConfirmCategoryDelete] = useState<{
    categoryId: number
    categoryName: string
  } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState<string>("")
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>("🍽️")
  const [ingredientDrafts, setIngredientDrafts] = useState<Record<number, string>>({})
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const rembgSessionRef = useRef<Promise<unknown> | null>(null)
  

  useEffect(() => {
    if (!processedPreview) {
      setShowProcessedPreview(false)
      return
    }
    setShowProcessedPreview(false)
    const raf = requestAnimationFrame(() => setShowProcessedPreview(true))
    return () => cancelAnimationFrame(raf)
  }, [processedPreview])

  useEffect(() => {
    if (!processedPreview) return
    // Keep modal open so timings can be read/copied
  }, [processedPreview])

  useEffect(() => {
    const loadMenu = async () => {
      setMenuLoading(true)
      setMenuError("")

      if (!menuIdParam) {
        setMenuError("Selecciona un menú desde Mis menús.")
        setMenuLoading(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setMenuError("Debes iniciar sesion para editar.")
        setMenuLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("menus")
        .select("id, logo_url, categories, nombre, slug")
        .eq("id", menuIdParam)
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (error) {
        setMenuError("No pudimos cargar tu menú.")
        setMenuLoading(false)
        return
      }
      if (data) {
        setMenuId(String(data.id))
        setHasExistingMenu(true)
        if (data.nombre) setMenuName(String(data.nombre))
        if (data.slug) setMenuSlug(String(data.slug))
        if (data.logo_url) {
          setLogoUrl(String(data.logo_url))
          setLogoPreview(String(data.logo_url))
        }
        if (Array.isArray(data.categories)) {
          const normalized = data.categories.map((cat) => ({
            ...cat,
            icono: typeof cat.icono === "string" ? cat.icono : "🍽️",
            platos: Array.isArray(cat.platos)
              ? cat.platos.map((dish) => {
                  const { tagline, ...rest } = dish
                  return {
                    ...rest,
                    activo: dish.activo ?? true,
                    descripcion: dish.descripcion ?? tagline ?? "",
                  }
                })
              : [],
          }))
          setCategories(normalized)
        }
      } else {
        setMenuError("No encontramos este menú.")
      }

      setMenuLoading(false)
    }

    loadMenu()
  }, [menuIdParam])

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

  useEffect(() => {
    setMenuSlug(slugify(menuName))
  }, [menuName])

  const parseIngredients = (value: string) =>
    value
      .split(/[,\n;]+/)
      .map((item) => item.trim())
      .filter(Boolean)

  const formatIngredients = (items: string[]) => items.join(", ")

  const addIngredients = (categoryId: number, dishId: number, current: string[], raw: string) => {
    const incoming = parseIngredients(raw)
    if (incoming.length === 0) return
    const seen = new Set(current.map((item) => item.toLowerCase()))
    const next = [...current]
    for (const item of incoming) {
      const key = item.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        next.push(item)
      }
    }
    updateDish(categoryId, dishId, "ingredientes", formatIngredients(next))
    setIngredientDrafts((prev) => ({ ...prev, [dishId]: "" }))
  }

  const removeIngredient = (categoryId: number, dishId: number, current: string[], index: number) => {
    const next = current.filter((_, idx) => idx !== index)
    updateDish(categoryId, dishId, "ingredientes", formatIngredients(next))
  }

  const totalDishes = useMemo(
    () => categories.reduce((acc, category) => acc + category.platos.length, 0),
    [categories],
  )

  const onLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "image/png") {
      setLogoPreview("")
      setLogoUrl("")
      setLogoName("")
      setLogoFile(null)
      setLogoError("El logo debe ser un archivo PNG.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(String(reader.result || ""))
      setLogoName(file.name)
      setLogoFile(file)
      setLogoError("")
    }
    reader.readAsDataURL(file)
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return alert("Ingresa un nombre de categoría.")
    setCategories((prev) => [
      ...prev,
      { id: Date.now(), nombre: newCategoryName.trim(), icono: newCategoryIcon.trim() || "🍽️", platos: [] },
    ])
    setNewCategoryName("")
    setNewCategoryIcon("🍽️")
  }

  const requestRemoveCategory = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId)
    setConfirmCategoryDelete({
      categoryId,
      categoryName: category?.nombre?.trim() || "esta categoría",
    })
  }

  const confirmRemoveCategory = () => {
    if (!confirmCategoryDelete) return
    removeCategory(confirmCategoryDelete.categoryId)
    setConfirmCategoryDelete(null)
  }

  const addDish = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              platos: [
                { id: Date.now(), nombre: "", descripcion: "", ingredientes: "", precio: 0, foto_url: "", activo: true },
                ...cat.platos,
              ],
            }
          : cat,
      ),
    )
  }
  const removeDish = (categoryId: number, dishId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, platos: cat.platos.filter((p) => p.id !== dishId) } : cat,
      ),
    )
  }

  const requestRemoveDish = (categoryId: number, dishId: number) => {
    const category = categories.find((cat) => cat.id === categoryId)
    const dish = category?.platos.find((p) => p.id === dishId)
    setConfirmDishDelete({
      categoryId,
      dishId,
      dishName: dish?.nombre?.trim() || "este plato",
    })
  }

  const confirmRemoveDish = () => {
    if (!confirmDishDelete) return
    removeDish(confirmDishDelete.categoryId, confirmDishDelete.dishId)
    setConfirmDishDelete(null)
  }

  const updateCategoryName = (id: number, value: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, nombre: value } : cat)))
  }

  const updateCategoryIcon = (id: number, value: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, icono: value } : cat)))
  }

  const updateDish = (categoryId: number, dishId: number, field: keyof Dish, value: string | number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              platos: cat.platos.map((dish) => (dish.id === dishId ? { ...dish, [field]: value } : dish)),
            }
          : cat,
      ),
    )
  }

  const downscaleImage = async (file: File, maxSize = 768) => {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((result) => resolve(result), "image/jpeg", 0.85))
    if (!blob) return file
    return new File([blob], file.name, { type: "image/jpeg" })
  }

  const animateProgressTo = (target: number, durationMs: number) =>
    new Promise<void>((resolve) => {
      const startTime = performance.now()
      let startValue = 0
      setProcessingProgress((prev) => {
        startValue = prev
        return prev
      })
      const tick = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(1, elapsed / durationMs)
        const ease = t * t * (3 - 2 * t)
        const value = Math.round(startValue + (target - startValue) * ease)
        setProcessingProgress(value)
        if (t < 1) {
          requestAnimationFrame(tick)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(tick)
    })

  const getRemovalMaxSize = () => 640

  const getRembgSession = async () => {
    if (!rembgSessionRef.current) {
      const ort = await import("onnxruntime-web")
      ort.env.wasm.wasmPaths = "/onnxruntime/"
      ort.env.wasm.simd = true
      ort.env.wasm.numThreads = 1
      ort.env.wasm.proxy = false
      ort.env.wasm.useThreads = false
      ort.env.wasm.useJsep = false

      const { newSession, rembgConfig } = await import("@bunnio/rembg-web")
      rembgConfig.setBaseUrl("/models")
      rembgSessionRef.current = newSession("u2netp")
    }
    return rembgSessionRef.current
  }

  const removeDishPhotoBackground = async (file: File) => {
    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const maxSize = getRemovalMaxSize()
    const scaledFile = await downscaleImage(file, maxSize)

    const { remove } = await import("@bunnio/rembg-web")
    const session = await getRembgSession()
    const result = await remove(scaledFile, { session })
    return new File([result], `${baseName}.png`, { type: "image/png" })
  }

  const enhanceDishPhotoWithClaid = async (file: File) => {
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
      const details = [
        status ? `status ${status}` : "",
        requestId ? `request ${requestId}` : "",
      ]
        .filter(Boolean)
        .join(" · ")
      throw new Error(details ? `${message} (${details})` : message)
    }

    const payload = await response.json()
    const tmpUrl = payload?.tmpUrl
    if (!tmpUrl || typeof tmpUrl !== "string") {
      throw new Error("Respuesta inválida del servicio de mejora.")
    }

    const enhancedResponse = await fetch(tmpUrl)
    if (!enhancedResponse.ok) {
      throw new Error("No se pudo descargar la imagen mejorada.")
    }
    const blob = await enhancedResponse.blob()
    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const fileName = `${baseName}-ai.png`
    return { file: new File([blob], fileName, { type: blob.type || "image/png" }), previewUrl: tmpUrl }
  }

  const handleEnhanceWithAi = async () => {
    if (!backgroundRemovedFile || processingDishId == null || processingCategoryId == null) return
    setEnhancingWithAi(true)
    setProcessingError("")
    setProcessingProgress(0)
    try {
      const progressPromise = animateProgressTo(92, 3200)
      const enhanced = await enhanceDishPhotoWithClaid(backgroundRemovedFile)
      await progressPromise
      setProcessingProgress(100)
      setProcessedPreview(enhanced.previewUrl)
      setAiEnhanced(true)
      updateDish(processingCategoryId, processingDishId, "foto_url", enhanced.previewUrl)
      setPendingDishUploads((prev) => ({
        ...prev,
        [processingDishId]: {
          file: enhanced.file,
          previousUrl: processingPreviousUrl,
        },
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo mejorar la imagen."
      setProcessingError(message)
    } finally {
      setEnhancingWithAi(false)
    }
  }

  const onDishPhotoSelected = (categoryId: number, dishId: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previousPhotoUrl =
      categories.find((cat) => cat.id === categoryId)?.platos.find((dish) => dish.id === dishId)?.foto_url ?? ""

    const allowedTypes: Record<string, boolean> = {
      "image/png": true,
      "image/jpeg": true,
      "image/webp": true,
    }
    if (!allowedTypes[file.type]) {
      setSaveError("La foto del plato debe ser PNG, JPG o WEBP.")
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setSaveError("Debes iniciar sesión para subir imágenes.")
      return
    }

    setUploadingDish((prev) => ({ ...prev, [dishId]: true }))
    setRemovingBackground((prev) => ({ ...prev, [dishId]: true }))
    setSaveError("")
    setProcessingDishId(dishId)
    setProcessingCategoryId(categoryId)
    setProcessingPreviousUrl(previousPhotoUrl)
    setBackgroundRemovedFile(null)
    setEnhancingWithAi(false)
    setAiEnhanced(false)

    const previewUrl = URL.createObjectURL(file)
    setProcessingPreview(previewUrl)
    setProcessedPreview("")
    setProcessingProgress(0)
    setProcessingError("")

    let progressTimer: number | null = null
    const progressStart = performance.now()
    const durationMs = 4000
    const tickProgress = () => {
      const elapsed = performance.now() - progressStart
      const t = Math.min(1, elapsed / durationMs)
      const ease = 0.5 - Math.cos(Math.PI * t) / 2
      const nextValue = Math.round(100 * ease)
      setProcessingProgress((prev) => (nextValue > prev ? nextValue : prev))
      if (t < 1) {
        progressTimer = requestAnimationFrame(tickProgress)
      }
    }
    progressTimer = requestAnimationFrame(tickProgress)

    let processedFile: File
    let processedPreviewUrl = ""
    try {
      // allow UI to paint before heavy processing
      await new Promise((resolve) => setTimeout(resolve, 50))
      const backgroundRemoved = await removeDishPhotoBackground(file)
      processedFile = backgroundRemoved
      const previewReader = new FileReader()
      processedPreviewUrl = await new Promise<string>((resolve) => {
        previewReader.onload = () => resolve(String(previewReader.result || ""))
        previewReader.readAsDataURL(backgroundRemoved)
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo procesar la imagen."
      setSaveError(message)
      setProcessingError(message)
      setUploadingDish((prev) => ({ ...prev, [dishId]: false }))
      URL.revokeObjectURL(previewUrl)
      setProcessingPreview("")
      setProcessedPreview("")
      if (progressTimer) cancelAnimationFrame(progressTimer)
      setProcessingProgress(0)
      return
    }
    // keep simulated 4s progress independent of processing completion
    URL.revokeObjectURL(previewUrl)
    setProcessingPreview("")

    updateDish(categoryId, dishId, "foto_url", processedPreviewUrl)
    setProcessedPreview(processedPreviewUrl)
    setBackgroundRemovedFile(processedFile)

    setPendingDishUploads((prev) => ({ ...prev, [dishId]: { file: processedFile, previousUrl: previousPhotoUrl } }))
    setUploadingDish((prev) => ({ ...prev, [dishId]: false }))
  }

  const saveMenu = async () => {
    if (!hasExistingMenu) {
      setSaveError("No hay menú para editar.")
      return
    }
    if (menuLoading) {
      setSaveError("Espera a que el menú termine de cargar antes de guardar.")
      return
    }
    if (menuError) {
      setSaveError("No se puede guardar mientras hay un error cargando el menú.")
      return
    }
    if (!menuName.trim()) {
      setSaveError("El nombre del menú es obligatorio.")
      return
    }
    setSaveError("")
    setSaveSuccess("")
    setIsSaving(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setSaveError("Debes iniciar sesión para guardar.")
        return
      }

      let finalLogoUrl = logoUrl
      if (logoFile) {
        const filePath = `${session.user.id}/logo-${Date.now()}.png`
        const formData = new FormData()
        formData.append("file", logoFile)
        formData.append("path", filePath)
        formData.append("bucket", "menu-assets")

        const response = await fetch("/api/menu/upload-logo", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          setSaveError("No se pudo subir el logo. Revisa el bucket en Supabase.")
          return
        }

        const result = await response.json()
        if (!result?.publicUrl) {
          setSaveError("No se pudo obtener la URL del logo.")
          return
        }

        finalLogoUrl = result.publicUrl
        setLogoUrl(finalLogoUrl)
        setLogoPreview(finalLogoUrl)
        setLogoFile(null)
      }

      let updatedCategories = categories
      const pendingEntries = Object.entries(pendingDishUploads)
      for (const [dishIdText, entry] of pendingEntries) {
        const dishId = Number(dishIdText)
        const filePath = `${session.user.id}/dish-${dishId}-${Date.now()}.png`
        const formData = new FormData()
        formData.append("file", entry.file)
        formData.append("path", filePath)
        formData.append("bucket", "menu-assets")

        const response = await fetch("/api/menu/upload-dish-photo", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          setSaveError("No se pudo subir una foto del plato. Revisa el bucket en Supabase.")
          return
        }

        const result = await response.json()
        if (!result?.publicUrl) {
          setSaveError("No se pudo obtener la URL de una foto del plato.")
          return
        }

        updatedCategories = updatedCategories.map((cat) => ({
          ...cat,
          platos: cat.platos.map((dish) => (dish.id === dishId ? { ...dish, foto_url: result.publicUrl } : dish)),
        }))

        if (entry.previousUrl && entry.previousUrl !== result.publicUrl) {
          const url = new URL(entry.previousUrl)
          const marker = "/storage/v1/object/public/"
          const idx = url.pathname.indexOf(marker)
          if (idx !== -1) {
            const remainder = url.pathname.slice(idx + marker.length)
            const [bucket, ...pathParts] = remainder.split("/")
            const path = pathParts.join("/")
            if (bucket && path) {
              await fetch("/api/menu/delete-logo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bucket, path }),
              })
            }
          }
        }
      }

      const payload = {
        user_id: session.user.id,
        nombre: menuName.trim() || "Menú sin nombre",
        slug: slugify(menuName),
        logo_url: finalLogoUrl,
        categories: updatedCategories,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("menus").update(payload).eq("id", menuIdParam).select("id").single()

      if (error) {
        setSaveError("No se pudo guardar el menú. Intenta nuevamente.")
        return
      }

      setMenuId(String(data.id))
      if (pendingEntries.length) {
        setCategories(updatedCategories)
        setPendingDishUploads({})
      }
      setSaveSuccess("Menú guardado correctamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const editLocked = !hasExistingMenu && !menuLoading

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04060f] via-[#081326] to-[#05070c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(56,189,248,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_18%,rgba(34,197,94,0.12),transparent_60%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8"
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
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Edición de menú</h1>
              <p className="mt-1 text-sm text-slate-300 sm:text-base">
                Edita categorías, platos y precios del menú activo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={menuId ? `/menu?menu=${encodeURIComponent(menuId)}` : "/menu"}
              className={`relative inline-flex items-center gap-2 rounded-2xl border border-cyan-300/80 bg-gradient-to-r from-cyan-400/65 via-teal-300/45 to-cyan-400/65 px-5 py-3 text-sm font-semibold text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.55)] transition hover:shadow-[0_0_42px_rgba(34,211,238,0.8)] ${menuId ? "" : "pointer-events-none opacity-50"}`}
              aria-disabled={!menuId}
            >
              <span className="absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.6),transparent_60%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.5),transparent_60%)]" />
              Ver mi menú
            </Link>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <UtensilsCrossed className="h-4 w-4 text-emerald-300" />
              {categories.length} categorías - {totalDishes} platos
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={card}
          className="rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Datos del menú</h2>
              <p className="text-sm text-slate-400">Actualiza el nombre cuando sea necesario.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <input
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                disabled={editLocked}
                placeholder="Ej. Carta principal"
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </motion.section>

        {menuLoading && (
          <motion.section
            variants={card}
            className="rounded-[26px] border border-white/10 bg-white/5 p-6 text-slate-300"
          >
            Cargando menú...
          </motion.section>
        )}

        {menuError && !menuLoading && (
          <motion.section
            variants={card}
            className="rounded-[26px] border border-amber-300/30 bg-amber-400/10 p-6 text-amber-100 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
          >
            <h3 className="text-lg font-semibold text-white">No hay menú para editar</h3>
            <p className="mt-1 text-sm text-amber-100/80">{menuError}</p>
            <Link
              href="/dashboard/menu/new"
              className="mt-4 inline-flex items-center rounded-2xl border border-amber-200/40 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
            >
              Crear menú ahora
            </Link>
          </motion.section>
        )}

        <div className={`grid items-stretch gap-8 ${editLocked ? "pointer-events-none opacity-60" : ""}`}>
          <motion.section
            variants={card}
            className="flex h-full min-h-[300px] flex-col rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <h2 className="text-xl font-semibold text-white">Agregar categoría</h2>
            <p className="mt-1 text-sm text-slate-400">Ej. Entradas, Platos fuertes, Bebidas, Postres.</p>

            <div className="mt-5 flex flex-col gap-3">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
              />
              <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                <select
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                >
                  {CATEGORY_ICON_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} Icono
                    </option>
                  ))}
                </select>
                <input
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  placeholder="Emoji personalizado (ej: 🍔)"
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                />
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addCategory}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-400/20 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400/30"
              >
                <Plus className="h-4 w-4" />
                Añadir categoría
              </motion.button>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p className="rounded-2xl border border-white/10 bg-[#0d1424] px-4 py-3">
                Recuerda: cada categoría puede tener varios platos con ingredientes y precios.
              </p>
            </div>
          </motion.section>
        </div>

        <div className={editLocked ? "pointer-events-none opacity-60" : ""}>
        <motion.section variants={card} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Categorías y platos</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300">
              Completa cada plato antes de publicar
            </span>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={card}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 10 }}
                  className="rounded-[26px] border border-white/10 bg-[#0b1426] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-1 min-w-[220px] items-center gap-3">
                      <input
                        value={category.icono ?? ""}
                        onChange={(e) => updateCategoryIcon(category.id, e.target.value)}
                        placeholder="🍽️"
                        className="w-16 rounded-2xl border border-white/20 bg-white/5 px-3 py-3 text-center text-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                      />
                      <input
                        value={category.nombre}
                        onChange={(e) => updateCategoryName(category.id, e.target.value)}
                        className="flex-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-lg font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                placeholder="Nombre de la categoría"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addDish(category.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-emerald-400/20 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400/30"
                      >
                        <Plus className="h-4 w-4" />
                        Añadir plato
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => requestRemoveCategory(category.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-red-400/15 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-400/25"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {category.platos.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
                        Esta categoría no tiene platos aún. Agrega el primero.
                      </div>
                    )}

                    {category.platos.map((dish) => (
                      <div
                        key={dish.id}
                        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.4fr_0.6fr_1fr_1.4fr_auto]"
                      >
                        <input
                          value={dish.nombre}
                          onChange={(e) => updateDish(category.id, dish.id, "nombre", e.target.value)}
                          placeholder="Nombre del plato"
                          disabled={editLocked}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={dish.precio || ""}
                          onChange={(e) => updateDish(category.id, dish.id, "precio", Number.parseFloat(e.target.value) || 0)}
                          placeholder="Precio"
                          disabled={editLocked}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <input
                          value={dish.descripcion ?? ""}
                          onChange={(e) => updateDish(category.id, dish.id, "descripcion", e.target.value)}
                          placeholder="Descripción (ej: Hamburguesa con salsa BBQ)"
                          disabled={editLocked}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <div className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-within:ring-2 focus-within:ring-emerald-300/40">
                          <div className="flex flex-wrap items-center gap-2">
                            {parseIngredients(dish.ingredientes).map((item, idx) => (
                              <span
                                key={`${dish.id}-ing-${idx}`}
                                className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs text-emerald-100"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() => removeIngredient(category.id, dish.id, parseIngredients(dish.ingredientes), idx)}
                                  className="text-emerald-200/80 transition hover:text-white"
                                  aria-label="Quitar ingrediente"
                                  disabled={editLocked}
                                >
                                  {"\u00D7"}
                                </button>
                              </span>
                            ))}
                            <input
                              value={ingredientDrafts[dish.id] ?? ""}
                              onChange={(e) => setIngredientDrafts((prev) => ({ ...prev, [dish.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
                                  e.preventDefault()
                                  addIngredients(
                                    category.id,
                                    dish.id,
                                    parseIngredients(dish.ingredientes),
                                    ingredientDrafts[dish.id] ?? "",
                                  )
                                }
                                if (e.key === "Backspace" && !(ingredientDrafts[dish.id] ?? "").trim()) {
                                  const current = parseIngredients(dish.ingredientes)
                                  if (current.length > 0) {
                                    e.preventDefault()
                                    removeIngredient(category.id, dish.id, current, current.length - 1)
                                  }
                                }
                              }}
                              onBlur={() =>
                                addIngredients(
                                  category.id,
                                  dish.id,
                                  parseIngredients(dish.ingredientes),
                                  ingredientDrafts[dish.id] ?? "",
                                )
                              }
                              placeholder="Ingredientes"
                              disabled={editLocked}
                              className="min-w-[120px] flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-5 flex flex-wrap items-center gap-3">
                          <label className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-emerald-400/15 via-white/5 to-emerald-400/15 px-3 py-2 text-xs text-slate-100 shadow-[0_0_18px_rgba(52,211,153,0.18)] transition-transform duration-150 ease-out hover:border-emerald-300/50 hover:text-white hover:shadow-[0_0_24px_rgba(52,211,153,0.35)] active:scale-95 active:shadow-[0_0_14px_rgba(52,211,153,0.2)]">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={onDishPhotoSelected(category.id, dish.id)}
                              disabled={editLocked}
                            />
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                            <span className="relative text-slate-200">
                              {dish.foto_url ? "Reemplazar foto" : "Subir foto"}
                            </span>
                          </label>
                          <label className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-sky-400/20 via-white/5 to-sky-400/20 px-3 py-2 text-xs text-slate-100 shadow-[0_0_18px_rgba(56,189,248,0.22)] transition-transform duration-150 ease-out hover:border-sky-300/50 hover:text-white hover:shadow-[0_0_24px_rgba(56,189,248,0.35)] active:scale-95 active:shadow-[0_0_14px_rgba(56,189,248,0.25)] md:hidden">
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={onDishPhotoSelected(category.id, dish.id)}
                              disabled={editLocked}
                            />
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-300/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                            <span className="relative text-slate-100">Tomar foto</span>
                          </label>
                          {uploadingDish[dish.id] && (
                            <span className="text-xs text-emerald-300">Subiendo...</span>
                          )}
                          {dish.foto_url && (
                            <img
                              src={dish.foto_url}
                              alt={dish.nombre || "Foto del plato"}
                              className="h-16 w-16 rounded-xl border border-white/10 object-cover"
                            />
                          )}
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => requestRemoveDish(category.id, dish.id)}
                          disabled={editLocked}
                          className="group relative inline-flex h-9 w-fit items-center justify-center justify-self-start overflow-hidden rounded-xl border border-red-300/40 bg-gradient-to-r from-red-500/35 via-red-400/20 to-red-500/35 px-2.5 text-xs font-semibold text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.45)] transition-transform duration-150 ease-out hover:border-red-300/80 hover:text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.95)] active:scale-95 active:shadow-[0_0_14px_rgba(248,113,113,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-300/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                          <Trash2 className="relative h-4 w-4" />
                        </motion.button>
                      </div>
                    ))}
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        <motion.section variants={card} className="rounded-[26px] border border-white/10 bg-white/5 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Guardar menú</h3>
              <p className="text-sm text-slate-400">
                Guarda los cambios para que se reflejen en tu menú.
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveMenu}
              disabled={isSaving || editLocked || menuLoading || !!menuError}
              className="rounded-2xl border border-emerald-300/30 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400/30 disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : menuId ? "Guardar cambios" : "Guardar menú"}
            </motion.button>
          </div>
          {saveError && <p className="mt-3 text-sm text-red-300">{saveError}</p>}
          {saveSuccess && <p className="mt-3 text-sm text-emerald-300">{saveSuccess}</p>}
        </motion.section>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmDishDelete && (
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
                  <h3 className="text-lg font-semibold text-white">Eliminar plato</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Estás por borrar <span className="font-semibold text-white">{confirmDishDelete.dishName}</span>. Esta
                    acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDishDelete(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={confirmRemoveDish}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-red-300/50 bg-gradient-to-r from-red-500/40 via-red-400/20 to-red-500/40 px-4 py-2 text-sm font-semibold text-red-100 shadow-[0_0_22px_rgba(239,68,68,0.55)] transition hover:border-red-300/90 hover:text-white hover:shadow-[0_0_32px_rgba(239,68,68,0.9)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-300/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Eliminar</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {Object.values(removingBackground).some(Boolean) && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1526]/95 p-7 text-white shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
                initial={{ y: 24, scale: 0.98, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 16, scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
                <div className="flex flex-col items-center gap-4">
                  <div className="h-1 w-12 rounded-full bg-white/20" />
                  <div className="text-sm font-semibold text-emerald-200">Procesando foto</div>
                  <div className="flex w-full flex-col items-center gap-3">
                    <div className="relative h-72 w-72 overflow-hidden rounded-[26px] border border-white/10 bg-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.45)] sm:h-80 sm:w-80">
                      <div className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_55%)]" />
                      {(processingPreview || processedPreview) && (
                        <img
                          src={processingPreview || processedPreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                      {processedPreview && (
                        <img
                          src={processedPreview}
                          alt="Vista previa sin fondo"
                          className="absolute inset-0 h-full w-full object-contain transition-all ease-out"
                          style={{
                            clipPath: showProcessedPreview ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                            transform: showProcessedPreview ? "translateX(0)" : "translateX(-10%)",
                            opacity: showProcessedPreview ? 1 : 0.4,
                            filter:
                              "drop-shadow(0 0 18px rgba(56, 189, 248, 0.7)) drop-shadow(0 0 28px rgba(52, 211, 153, 0.55))",
                            transitionDuration: "1200ms",
                          }}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/15 bg-white/10 backdrop-blur-md shadow-[inset_0_0_10px_rgba(255,255,255,0.12)]">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_55%)] opacity-50" />
                      <div
                        className="progress-sheen h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.8)] transition-[width] duration-500"
                        style={{
                          width: `${processingProgress}%`,
                          transitionTimingFunction: "cubic-bezier(0.22,0.61,0.36,1)",
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_6px_rgba(255,255,255,0.35)]" />
                    </div>
                    <div className="mt-2 text-center text-[11px] text-slate-400">
                      {enhancingWithAi
                        ? "Mejorando con IA..."
                        : processedPreview
                          ? aiEnhanced
                            ? "Listo"
                            : "Fondo eliminado"
                          : "Eliminando fondo..."}
                    </div>
                  </div>
                  {(processedPreview || processingError) && (
                    <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
                      {processedPreview && !enhancingWithAi && (
                        <button
                          type="button"
                          onClick={handleEnhanceWithAi}
                          disabled={aiEnhanced}
                          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-300/40 bg-gradient-to-r from-emerald-500/30 via-white/5 to-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.4)] transition hover:border-emerald-300/80 hover:text-white hover:shadow-[0_0_26px_rgba(52,211,153,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="rainbow-orbit pointer-events-none absolute -inset-[2px] rounded-full bg-[conic-gradient(from_180deg,rgba(59,130,246,0.6),rgba(236,72,153,0.6),rgba(250,204,21,0.6),rgba(34,197,94,0.6),rgba(59,130,246,0.6))] opacity-70 blur-[6px] transition-opacity duration-300 group-hover:opacity-100" />
                          <span className="pointer-events-none absolute -inset-px rounded-full border border-white/30 opacity-30" />
                          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                          <span className="relative">{aiEnhanced ? "Mejorada con IA" : "Mejorar con IA"}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setRemovingBackground({})}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-slate-300">
                  {enhancingWithAi
                    ? "Aplicando mejora con IA sobre la imagen sin fondo."
                    : "Eliminando fondo para dejar la imagen lista para mejorar."}
                </p>
{processingError && (
                  <div className="mt-3 w-full rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-[10px] text-red-200">
                    <div className="font-semibold text-red-100">Error del worker</div>
                    <pre className="mt-1 whitespace-pre-wrap text-[10px] leading-snug">{processingError}</pre>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(processingError)}
                      className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white transition hover:bg-white/10"
                    >
                      Copiar error
                    </button>
                  </div>
                )}
<style>{`
                  @keyframes progressSheen {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                  }
                  .progress-sheen {
                    background-size: 200% 100%;
                    animation: progressSheen 2.2s linear infinite;
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
            </motion.div>
          </motion.div>
        )}
        {confirmCategoryDelete && (
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
                  <h3 className="text-lg font-semibold text-white">Eliminar categoría</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Estás por borrar <span className="font-semibold text-white">{confirmCategoryDelete.categoryName}</span> y
                    todos sus platos. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmCategoryDelete(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={confirmRemoveCategory}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-red-300/50 bg-gradient-to-r from-red-500/40 via-red-400/20 to-red-500/40 px-4 py-2 text-sm font-semibold text-red-100 shadow-[0_0_22px_rgba(239,68,68,0.55)] transition hover:border-red-300/90 hover:text-white hover:shadow-[0_0_32px_rgba(239,68,68,0.9)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-300/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Eliminar</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}








