// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import { Share2 } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type Dish = {
  id: number | string
  nombre: string
  descripcion?: string
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

type IngredientPosition = {
  top?: string
  bottom?: string
  left?: string
  right?: string
  transform?: string
}

type IngredientLine = {
  x: number
  y: number
}

type Ingredient = {
  label: string
  sublabel: string
  position: IngredientPosition
  lineStart: IngredientLine
  lineEnd: IngredientLine
  lineDashed?: boolean
  mobilePosition?: IngredientPosition
  mobileLineStart?: IngredientLine
  mobileLineEnd?: IngredientLine
}

const ingredientPositions: Ingredient[] = [
  {
    label: "",
    sublabel: "",
    position: { top: "-6%", left: "-12%" },
    lineStart: { x: 62, y: 58 },
    lineEnd: { x: 178, y: 176 },
    mobilePosition: { top: "6%", left: "4%" },
    mobileLineStart: { x: 74, y: 78 },
    mobileLineEnd: { x: 190, y: 210 },
    lineDashed: false,
  },
  {
    label: "",
    sublabel: "",
    position: { top: "26%", left: "-14%" },
    lineStart: { x: 58, y: 188 },
    lineEnd: { x: 190, y: 236 },
    mobilePosition: { top: "44%", left: "6%" },
    mobileLineStart: { x: 86, y: 248 },
    mobileLineEnd: { x: 198, y: 266 },
    lineDashed: false,
  },
  {
    label: "",
    sublabel: "",
    position: { top: "-14%", left: "50%", transform: "translateX(-50%)" },
    lineStart: { x: 225, y: 32 },
    lineEnd: { x: 225, y: 162 },
    mobilePosition: { top: "-10%", left: "50%", transform: "translateX(-50%)" },
    mobileLineStart: { x: 225, y: 38 },
    mobileLineEnd: { x: 225, y: 170 },
    lineDashed: true,
  },
  {
    label: "",
    sublabel: "",
    position: { bottom: "18%", right: "-12%" },
    lineStart: { x: 384, y: 260 },
    lineEnd: { x: 270, y: 250 },
    mobilePosition: { bottom: "20%", right: "6%" },
    mobileLineStart: { x: 360, y: 286 },
    mobileLineEnd: { x: 284, y: 260 },
    lineDashed: false,
  },
  {
    label: "",
    sublabel: "",
    position: { top: "-2%", right: "-14%" },
    lineStart: { x: 384, y: 70 },
    lineEnd: { x: 276, y: 188 },
    mobilePosition: { top: "10%", right: "6%" },
    mobileLineStart: { x: 370, y: 92 },
    mobileLineEnd: { x: 284, y: 204 },
    lineDashed: true,
  },
]

