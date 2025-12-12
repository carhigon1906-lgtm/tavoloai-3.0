"use client";
// @ts-nocheck

import { motion } from "framer-motion"
import Image, { StaticImageData } from "next/image"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export const dynamic = "force-dynamic"


import fourMeatPlantain from "@/public/4-meat-burger-with-plantain-bun.jpg"
import fourMeatRegular from "@/public/4-meat-burger-with-regular-bun.jpg"
import burgerOnionPlantain from "@/public/burger-with-onion-rings-plantain-bun.jpg"
import burgerOnionRegular from "@/public/burger-with-onion-rings-regular-bun.jpg"
import crispyBaconPlantain from "@/public/crispy-bacon-burger-plantain-bun.jpg"
import crispyBaconRegular from "@/public/crispy-bacon-burger-regular-bun.jpg"
import tripleBbqBeef from "@/public/triple-bbq-ribs-burger-with-beef.jpg"
import tripleBbqPlantain from "@/public/triple-bbq-ribs-burger-with-plantain-bun.jpg"

const MotionImage = motion(Image)
const MotionButton = motion.button

const dietaryFilters = [
    { id: "gluten-free", label: "Sin gluten", helper: "Bases sin harina o con patacon", icon: "🌾🚫" },
    { id: "veg-friendly", label: "Veg-friendly", helper: "Ingredientes plant-based o veggies", icon: "🥬" },
    { id: "protein-plus", label: "Proteína extra", helper: "Perfectos para subir macros", icon: "💪" },
] as const
type ProductVariant = {
    type: string
    location: string
    price: string
    image: StaticImageData
}
type Product = {
    id: string
    name: string
    tags: string[]
    variants: ProductVariant[]
}

