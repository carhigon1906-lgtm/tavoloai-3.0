"use client";
// @ts-nocheck

import { motion } from "framer-motion"
import { Search, Share2, SlidersHorizontal, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export const dynamic = "force-dynamic"


const MotionButton = motion.button

type Dish = {
    id: number | string
    nombre: string
    ingredientes: string
    descripcion?: string
    tagline?: string
    precio: number
    foto_url?: string
    activo?: boolean
}

type Category = {
    id: number | string
    nombre: string
    platos: Dish[]
}

export default function BurgersPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const categoryId = searchParams.get("category") ?? ""
    const menuIdParam = searchParams.get("menu") ?? ""
    const [categoryName, setCategoryName] = useState("Categoria")
    const [dishes, setDishes] = useState<Dish[]>([])
    const [menuLoading, setMenuLoading] = useState(true)
    const [menuError, setMenuError] = useState("")

    const [searchQuery, setSearchQuery] = useState("")
    const [filterOpen, setFilterOpen] = useState(false)
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])

    const formatEuro = (value: number) =>
        new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value)

    const normalizeText = (value: string) =>
        value
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .trim()

    const ingredientOptions = useMemo(() => {
        const map = new Map<string, string>()
        dishes.forEach((dish) => {
            const raw = dish.ingredientes ?? ""
            raw
                .split(/[,\n;]+/)
                .map((item) => item.trim())
                .filter(Boolean)
                .forEach((item) => {
                    const key = normalizeText(item)
                    if (!map.has(key)) map.set(key, item)
                })
        })
        return Array.from(map.entries())
            .map(([key, label]) => ({ key, label }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [dishes])

    const ALLERGY_OPTIONS = [
        { key: "ajo", label: "Aglio", terms: ["ajo", "garlic"] },
        { key: "cebolla", label: "Cipolla", terms: ["cebolla", "onion"] },
        { key: "lacteos", label: "Latticini", terms: ["queso", "leche", "crema", "mantequilla", "yogur"] },
        { key: "gluten", label: "Gluten", terms: ["pan", "harina", "trigo", "pasta"] },
        { key: "huevo", label: "Uovo", terms: ["huevo", "mayonesa"] },
        { key: "mariscos", label: "Frutti di mare", terms: ["camaron", "camarÃ³n", "marisco", "shrimp"] },
        { key: "frutos-secos", label: "Frutta secca", terms: ["nuez", "almendra", "mani", "manÃ­", "cacahuate"] },
        { key: "soya", label: "Soya", terms: ["soya", "soja"] },
    ]

    const filteredDishes = useMemo(() => {
        const trimmedQuery = normalizeText(searchQuery)
        const activeIngredients = selectedIngredients
        const activeAllergies = selectedAllergies
        return dishes.filter((dish) => {
            const name = normalizeText(dish.nombre || "")
            const ingredientsText = normalizeText(dish.ingredientes || "")

            if (trimmedQuery) {
                if (!name.includes(trimmedQuery) && !ingredientsText.includes(trimmedQuery)) return false
            }

            if (activeIngredients.length > 0) {
                const blockedByIngredient = activeIngredients.some((ing) => ingredientsText.includes(ing))
                if (blockedByIngredient) return false
            }

            if (activeAllergies.length > 0) {
                const blocked = activeAllergies.some((key) => {
                    const allergy = ALLERGY_OPTIONS.find((item) => item.key === key)
                    if (!allergy) return false
                    return allergy.terms.some((term) => ingredientsText.includes(normalizeText(term)))
                })
                if (blocked) return false
            }

            return true
        })
    }, [dishes, searchQuery, selectedIngredients, selectedAllergies])

    const hasResults = filteredDishes.length > 0

    useEffect(() => {
        const loadMenu = async () => {
            setMenuLoading(true)
            setMenuError("")
            try {
                const params = menuIdParam ? `?menu=${encodeURIComponent(menuIdParam)}` : ""
                const response = await fetch(`/api/menu/public${params}`, { cache: "no-store" })
                if (!response.ok) {
                    setMenuError("Non siamo riusciti a caricare il tuo menu.")
                    setMenuLoading(false)
                    return
                }
                const result = await response.json()
                const data = result?.menu
                const categories = (data?.categories ?? []) as Category[]
                const selected = categories.find((cat) => String(cat.id) === String(categoryId))
                if (selected) {
                    setCategoryName(selected.nombre)
                    setDishes((selected.platos ?? []).filter((dish) => dish.activo !== false))
                } else if (categories[0]) {
                    setCategoryName(categories[0].nombre)
                    setDishes((categories[0].platos ?? []).filter((dish) => dish.activo !== false))
                }
            } catch {
                setMenuError("Non siamo riusciti a caricare il tuo menu.")
            } finally {
                setMenuLoading(false)
            }
        }

        loadMenu()
    }, [categoryId, menuIdParam])

    const handleSearch = () => {}
    const handleFilter = () => setFilterOpen(true)
    const handleShare = () => {}

    const toggleIngredient = (key: string) => {
        setSelectedIngredients((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
        )
    }

    const toggleAllergy = (key: string) => {
        setSelectedAllergies((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
        )
    }

    const resetFilters = () => {
        setSelectedIngredients([])
        setSelectedAllergies([])
    }

    const styles = {
        container: {
            minHeight: "100vh",
            backgroundColor: "#061323",
            backgroundImage:
                'linear-gradient(rgba(6, 19, 35, 0.88), rgba(6, 19, 35, 0.9)), url("https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            position: "relative" as const,
            paddingBottom: "80px",
        },
        overlay: {
            position: "absolute" as const,
            inset: 0,
            backgroundColor: "rgba(6, 19, 35, 0.5)",
            zIndex: 0,
        },
        content: {
            position: "relative" as const,
            zIndex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(1rem, 4vw, 1.5rem)",
            position: "relative" as const,
        },
        backButton: {
            position: "absolute" as const,
            left: "clamp(1rem, 4vw, 1.5rem)",
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
            marginRight: "5px",
        },
        title: {
            color: "#EED6A8",
            fontSize: "clamp(1.2rem, 5vw, 1.8rem)",
            fontWeight: "bold",
            fontStyle: "italic",
            textAlign: "center" as const,
            letterSpacing: "1px",
            textShadow: "0 0 10px rgba(195, 156, 87, 0.45), 0 0 22px rgba(195, 156, 87, 0.35)",
        },
        filterModalOverlay: {
            position: "fixed" as const,
            inset: 0,
            backgroundColor: "rgba(6, 19, 35, 0.7)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 150,
            padding: "0.5rem 0.5rem 140px",
        },
        filterModalCard: {
            width: "min(520px, 96vw)",
            maxHeight: "calc(100vh - 140px)",
            backgroundColor: "rgba(18, 26, 38, 0.98)",
            borderRadius: "24px",
            padding: "0.75rem 0.9rem 0",
            boxShadow: "0 24px 55px rgba(6, 19, 35, 0.6)",
            border: "1px solid rgba(238, 214, 168, 0.12)",
            overflow: "hidden" as const,
            WebkitOverflowScrolling: "touch" as const,
        },
        filterHandle: {
            width: "44px",
            height: "5px",
            borderRadius: "9999px",
            background: "rgba(238, 214, 168, 0.4)",
            margin: "0 auto 0.6rem",
        },
        filterBody: {
            padding: "0 0.2rem 0.9rem",
            maxHeight: "calc(100vh - 260px)",
            overflowY: "auto" as const,
        },
        filterModalHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.35rem",
        },
        filterModalTitle: {
            color: "#EED6A8",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
        },
        filterModalClose: {
            background: "transparent",
            border: "none",
            color: "rgba(238,214,168,0.7)",
            fontSize: "1.25rem",
            cursor: "pointer",
        },
        filterModalActions: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginTop: "1rem",
        },
        filterModalApply: {
            padding: "0.55rem 1.25rem",
            borderRadius: "9999px",
            border: "none",
            background:
                "linear-gradient(120deg, rgba(195, 156, 87, 0.95), rgba(195, 156, 87, 0.95))",
            color: "#061323",
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            cursor: "pointer",
            textTransform: "uppercase" as const,
        },
        filterBar: {
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "0.45rem",
            alignItems: "center",
            justifyContent: "flex-start",
            marginTop: "0.4rem",
        },
        filterChip: {
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.7rem",
            borderRadius: "9999px",
            background: "rgba(6, 19, 35, 0.6)",
            border: "1px solid rgba(238, 214, 168, 0.14)",
            color: "#EED6A8",
            cursor: "pointer",
            textAlign: "left" as const,
            minWidth: "0",
            boxShadow: "0 12px 28px rgba(6, 19, 35, 0.35)",
        },
        filterChipActive: {
            background: "linear-gradient(120deg, rgba(195, 156, 87, 0.2), rgba(195, 156, 87, 0.45))",
            borderColor: "#C39C57",
            boxShadow: "0 18px 34px rgba(195, 156, 87, 0.22)",
        },
        filterChipIcon: {
            fontSize: "1.25rem",
        },
        filterChipCopy: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.2rem",
            lineHeight: 1.1,
        },
        filterChipLabel: {
            fontSize: "0.74rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            wordBreak: "break-word" as const,
        },
        filterChipHelper: {
            fontSize: "0.6rem",
            color: "rgba(238, 214, 168, 0.7)",
        },
        filterReset: {
            padding: "0.6rem 1rem",
            borderRadius: "9999px",
            border: "1px solid rgba(238, 214, 168, 0.25)",
            background: "rgba(238,214,168,0.06)",
            color: "#EED6A8",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: "pointer",
        },
        filterSummary: {
            fontSize: "0.72rem",
            color: "rgba(238, 214, 168, 0.75)",
            textAlign: "center" as const,
            marginBottom: "0.5rem",
        },
        filterDivider: {
            height: "1px",
            background: "rgba(238, 214, 168, 0.1)",
            margin: "0.65rem 0 0.45rem",
        },
        searchBar: {
            padding: "0 1rem",
            marginBottom: "0.25rem",
        },
        searchInput: {
            width: "100%",
            padding: "0.6rem 0.9rem",
            borderRadius: "9999px",
            border: "1px solid rgba(238, 214, 168, 0.2)",
            backgroundColor: "rgba(6, 19, 35, 0.6)",
            color: "#EED6A8",
            fontSize: "0.9rem",
            outline: "none",
            backdropFilter: "blur(8px)",
        },
        statusCard: {
            margin: "0 1rem 0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "14px",
            border: "1px dashed rgba(238, 214, 168, 0.2)",
            background: "rgba(6, 19, 35, 0.55)",
            color: "rgba(238, 214, 168, 0.7)",
            textAlign: "center" as const,
        },
        statusError: {
            margin: "0 1rem 0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "14px",
            border: "1px solid rgba(248, 113, 113, 0.5)",
            background: "rgba(248, 113, 113, 0.15)",
            color: "rgba(254, 202, 202, 0.9)",
            textAlign: "center" as const,
        },
        productsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
            gap: "clamp(0.5rem, 2vw, 1rem)",
            padding: "clamp(0.5rem, 3vw, 1rem)",
            maxWidth: "100%",
        },
        productCard: {
            backgroundImage:
                "linear-gradient(135deg, rgba(238, 214, 168, 0.08) 0%, rgba(6, 19, 35, 0.72) 100%), linear-gradient(120deg, rgba(195, 156, 87, 0.08), rgba(238, 214, 168, 0.04), rgba(195, 156, 87, 0.08))",
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 50%",
            animation: "cardGlow 6s ease-in-out infinite",
            borderRadius: "16px",
            padding: "clamp(0.7rem, 2.8vw, 1rem)",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "clamp(0.4rem, 1.8vw, 0.65rem)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(195, 156, 87, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 22px rgba(6, 19, 35, 0.4), 0 0 18px rgba(195, 156, 87, 0.25)",
        },
        productImageWrapper: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0.35rem 0 0.1rem",
        },
        productName: {
            color: "#EED6A8",
            fontSize: "clamp(0.9rem, 3.6vw, 1.15rem)",
            fontWeight: "bold",
            fontStyle: "italic",
            textAlign: "center" as const,
            marginBottom: "0.25rem",
        },
        productIngredients: {
            fontSize: "clamp(0.65rem, 2.3vw, 0.8rem)",
            color: "rgba(238, 214, 168, 0.7)",
            textAlign: "center" as const,
            lineHeight: 1.4,
            minHeight: "2.4em",
            textShadow: "0 0 8px rgba(195, 156, 87, 0.25)",
        },
        variantInfo: {
            display: "flex",
            gap: "0.5rem",
            fontSize: "clamp(0.65rem, 2.5vw, 0.8rem)",
            color: "#EED6A8",
            fontStyle: "italic",
            marginBottom: "0.5rem",
        },
        productTags: {
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap" as const,
            justifyContent: "center",
        },
        tagPill: {
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.3rem 0.65rem",
            borderRadius: "9999px",
            background: "rgba(238, 214, 168, 0.08)",
            border: "1px solid rgba(238, 214, 168, 0.15)",
            fontSize: "0.7rem",
            color: "#C39C57",
            letterSpacing: "0.04em",
        },
        productImage: {
            width: "100%",
            maxWidth: "150px",
            height: "auto",
            aspectRatio: "1",
            objectFit: "contain" as const,
            borderRadius: "12px",
            filter: "drop-shadow(0 18px 28px rgba(6, 19, 35, 0.45))",
        },
        productImagePlaceholder: {
            width: "min(48vw, 150px)",
            aspectRatio: "1",
            borderRadius: "14px",
            border: "1px dashed rgba(238, 214, 168, 0.2)",
            background: "linear-gradient(140deg, rgba(238, 214, 168, 0.06), rgba(6, 19, 35, 0.35))",
            display: "grid",
            placeItems: "center",
            color: "rgba(238, 214, 168, 0.5)",
            fontSize: "0.75rem",
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
        },
        price: {
            color: "#C39C57",
            fontSize: "clamp(1rem, 4.2vw, 1.35rem)",
            fontWeight: "bold",
            marginTop: "0.5rem",
            textShadow: "0 0 8px rgba(195, 156, 87, 0.5), 0 0 16px rgba(195, 156, 87, 0.35)",
        },
        emptyState: {
            gridColumn: "1 / -1",
            background: "rgba(6, 19, 35, 0.55)",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center" as const,
            border: "1px solid rgba(238, 214, 168, 0.1)",
        },
        emptyTitle: {
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#C39C57",
            letterSpacing: "0.05em",
        },
        emptySubtitle: {
            marginTop: "0.5rem",
            fontSize: "0.85rem",
            color: "rgba(238, 214, 168, 0.75)",
        },
        loadingWrap: {
            position: "fixed" as const,
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 200,
            display: "block",
            backgroundColor: "rgba(6, 19, 35, 0.35)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
        },
        loadingRing: {
            width: "36px",
            height: "36px",
            borderRadius: "9999px",
            background:
                "conic-gradient(from 90deg, rgba(238,214,168,0.15), rgba(238,214,168,0.95), rgba(238,214,168,0.15))",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #061323 0)",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #061323 0)",
            animation: "spin 0.85s linear infinite",
            boxShadow: "0 0 14px rgba(238, 214, 168, 0.25)",
        },
        loadingLabel: {
            marginTop: "0.7rem",
            fontSize: "0.75rem",
            color: "rgba(238, 214, 168, 0.8)",
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
        },
        loadingCard: {
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "center",
        },
        footer: {
            position: "fixed" as const,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(195, 156, 87, 0.5)",
            padding: "clamp(0.75rem, 3vw, 1rem)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 100,
            boxShadow: "0 -8px 22px rgba(195, 156, 87, 0.5), 0 -16px 32px rgba(6, 19, 35, 0.2)",
            borderTop: "1px solid rgba(195, 156, 87, 0.7)",
            backdropFilter: "blur(12px)",
        },
        actionButton: {
            background: "rgba(238, 214, 168, 0.12)",
            border: "1px solid rgba(238, 214, 168, 0.3)",
            borderRadius: "18px",
            padding: "clamp(0.65rem, 3vw, 0.9rem) clamp(1rem, 4vw, 1.6rem)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "0.25rem",
            flex: 1,
            maxWidth: "120px",
            transition: "all 0.3s ease",
            backdropFilter: "blur(12px)",
            boxShadow:
                "0 8px 18px rgba(6, 19, 35, 0.2), 0 0 18px rgba(195, 156, 87, 0.28), inset 0 1px 0 rgba(238, 214, 168, 0.25)",
        },
        buttonIcon: {
            width: "clamp(1.2rem, 5vw, 1.5rem)",
            height: "clamp(1.2rem, 5vw, 1.5rem)",
            color: "#EED6A8",
            textShadow: "0 0 12px rgba(195, 156, 87, 0.4)",
        },
        buttonText: {
            fontSize: "clamp(0.65rem, 2.5vw, 0.8rem)",
            fontWeight: "bold",
            color: "rgba(238, 214, 168, 0.9)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
        },
    }

    return (
        <div style={styles.container}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }
