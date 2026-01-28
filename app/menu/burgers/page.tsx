"use client";
// @ts-nocheck

import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import RequireAuth from "@/components/guards/RequireAuth"

export const dynamic = "force-dynamic"


const MotionButton = motion.button

type Dish = {
    id: number | string
    nombre: string
    ingredientes: string
    precio: number
    foto_url?: string
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
    const [categoryName, setCategoryName] = useState("Categoría")
    const [dishes, setDishes] = useState<Dish[]>([])
    const [menuLoading, setMenuLoading] = useState(true)
    const [menuError, setMenuError] = useState("")

    const [searchQuery, setSearchQuery] = useState("")

    const filteredDishes = useMemo(() => {
        const trimmedQuery = searchQuery.trim().toLowerCase()
        if (!trimmedQuery) return dishes
        return dishes.filter((dish) => {
            if (dish.nombre.toLowerCase().includes(trimmedQuery)) return true
            if (dish.ingredientes?.toLowerCase().includes(trimmedQuery)) return true
            return false
        })
    }, [dishes, searchQuery])

    const hasResults = filteredDishes.length > 0

    useEffect(() => {
        const loadMenu = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            if (!session) {
                setMenuLoading(false)
                return
            }

            const { data, error } = await supabase
                .from("menus")
                .select("categories")
                .eq("user_id", session.user.id)
                .maybeSingle()

            if (error) {
                setMenuError("No pudimos cargar tu menú.")
                setMenuLoading(false)
                return
            }

            const categories = (data?.categories ?? []) as Category[]
            const selected = categories.find((cat) => String(cat.id) === String(categoryId))
            if (selected) {
                setCategoryName(selected.nombre)
                setDishes(selected.platos ?? [])
            } else if (categories[0]) {
                setCategoryName(categories[0].nombre)
                setDishes(categories[0].platos ?? [])
            }

            setMenuLoading(false)
        }

        loadMenu()
    }, [categoryId])

    const handleSearch = () => {}
    const handleFilter = () => {}
    const handleShare = () => {}

    const styles = {
        container: {
            minHeight: "100vh",
            backgroundColor: "#000",
            backgroundImage: "url(/placeholder.svg?height=1600&width=800&query=blurred food background dark)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            position: "relative" as const,
            paddingBottom: "80px",
        },
        overlay: {
            position: "absolute" as const,
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
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
            borderRight: "20px solid #FFD700",
            marginRight: "5px",
        },
        title: {
            color: "#fff",
            fontSize: "clamp(1.2rem, 5vw, 1.8rem)",
            fontWeight: "bold",
            fontStyle: "italic",
            textAlign: "center" as const,
            letterSpacing: "1px",
        },
        filterModalOverlay: {
            position: "fixed" as const,
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
            padding: "1.25rem",
        },
        filterModalCard: {
            width: "min(420px, 100%)",
            backgroundColor: "rgba(15, 15, 15, 0.97)",
            borderRadius: "18px",
            padding: "1.25rem 1.5rem",
            boxShadow: "0 22px 45px rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
        },
        filterModalHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
        },
        filterModalTitle: {
            color: "#fff",
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
        },
        filterModalClose: {
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.85rem",
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
                "linear-gradient(120deg, rgba(255, 215, 0, 0.95), rgba(255, 153, 0, 0.95))",
            color: "#000",
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            cursor: "pointer",
            textTransform: "uppercase" as const,
        },
        filterBar: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.6rem",
            alignItems: "stretch",
            justifyContent: "center",
            marginTop: "0.5rem",
        },
        filterChip: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1rem",
            borderRadius: "9999px",
            background: "rgba(0, 0, 0, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            color: "#fff",
            cursor: "pointer",
            textAlign: "left" as const,
            minWidth: "180px",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
        },
        filterChipActive: {
            background: "linear-gradient(120deg, rgba(255, 215, 0, 0.2), rgba(255, 76, 76, 0.45))",
            borderColor: "#FFD700",
            boxShadow: "0 18px 34px rgba(255, 215, 0, 0.22)",
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
            fontSize: "0.85rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
        },
        filterChipHelper: {
            fontSize: "0.7rem",
            color: "rgba(255, 255, 255, 0.7)",
        },
        filterReset: {
            padding: "0.6rem 1rem",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: "pointer",
        },
        filterSummary: {
            fontSize: "0.8rem",
            color: "rgba(255, 255, 255, 0.75)",
            textAlign: "center" as const,
            marginBottom: "0.5rem",
        },
        searchBar: {
            padding: "0 1rem",
            marginBottom: "0.25rem",
        },
        searchInput: {
            width: "100%",
            padding: "0.6rem 0.9rem",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "#fff",
            fontSize: "0.9rem",
            outline: "none",
        },
        statusCard: {
            margin: "0 1rem 0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "14px",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
            background: "rgba(0, 0, 0, 0.55)",
            color: "rgba(255, 255, 255, 0.7)",
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
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(0.5rem, 2vw, 1rem)",
            padding: "clamp(0.5rem, 3vw, 1rem)",
            maxWidth: "100%",
        },
        productCard: {
            backgroundColor: "rgba(20, 20, 20, 0.8)",
            borderRadius: "16px",
            padding: "clamp(0.9rem, 3.5vw, 1.2rem)",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "clamp(0.5rem, 2vw, 0.75rem)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },
        productImageWrapper: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0.35rem 0 0.1rem",
        },
        productName: {
            color: "#fff",
            fontSize: "clamp(1rem, 4vw, 1.3rem)",
            fontWeight: "bold",
            fontStyle: "italic",
            textAlign: "center" as const,
            marginBottom: "0.25rem",
        },
        productIngredients: {
            fontSize: "clamp(0.7rem, 2.6vw, 0.85rem)",
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center" as const,
            lineHeight: 1.4,
            minHeight: "2.4em",
        },
        variantInfo: {
            display: "flex",
            gap: "0.5rem",
            fontSize: "clamp(0.65rem, 2.5vw, 0.8rem)",
            color: "#ddd",
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
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            fontSize: "0.7rem",
            color: "#FFD700",
            letterSpacing: "0.04em",
        },
        productImage: {
            width: "100%",
            maxWidth: "180px",
            height: "auto",
            aspectRatio: "1",
            objectFit: "contain" as const,
            borderRadius: "12px",
            filter: "drop-shadow(0 18px 28px rgba(0, 0, 0, 0.45))",
        },
        productImagePlaceholder: {
            width: "min(52vw, 180px)",
            aspectRatio: "1",
            borderRadius: "14px",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
            background: "linear-gradient(140deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.35))",
            display: "grid",
            placeItems: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "0.75rem",
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
        },
        price: {
            color: "#FFD700",
            fontSize: "clamp(1.1rem, 4.5vw, 1.5rem)",
            fontWeight: "bold",
            marginTop: "0.5rem",
        },
        emptyState: {
            gridColumn: "1 / -1",
            background: "rgba(0, 0, 0, 0.55)",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center" as const,
            border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        emptyTitle: {
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#FFD700",
            letterSpacing: "0.05em",
        },
        emptySubtitle: {
            marginTop: "0.5rem",
            fontSize: "0.85rem",
            color: "rgba(255, 255, 255, 0.75)",
        },
        footer: {
            position: "fixed" as const,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#FFD700",
            padding: "clamp(0.75rem, 3vw, 1rem)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 100,
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
        },
        actionButton: {
            background: "rgba(0, 0, 0, 0.2)",
            border: "2px solid rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            padding: "clamp(0.6rem, 3vw, 0.8rem) clamp(1rem, 4vw, 1.5rem)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "0.25rem",
            flex: 1,
            maxWidth: "120px",
            transition: "all 0.3s ease",
        },
        buttonIcon: {
            fontSize: "clamp(1.2rem, 5vw, 1.5rem)",
            color: "#000",
        },
        buttonText: {
            fontSize: "clamp(0.65rem, 2.5vw, 0.8rem)",
            fontWeight: "bold",
            color: "#000",
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
        },
    }

    return (
        <RequireAuth>
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
                            onClick={() => router.push("/menu")}
                        >
                            <div style={styles.backArrow} />
                        </motion.button>

                        <h1 style={styles.title}>{categoryName.toUpperCase()}</h1>
                    </motion.header>

                    {menuLoading && <div style={styles.statusCard}>Cargando platos...</div>}
                    {menuError && <div style={styles.statusError}>{menuError}</div>}

                    <div style={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Buscar plato o ingrediente..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

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
                                        backgroundColor: "rgba(30, 30, 30, 0.9)",
                                        borderColor: "rgba(255, 215, 0, 0.5)",
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        router.push(`/menu/burgers/${dish.id}?category=${encodeURIComponent(categoryId)}`)
                                    }
                                >
                                    <h3 style={styles.productName}>{dish.nombre}</h3>
                                    <p style={styles.productIngredients}>{dish.ingredientes}</p>
                                    <div style={styles.productImageWrapper}>
                                        {dish.foto_url ? (
                                            <img
                                                src={dish.foto_url}
                                                alt={dish.nombre || "Foto del plato"}
                                                style={styles.productImage}
                                            />
                                        ) : (
                                            <div style={styles.productImagePlaceholder}>Sin foto</div>
                                        )}
                                    </div>
                                    <p style={styles.price}>${dish.precio.toFixed(2)}</p>
                                </motion.div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                <p style={styles.emptyTitle}>Sin coincidencias</p>
                                <p style={styles.emptySubtitle}>Agrega platos o ajusta la búsqueda.</p>
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
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderColor: "rgba(0, 0, 0, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearch}
                    >
                        <div style={styles.buttonIcon}>🔍</div>
                        <span style={styles.buttonText}>Buscar</span>
                    </motion.button>

                    <motion.button
                        style={styles.actionButton}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderColor: "rgba(0, 0, 0, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFilter}
                    >
                        <div style={styles.buttonIcon}>🎚️</div>
                        <span style={styles.buttonText}>Filtrar</span>
                    </motion.button>

                    <motion.button
                        style={styles.actionButton}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderColor: "rgba(0, 0, 0, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShare}
                    >
                        <div style={styles.buttonIcon}>📤</div>
                        <span style={styles.buttonText}>Compartir</span>
                    </motion.button>
                </motion.footer>
            </div>
        </RequireAuth>
    )
}