export default function BurgersPage() {
    const router = useRouter()

    const products = useMemo<Product[]>(
        () => [
            {
                id: "1",
                name: "Triple BBQ Ribs",
                tags: ["protein-plus", "gluten-free"],
                variants: [
                    { type: "100% Res", location: "Stop24", price: "$40.000", image: tripleBbqBeef },
                    { type: "100% Res", location: "Patacon", price: "$41.000", image: tripleBbqPlantain },
                ],
            },
            {
                id: "2",
                name: "4 Carnes",
                tags: ["protein-plus", "gluten-free"],
                variants: [
                    { type: "", location: "Stop24", price: "$40.000", image: fourMeatRegular },
                    { type: "", location: "Patacon", price: "$41.000", image: fourMeatPlantain },
                ],
            },
            {
                id: "3",
                name: "Onion Rings",
                tags: ["veg-friendly", "gluten-free"],
                variants: [
                    { type: "100% Res", location: "Stop 24", price: "$26.000", image: burgerOnionRegular },
                    { type: "100% Res", location: "Patacon", price: "$27.000", image: burgerOnionPlantain },
                ],
            },
            {
                id: "4",
                name: "Crispy Bacon",
                tags: ["protein-plus"],
                variants: [
                    { type: "100% Res", location: "Stop24", price: "$28.000", image: crispyBaconRegular },
                    { type: "100% Res", location: "Patacon", price: "$29.000", image: crispyBaconPlantain },
                ],
            },
        ],
        []
    )

    const [searchQuery, setSearchQuery] = useState("")
    const [activeDietaryFilters, setActiveDietaryFilters] = useState<string[]>([])
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false)

    const dietaryFilterLookup = useMemo(
        () => Object.fromEntries(dietaryFilters.map((filter) => [filter.id, filter])),
        []
    )

    const filteredProducts = useMemo(() => {
        let result = products

        if (activeDietaryFilters.length > 0) {
            result = result.filter((product) =>
                activeDietaryFilters.every((filterId) => product.tags.includes(filterId))
            )
        }

        const trimmedQuery = searchQuery.trim().toLowerCase()
        if (trimmedQuery.length > 0) {
            result = result.filter((product) => {
                if (product.name.toLowerCase().includes(trimmedQuery)) return true

                if (product.tags.some((tag) => tag.toLowerCase().includes(trimmedQuery))) return true

                if (
                    product.variants.some(
                        (variant) =>
                            variant.type.toLowerCase().includes(trimmedQuery) ||
                            variant.location.toLowerCase().includes(trimmedQuery),
                    )
                ) {
                    return true
                }

                return false
            })
        }

        return result
    }, [activeDietaryFilters, products, searchQuery])

    const hasActiveFilters = activeDietaryFilters.length > 0
    const hasResults = filteredProducts.length > 0

    const activeFilterSummary = hasActiveFilters
        ? activeDietaryFilters
            .map((filterId) => dietaryFilterLookup[filterId]?.label ?? filterId)
            .join(" + ")
        : ""

    const toggleDietaryFilter = (filterId: string) => {
        setActiveDietaryFilters((prev) =>
            prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
        )
    }

    const clearDietaryFilters = () => {
        setActiveDietaryFilters([])
    }

    const handleSearch = () => {
        console.log("[v0] Search button clicked")
    }

    const handleFilter = () => {
        setIsFilterBarOpen((prev) => !prev)
    }

    const handleShare = () => {
        console.log("[v0] Share button clicked")
    }

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
        productsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(0.5rem, 2vw, 1rem)",
            padding: "clamp(0.5rem, 3vw, 1rem)",
            maxWidth: "100%",
        },
        productCard: {
            backgroundColor: "rgba(20, 20, 20, 0.8)",
            borderRadius: "12px",
            padding: "clamp(0.75rem, 3vw, 1rem)",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "clamp(0.5rem, 2vw, 0.75rem)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },
        productName: {
            color: "#fff",
            fontSize: "clamp(1rem, 4vw, 1.3rem)",
            fontWeight: "bold",
            fontStyle: "italic",
            textAlign: "center" as const,
            marginBottom: "0.25rem",
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
            objectFit: "cover" as const,
            borderRadius: "8px",
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

                    <h1 style={styles.title}>LAS PROPIAS BURGERS</h1>
                </motion.header>

                {isFilterBarOpen && (
                    <motion.div
                        style={styles.filterModalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setIsFilterBarOpen(false)}
                    >
                        <motion.div
                            style={styles.filterModalCard}
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div style={styles.filterModalHeader}>
                                <span style={styles.filterModalTitle}>Filtros</span>
                                <button
                                    type="button"
                                    style={styles.filterModalClose}
                                    onClick={() => setIsFilterBarOpen(false)}
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div style={styles.filterBar}>
                                {dietaryFilters.map((filter) => {
                                    const isActive = activeDietaryFilters.includes(filter.id)
                                    return (
                                        <MotionButton
                                            key={filter.id}
                                            type="button"
                                            style={{
                                                ...styles.filterChip,
                                                ...(isActive ? styles.filterChipActive : {}),
                                            }}
                                            onClick={() => toggleDietaryFilter(filter.id)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span style={styles.filterChipIcon}>{filter.icon}</span>
                                            <span style={styles.filterChipCopy}>
                                                <span style={styles.filterChipLabel}>
                                                    {filter.label}
                                                </span>
                                                <span style={styles.filterChipHelper}>
                                                    {filter.helper}
                                                </span>
                                            </span>
                                        </MotionButton>
                                    )
                                })}
                                {hasActiveFilters && (
                                    <MotionButton
                                        key="clear-filters"
                                        type="button"
                                        style={styles.filterReset}
                                        onClick={clearDietaryFilters}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.94 }}
                                    >
                                        Limpiar
                                    </MotionButton>
                                )}
                            </div>

                            <div style={styles.filterModalActions}>
                                <button
                                    type="button"
                                    style={styles.filterModalApply}
                                    onClick={() => setIsFilterBarOpen(false)}
                                >
                                    Listo
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {hasActiveFilters && (
                    <motion.span
                        style={styles.filterSummary}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        Filtrando: {activeFilterSummary}
                    </motion.span>
                )}

                <div style={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Buscar burger o local..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                <div style={styles.productsGrid}>
                    {hasResults ? (
                        filteredProducts.map((product, productIndex) =>
                            product.variants.map((variant, variantIndex) => (
                                <motion.div
                                    key={`${product.id}-${variantIndex}`}
                                    style={styles.productCard}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: (productIndex * 2 + variantIndex) * 0.1,
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(30, 30, 30, 0.9)",
                                        borderColor: "rgba(255, 215, 0, 0.5)",
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(`/menu/burgers/${product.id}`)}
                                >
                                    <div style={styles.productTags}>
                                        {product.tags.map((tag) => (
                                            <span key={tag} style={styles.tagPill}>
                                                <span>{dietaryFilterLookup[tag]?.icon ?? "⭐"}</span>
                                                <span>{dietaryFilterLookup[tag]?.label ?? tag}</span>
                                            </span>
                                        ))}
                                    </div>

                                    <h3 style={styles.productName}>{product.name}</h3>

                                    <div style={styles.variantInfo}>
                                        {variant.type && <span>{variant.type}</span>}
                                        <span>{variant.location}</span>
                                    </div>

                                    <MotionImage
                                        src={variant.image}
                                        alt={`${product.name} - ${variant.location}`}
                                        style={styles.productImage}
                                        whileHover={{ scale: 1.1, rotate: 2 }}
                                        transition={{ duration: 0.3 }}
                                    />

                                    <p style={styles.price}>{variant.price}</p>
                                </motion.div>
                            )),
                        )
                    ) : (
                        <div style={styles.emptyState}>
                            <p style={styles.emptyTitle}>Sin coincidencias</p>
                            <p style={styles.emptySubtitle}>Ajusta los filtros para ver más opciones.</p>
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
                    <div style={styles.buttonIcon}>⚙️</div>
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
    )
}