@keyframes cardGlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
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
                                router.push(menuIdParam ? `/menu?menu=${encodeURIComponent(menuIdParam)}` : "/menu")
                            }
                        >
                        <div style={styles.backArrow} />
                    </motion.button>

                        <h1 style={styles.title}>{categoryName.toUpperCase()}</h1>
                    </motion.header>

                    {menuLoading && <div style={styles.statusCard}>Caricamento piatti...</div>}
                    {menuError && <div style={styles.statusError}>{menuError}</div>}

                    <div style={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Cerca piatto o ingrediente..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    {filterOpen && (
                        <div style={styles.filterModalOverlay} onClick={() => setFilterOpen(false)}>
                            <div style={styles.filterModalCard} onClick={(event) => event.stopPropagation()}>
                                <div style={styles.filterHandle} />
                                <div style={styles.filterModalHeader}>
                                    <span style={styles.filterModalTitle}>Filtri</span>
                                    <button style={styles.filterModalClose} onClick={() => setFilterOpen(false)} aria-label="Chiudi filtri">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={styles.filterBody}>
                                    <div style={{ ...styles.filterSummary, textAlign: "left" }}>Ingredienti (escludi)</div>
                                    <div style={styles.filterBar}>
                                        {ingredientOptions.length === 0 && (
                                            <div style={styles.filterSummary}>Non ci sono ingredienti da filtrare.</div>
                                        )}
                                        {ingredientOptions.map((item) => {
                                            const active = selectedIngredients.includes(item.key)
                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    style={{
                                                        ...styles.filterChip,
                                                        ...(active ? styles.filterChipActive : {}),
                                                    }}
                                                    onClick={() => toggleIngredient(item.key)}
                                                >
                                                    <span style={styles.filterChipIcon}>IN</span>
                                                    <span style={styles.filterChipCopy}>
                                                        <span style={styles.filterChipLabel}>{item.label}</span>
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div style={styles.filterDivider} />

                                    <div style={{ ...styles.filterSummary, textAlign: "left" }}>Allergie</div>
                                    <div style={styles.filterBar}>
                                        {ALLERGY_OPTIONS.map((item) => {
                                            const active = selectedAllergies.includes(item.key)
                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    style={{
                                                        ...styles.filterChip,
                                                        ...(active ? styles.filterChipActive : {}),
                                                    }}
                                                    onClick={() => toggleAllergy(item.key)}
                                                >
                                                    <span style={styles.filterChipIcon}>AL</span>
                                                    <span style={styles.filterChipCopy}>
                                                        <span style={styles.filterChipLabel}>{item.label}</span>
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div style={styles.filterModalActions}>
                                    <button type="button" style={styles.filterReset} onClick={resetFilters}>
                                        Cancella
                                    </button>
                                    <button type="button" style={styles.filterModalApply} onClick={() => setFilterOpen(false)}>
                                        Applica
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={styles.productsGrid}>
                        {hasResults ? (
                            filteredDishes.map((dish, index) => (
                                <motion.div
                                    key={dish.id}
                                    style={styles.productCard}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: index * 0.08,
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(29, 48, 42, 0.9)",
                                        borderColor: "rgba(195, 156, 87, 0.5)",
                                        boxShadow: "0 14px 28px rgba(6, 19, 35, 0.45), 0 0 26px rgba(195, 156, 87, 0.5)",
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        router.push(
                                            `/menu/burgers/${dish.id}?category=${encodeURIComponent(categoryId)}${
                                                menuIdParam ? `&menu=${encodeURIComponent(menuIdParam)}` : ""
                                            }`,
                                        )
                                    }
                                >
                                    <h3 style={styles.productName}>{dish.nombre}</h3>
                                    <p style={styles.productIngredients}>
                                        {dish.descripcion || dish.tagline || "Descrizione da definire"}
                                    </p>
                                    <div style={styles.productImageWrapper}>
                                        {dish.foto_url ? (
                                            <img
                                                src={dish.foto_url}
                                                alt={dish.nombre || "Foto del piatto"}
                                                style={styles.productImage}
                                            />
                                        ) : (
                                            <div style={styles.productImagePlaceholder}>Nessuna foto</div>
                                        )}
                                    </div>
                                    <p style={styles.price}>{formatEuro(dish.precio)}</p>
                                </motion.div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                <p style={styles.emptyTitle}>Nessun risultato</p>
                                <p style={styles.emptySubtitle}>Aggiungi piatti o modifica la ricerca.</p>
                            </div>
                        )}
                    </div>
                </div>

                <motion.footer
                    style={styles.footer}
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <motion.button
                        style={styles.actionButton}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(6, 19, 35, 0.3)",
                            borderColor: "rgba(6, 19, 35, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearch}
                    >
                        <Search style={styles.buttonIcon} />
                        <span style={styles.buttonText}>Cerca</span>
                    </motion.button>

                    <motion.button
                        style={styles.actionButton}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(6, 19, 35, 0.3)",
                            borderColor: "rgba(6, 19, 35, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFilter}
                    >
                        <SlidersHorizontal style={styles.buttonIcon} />
                        <span style={styles.buttonText}>Filtra</span>
                    </motion.button>

                    <motion.button
                        style={styles.actionButton}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(6, 19, 35, 0.3)",
                            borderColor: "rgba(6, 19, 35, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShare}
                    >
                        <Share2 style={styles.buttonIcon} />
                        <span style={styles.buttonText}>Condividi</span>
                    </motion.button>
                </motion.footer>
                {menuLoading && (
                    <div style={styles.loadingWrap}>
                        <div style={styles.loadingCard}>
                            <div style={styles.loadingRing} />
                            <div style={styles.loadingLabel}>Caricamento piatti</div>
                        </div>
                    </div>
                )}
        </div>
    )
}