const getAnalyticsSessionId = () => {
  if (typeof window === "undefined") return ""
  const storageKey = "tavoloai-menu-session-id"
  const existing = window.localStorage.getItem(storageKey)
  if (existing) return existing
  const created = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `session-${Date.now()}`
  window.localStorage.setItem(storageKey, created)
  return created
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#061323",
    backgroundImage: "url(/placeholder.svg?height=1600&width=800&query=blurred food background dark)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    position: "relative" as const,
    paddingBottom: "140px",
  },
  overlay: {
    position: "absolute" as const,
    inset: 0,
    backgroundColor: "rgba(6, 19, 35, 0.88)",
    zIndex: 0,
  },
  content: {
    position: "relative" as const,
    zIndex: 1,
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "clamp(1rem, 4vw, 1.5rem)",
    position: "relative" as const,
  },
  backButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    width: "0",
    height: "0",
    borderTop: "15px solid transparent",
    borderBottom: "15px solid transparent",
    borderRight: "20px solid #C39C57",
  },
  mainContent: {
    padding: "clamp(1rem, 4vw, 2rem)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "clamp(1.5rem, 4vw, 2rem)",
  },
  title: {
    color: "#EED6A8",
    fontSize: "clamp(2.5rem, 10vw, 4rem)",
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center" as const,
    fontFamily: "'Brush Script MT', cursive",
    marginBottom: "0.5rem",
    textShadow: "0 4px 20px rgba(195, 156, 87, 0.5)",
  },
  burgerImageContainer: {
    position: "relative" as const,
    width: "100%",
    maxWidth: "450px",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "2rem 0",
  },
  svgContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
    zIndex: 1,
  },
  burgerImage: {
    width: "80%",
    height: "auto",
    objectFit: "contain" as const,
    filter: "drop-shadow(0 10px 30px rgba(195, 156, 87, 0.4))",
    position: "relative" as const,
    zIndex: 2,
  },
  ingredient: {
    position: "absolute" as const,
    color: "#EED6A8",
    fontStyle: "italic",
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    pointerEvents: "none" as const,
    zIndex: 3,
    minWidth: "auto",
    maxWidth: "160px",
    whiteSpace: "normal" as const,
  },
  ingredientCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.2rem",
    padding: "0.2rem 0.35rem",
    borderRadius: "8px",
    boxShadow: "0 0 0 12px rgba(6, 19, 35, 0)",
    backgroundColor: "transparent",
    fontSize: "clamp(0.75rem, 2.6vw, 0.95rem)",
    lineHeight: 1.2,
    textShadow: "0 0 8px rgba(195, 156, 87, 0.35), 0 0 16px rgba(195, 156, 87, 0.25)",
  },
  ingredientLabel: {
    fontWeight: 700,
    color: "#C39C57",
    fontSize: "clamp(0.85rem, 2.8vw, 1.1rem)",
    letterSpacing: "0.6px",
    textTransform: "uppercase" as const,
    lineHeight: 1.1,
    textShadow: "0 0 8px rgba(195, 156, 87, 0.65), 0 0 18px rgba(195, 156, 87, 0.45)",
  },
  ingredientSublabel: {
    fontSize: "clamp(0.7rem, 2.3vw, 0.9rem)",
    color: "#EED6A8",
    fontWeight: 500,
    letterSpacing: "0.3px",
    lineHeight: 1.1,
    textShadow: "0 0 6px rgba(195, 156, 87, 0.35), 0 0 12px rgba(195, 156, 87, 0.25)",
  },
  tagline: {
    color: "#C39C57",
    fontSize: "clamp(1.5rem, 6vw, 2.2rem)",
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center" as const,
    marginTop: "-1rem",
    textShadow: "0 2px 10px rgba(195, 156, 87, 0.5)",
  },
  description: {
    color: "#EED6A8",
    fontSize: "clamp(1rem, 4vw, 1.25rem)",
    lineHeight: "1.7",
    textAlign: "center" as const,
    maxWidth: "500px",
    padding: "0 1.5rem",
    fontStyle: "italic",
    fontWeight: 300,
    letterSpacing: "0.3px",
    textShadow: "0 0 8px rgba(195, 156, 87, 0.25)",
  },
  price: {
    color: "#C39C57",
    fontSize: "clamp(3rem, 12vw, 4.5rem)",
    fontWeight: 900,
    textAlign: "center" as const,
    marginTop: "1.5rem",
    textShadow: "0 4px 20px rgba(195, 156, 87, 0.6)",
    letterSpacing: "2px",
  },
  footer: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(195, 156, 87, 0.5)",
    padding: "clamp(1.25rem, 5vw, 2rem)",
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    zIndex: 100,
    boxShadow: "0 -8px 22px rgba(195, 156, 87, 0.5), 0 -16px 32px rgba(6, 19, 35, 0.2)",
    borderTop: "1px solid rgba(195, 156, 87, 0.7)",
    backdropFilter: "blur(12px)",
  },
  ratingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    gap: "0.5rem",
    flex: 1,
  },
  ratingLabel: {
    fontSize: "clamp(0.85rem, 3.5vw, 1rem)",
    fontWeight: 700,
    color: "#061323",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  starsContainer: {
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
  },
  star: {
    fontSize: "clamp(1.8rem, 7vw, 2.5rem)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    userSelect: "none" as const,
    filter: "drop-shadow(0 2px 4px rgba(6, 19, 35, 0.3))",
  },
  shareButton: {
    background: "rgba(238, 214, 168, 0.12)",
    border: "1px solid rgba(238, 214, 168, 0.3)",
    borderRadius: "50%",
    width: "clamp(3.5rem, 15vw, 4.5rem)",
    height: "clamp(3.5rem, 15vw, 4.5rem)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 18px rgba(6, 19, 35, 0.2), 0 0 18px rgba(195, 156, 87, 0.28)",
    backdropFilter: "blur(12px)",
  },
  shareIcon: {
    width: "clamp(1.8rem, 7vw, 2.5rem)",
    height: "clamp(1.8rem, 7vw, 2.5rem)",
    color: "#EED6A8",
    filter: "drop-shadow(0 0 10px rgba(195, 156, 87, 0.4))",
  },
  statusCard: {
    margin: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: "14px",
    border: "1px dashed rgba(238, 214, 168, 0.2)",
    background: "rgba(6, 19, 35, 0.55)",
    color: "rgba(238, 214, 168, 0.7)",
    textAlign: "center" as const,
  },
  statusError: {
    margin: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: "14px",
    border: "1px solid rgba(248, 113, 113, 0.5)",
    background: "rgba(248, 113, 113, 0.15)",
    color: "rgba(254, 202, 202, 0.9)",
    textAlign: "center" as const,
  },
  placeholderImage: {
    width: "80%",
    aspectRatio: "1",
    borderRadius: "18px",
    border: "1px dashed rgba(238, 214, 168, 0.2)",
    background: "linear-gradient(140deg, rgba(238, 214, 168, 0.06), rgba(6, 19, 35, 0.35))",
    display: "grid",
    placeItems: "center",
    color: "rgba(238, 214, 168, 0.5)",
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
}

export default function DishDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const dishId = params?.id
  const categoryId = searchParams.get("category") ?? ""
  const menuIdParam = searchParams.get("menu") ?? ""

  const [dish, setDish] = useState<Dish | null>(null)
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const formatEuro = (value: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value)

  useEffect(() => {
    const loadDish = async () => {
      setMenuLoading(true)
      setMenuError("")
      try {
        const params = menuIdParam ? `?menu=${encodeURIComponent(menuIdParam)}` : ""
        const response = await fetch(`/api/menu/public${params}`, { cache: "no-store" })
        if (!response.ok) {
          setMenuError("Non siamo riusciti a caricare il piatto.")
          setMenuLoading(false)
          return
        }
        const result = await response.json()
        const data = result?.menu
        const categories = (data?.categories ?? []) as Category[]
        const flattened = categories.flatMap((cat) => (cat.platos ?? []).filter((dish) => dish.activo !== false))
        const found = flattened.find((item) => String(item.id) === String(dishId))

        if (found) {
          setDish(found)
        } else {
          setMenuError("Non abbiamo trovato questo piatto.")
        }
      } catch {
        setMenuError("Non siamo riusciti a caricare il piatto.")
      } finally {
        setMenuLoading(false)
      }
    }

    loadDish()
  }, [dishId, menuIdParam])

  useEffect(() => {
    if (!dish?.id || !menuIdParam || typeof window === "undefined") return

    const storageKey = `dish-view-tracked:${menuIdParam}:${dish.id}`
    if (window.sessionStorage.getItem(storageKey)) return

    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuId: menuIdParam,
        eventType: "dish_view",
        dishId: String(dish.id),
        sessionId: getAnalyticsSessionId(),
        path: window.location.pathname + window.location.search,
      }),
    }).catch(() => {})

    window.sessionStorage.setItem(storageKey, "1")
  }, [dish?.id, menuIdParam])

  useEffect(() => {
    const evaluateViewport = () => {
      if (typeof window === "undefined") return
      setIsMobile(window.innerWidth <= 640)
    }

    evaluateViewport()

    if (typeof window === "undefined") return
    window.addEventListener("resize", evaluateViewport)
    return () => window.removeEventListener("resize", evaluateViewport)
  }, [])

  const ingredientItems = useMemo(() => {
    const base = dish?.ingredientes ?? ""
    const parts = base
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    return ingredientPositions.slice(0, parts.length).map((slot, index) => {
      const label = parts[index] ?? ""
      return {
        ...slot,
        label,
        sublabel: "",
      }
    })
  }, [dish?.ingredientes])

  const activeStars = hoveredStar || rating

  const handleShare = async () => {
    if (!dish) return

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: dish.nombre,
          text: dish.ingredientes,
          url: window.location.href,
        })
        return
      } catch (error) {
        console.error("Errore durante la condivisione del piatto:", error)
      }
    }

    if (typeof window !== "undefined") {
      window.alert("La funzione di condivisione non e disponibile su questo dispositivo.")
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />

        <div style={styles.content}>
          <motion.header
            style={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              style={styles.backButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                router.push(
                  categoryId
                    ? `/menu/burgers?category=${encodeURIComponent(categoryId)}${
                        menuIdParam ? `&menu=${encodeURIComponent(menuIdParam)}` : ""
                      }`
                    : menuIdParam
                    ? `/menu/burgers?menu=${encodeURIComponent(menuIdParam)}`
                    : "/menu/burgers",
                )
              }
            >
              <div style={styles.backArrow} />
            </motion.button>
          </motion.header>

          {menuLoading && <div style={styles.statusCard}>Caricamento piatto...</div>}
          {menuError && <div style={styles.statusError}>{menuError}</div>}

          {!menuLoading && dish && (
            <motion.div
              style={styles.mainContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.h1
                style={styles.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {dish.nombre}
              </motion.h1>

              <motion.div
                style={styles.burgerImageContainer}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <svg style={styles.svgContainer} viewBox="0 0 450 450" preserveAspectRatio="xMidYMid meet">
                {ingredientItems.map((ingredient, index) => {
                  const lineStart =
                    isMobile && ingredient.mobileLineStart ? ingredient.mobileLineStart : ingredient.lineStart
                  const lineEnd =
                    isMobile && ingredient.mobileLineEnd ? ingredient.mobileLineEnd : ingredient.lineEnd
                  const controlOffset = isMobile ? 12 : 20
                    const controlX = (lineStart.x + lineEnd.x) / 2
                    const controlY = (lineStart.y + lineEnd.y) / 2 - controlOffset

                    return (
                      <motion.path
                        key={`${ingredient.label}-${index}`}
                        d={`M ${lineStart.x} ${lineStart.y} Q ${controlX} ${controlY} ${lineEnd.x} ${lineEnd.y}`}
                        stroke="rgba(195, 156, 87, 0.7)"
                        strokeWidth="2"
                        strokeDasharray={ingredient.lineDashed ? "8 4" : undefined}
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      />
                    )
                  })}
                </svg>

                {dish.foto_url ? (
                  <motion.img
                    src={dish.foto_url}
                    alt={dish.nombre}
                    style={styles.burgerImage}
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                ) : (
                  <div style={styles.placeholderImage}>Nessuna foto</div>
                )}

                {ingredientItems.map((ingredient, index) => {
                  const ingredientPosition =
                    isMobile && ingredient.mobilePosition ? ingredient.mobilePosition : ingredient.position
                  const ingredientStyle = {
                    ...styles.ingredient,
                    ...ingredientPosition,
                    ...(isMobile ? { maxWidth: "140px" } : {}),
                  }
                  const ingredientCardStyle = {
                    ...styles.ingredientCard,
                    ...(isMobile ? { padding: "0.35rem 0.6rem", borderRadius: "12px" } : {}),
                  }

                  return (
                    <motion.div
                      key={`${ingredient.label}-${index}`}
                      style={ingredientStyle}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45, delay: 0.6 + index * 0.08 }}
                      whileHover={{ scale: 1.04 }}
                    >
                      <div style={ingredientCardStyle}>
                        <div style={styles.ingredientLabel}>{ingredient.label}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>

              <motion.p
                style={styles.tagline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {dish.descripcion || dish.tagline || dish.nombre}
              </motion.p>

              <motion.div
                style={styles.price}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                {formatEuro(dish.precio)}
              </motion.div>
            </motion.div>
          )}
        </div>

        <motion.footer
          style={styles.footer}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div style={styles.ratingContainer}>
            <span style={styles.ratingLabel}>Valuta</span>
            <div style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <motion.span
                  key={starIndex}
                  style={styles.star}
                  whileHover={{
                    scale: 1.3,
                    rotate: [0, -10, 10, 0],
                  }}
                  whileTap={{ scale: 0.8 }}
                  animate={
                    starIndex <= rating
                      ? {
                          filter: [
                            "drop-shadow(0 2px 4px rgba(6, 19, 35, 0.3))",
                            "drop-shadow(0 0 15px rgba(195, 156, 87, 0.8))",
                            "drop-shadow(0 2px 4px rgba(6, 19, 35, 0.3))",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  onMouseEnter={() => setHoveredStar(starIndex)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(starIndex)}
                >
                  {starIndex <= activeStars ? "?" : "?"}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.button
            style={styles.shareButton}
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(6, 19, 35, 0.25)",
              rotate: [0, -5, 5, 0],
            }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
          >
            <Share2 style={styles.shareIcon} />
          </motion.button>
        </motion.footer>
    </div>
  )
}





