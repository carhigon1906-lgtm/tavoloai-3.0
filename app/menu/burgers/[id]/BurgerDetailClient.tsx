"use client"

import { motion } from "framer-motion"
import Image, { type StaticImageData } from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import fourMeatRegular from "@/public/4-meat-burger-with-regular-bun.jpg"
import burgerOnionRegular from "@/public/burger-with-onion-rings-regular-bun.jpg"
import crispyBaconRegular from "@/public/crispy-bacon-burger-regular-bun.jpg"
import tripleBbqBeef from "@/public/triple-bbq-ribs-burger-with-beef.jpg"

const MotionImage = motion(Image)

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

type Burger = {
    id: string
    name: string
    tagline: string
    description: string
    price: string
    image: StaticImageData
    ingredients: Ingredient[]
}

const burgers: Burger[] = [
    {
        id: "1",
        name: "Triple BBQ Ribs",
        tagline: "BBQ Power!",
        description:
            "Tres jugosas carnes bañadas en salsa BBQ ahumada, queso mozzarella fundido y cebolla caramelizada.",
        price: "$40.000",
        image: tripleBbqBeef,
        ingredients: [
            {
                label: "3 Carnes de Res",
                sublabel: "16.910 gr",
                position: { top: "-6%", left: "-12%" },
                lineStart: { x: 62, y: 58 },
                lineEnd: { x: 178, y: 176 },
                mobilePosition: { top: "6%", left: "4%" },
                mobileLineStart: { x: 74, y: 78 },
                mobileLineEnd: { x: 190, y: 210 },
                lineDashed: false,
            },
            {
                label: "Queso",
                sublabel: "Mozzarella",
                position: { top: "26%", left: "-14%" },
                lineStart: { x: 58, y: 188 },
                lineEnd: { x: 190, y: 236 },
                mobilePosition: { top: "44%", left: "6%" },
                mobileLineStart: { x: 86, y: 248 },
                mobileLineEnd: { x: 198, y: 266 },
                lineDashed: false,
            },
            {
                label: "210 gr de Carne",
                sublabel: "Desmechada bañada en salsa BBQ",
                position: { top: "-14%", left: "50%", transform: "translateX(-50%)" },
                lineStart: { x: 225, y: 32 },
                lineEnd: { x: 225, y: 162 },
                mobilePosition: { top: "-10%", left: "50%", transform: "translateX(-50%)" },
                mobileLineStart: { x: 225, y: 38 },
                mobileLineEnd: { x: 225, y: 170 },
                lineDashed: true,
            },
            {
                label: "Salsa",
                sublabel: "Cheddar",
                position: { bottom: "18%", right: "-12%" },
                lineStart: { x: 384, y: 260 },
                lineEnd: { x: 270, y: 250 },
                mobilePosition: { bottom: "20%", right: "6%" },
                mobileLineStart: { x: 360, y: 286 },
                mobileLineEnd: { x: 284, y: 260 },
                lineDashed: false,
            },
            {
                label: "Cebolla",
                sublabel: "Caramelizada",
                position: { top: "-2%", right: "-14%" },
                lineStart: { x: 384, y: 70 },
                lineEnd: { x: 276, y: 188 },
                mobilePosition: { top: "10%", right: "6%" },
                mobileLineStart: { x: 370, y: 92 },
                mobileLineEnd: { x: 284, y: 204 },
                lineDashed: true,
            },
        ],
    },
    {
        id: "2",
        name: "4 Carnes",
        tagline: "Cuádruple Sabor!",
        description: "Cuatro capas de carne premium con quesos selectos y vegetales frescos.",
        price: "$40.000",
        image: fourMeatRegular,
        ingredients: [
            {
                label: "4 Carnes",
                sublabel: "Premium",
                position: { top: "-8%", left: "-12%" },
                lineStart: { x: 68, y: 54 },
                lineEnd: { x: 182, y: 182 },
                mobilePosition: { top: "6%", left: "6%" },
                mobileLineStart: { x: 84, y: 90 },
                mobileLineEnd: { x: 194, y: 212 },
                lineDashed: false,
            },
            {
                label: "Queso",
                sublabel: "Fundido",
                position: { top: "-18%", left: "50%", transform: "translateX(-50%)" },
                lineStart: { x: 225, y: 28 },
                lineEnd: { x: 225, y: 162 },
                mobilePosition: { top: "-12%", left: "50%", transform: "translateX(-50%)" },
                mobileLineStart: { x: 225, y: 34 },
                mobileLineEnd: { x: 225, y: 178 },
                lineDashed: true,
            },
            {
                label: "Vegetales",
                sublabel: "Frescos",
                position: { top: "6%", right: "-14%" },
                lineStart: { x: 374, y: 78 },
                lineEnd: { x: 262, y: 206 },
                mobilePosition: { top: "28%", right: "6%" },
                mobileLineStart: { x: 360, y: 198 },
                mobileLineEnd: { x: 276, y: 230 },
                lineDashed: false,
            },
            {
                label: "Salsa",
                sublabel: "Especial",
                position: { bottom: "14%", right: "-12%" },
                lineStart: { x: 372, y: 312 },
                lineEnd: { x: 268, y: 244 },
                mobilePosition: { bottom: "18%", right: "6%" },
                mobileLineStart: { x: 360, y: 320 },
                mobileLineEnd: { x: 280, y: 256 },
                lineDashed: true,
            },
        ],
    },
    {
        id: "3",
        name: "Onion Rings",
        tagline: "Crujiente Delicia!",
        description: "Carne 100% res con aros de cebolla dorados y crujientes.",
        price: "$26.000",
        image: burgerOnionRegular,
        ingredients: [
            {
                label: "100% Res",
                sublabel: "Premium",
                position: { top: "-6%", left: "-12%" },
                lineStart: { x: 66, y: 60 },
                lineEnd: { x: 184, y: 184 },
                mobilePosition: { top: "6%", left: "6%" },
                mobileLineStart: { x: 84, y: 90 },
                mobileLineEnd: { x: 194, y: 212 },
                lineDashed: false,
            },
            {
                label: "Onion Rings",
                sublabel: "Crujientes",
                position: { top: "-14%", right: "-12%" },
                lineStart: { x: 380, y: 48 },
                lineEnd: { x: 270, y: 178 },
                mobilePosition: { top: "-10%", right: "6%" },
                mobileLineStart: { x: 366, y: 68 },
                mobileLineEnd: { x: 276, y: 198 },
                lineDashed: true,
            },
            {
                label: "Vegetales",
                sublabel: "Frescos",
                position: { bottom: "14%", left: "-12%" },
                lineStart: { x: 88, y: 320 },
                lineEnd: { x: 200, y: 250 },
                mobilePosition: { bottom: "16%", left: "6%" },
                mobileLineStart: { x: 104, y: 320 },
                mobileLineEnd: { x: 208, y: 252 },
                lineDashed: false,
            },
        ],
    },
    {
        id: "4",
        name: "Crispy Bacon",
        tagline: "Bacon Perfecto!",
        description: "Carne premium coronada con bacon extra crujiente y queso fundido.",
        price: "$28.000",
        image: crispyBaconRegular,
        ingredients: [
            {
                label: "100% Res",
                sublabel: "Premium",
                position: { top: "-6%", left: "-12%" },
                lineStart: { x: 66, y: 60 },
                lineEnd: { x: 184, y: 186 },
                mobilePosition: { top: "6%", left: "6%" },
                mobileLineStart: { x: 84, y: 90 },
                mobileLineEnd: { x: 196, y: 214 },
                lineDashed: false,
            },
            {
                label: "Bacon",
                sublabel: "Extra Crujiente",
                position: { top: "-14%", right: "-12%" },
                lineStart: { x: 382, y: 50 },
                lineEnd: { x: 272, y: 180 },
                mobilePosition: { top: "-10%", right: "6%" },
                mobileLineStart: { x: 372, y: 70 },
                mobileLineEnd: { x: 284, y: 202 },
                lineDashed: true,
            },
            {
                label: "Queso",
                sublabel: "Fundido",
                position: { bottom: "16%", left: "-10%" },
                lineStart: { x: 110, y: 320 },
                lineEnd: { x: 212, y: 248 },
                mobilePosition: { bottom: "18%", left: "8%" },
                mobileLineStart: { x: 128, y: 320 },
                mobileLineEnd: { x: 220, y: 254 },
                lineDashed: false,
            },
        ],
    },
]

const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#000",
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
        backgroundColor: "rgba(0, 0, 0, 0.88)",
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
        borderRight: "20px solid #FFD700",
    },
    mainContent: {
        padding: "clamp(1rem, 4vw, 2rem)",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "clamp(1.5rem, 4vw, 2rem)",
    },
    title: {
        color: "#fff",
        fontSize: "clamp(2.5rem, 10vw, 4rem)",
        fontWeight: "bold",
        fontStyle: "italic",
        textAlign: "center" as const,
        fontFamily: "'Brush Script MT', cursive",
        marginBottom: "0.5rem",
        textShadow: "0 4px 20px rgba(255, 215, 0, 0.5)",
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
        filter: "drop-shadow(0 10px 30px rgba(255, 215, 0, 0.4))",
        position: "relative" as const,
        zIndex: 2,
    },
    ingredient: {
        position: "absolute" as const,
        color: "#fff",
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
        boxShadow: "0 0 0 12px rgba(0, 0, 0, 0)",
        backgroundColor: "transparent",
        fontSize: "clamp(0.75rem, 2.6vw, 0.95rem)",
        lineHeight: 1.2,
        textShadow: "0 0 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)",
    },
    ingredientLabel: {
        fontWeight: 700,
        color: "#FFD700",
        fontSize: "clamp(0.85rem, 2.8vw, 1.1rem)",
        letterSpacing: "0.6px",
        textTransform: "uppercase" as const,
        lineHeight: 1.1,
        textShadow: "0 0 6px rgba(0, 0, 0, 1), 0 2px 4px rgba(0, 0, 0, 0.8)",
    },
    ingredientSublabel: {
        fontSize: "clamp(0.7rem, 2.3vw, 0.9rem)",
        color: "#fff",
        fontWeight: 500,
        letterSpacing: "0.3px",
        lineHeight: 1.1,
        textShadow: "0 0 6px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.7)",
    },
    tagline: {
        color: "#FFD700",
        fontSize: "clamp(1.5rem, 6vw, 2.2rem)",
        fontWeight: "bold",
        fontStyle: "italic",
        textAlign: "center" as const,
        marginTop: "-1rem",
        textShadow: "0 2px 10px rgba(255, 215, 0, 0.5)",
    },
    description: {
        color: "#e8e8e8",
        fontSize: "clamp(1rem, 4vw, 1.25rem)",
        lineHeight: "1.7",
        textAlign: "center" as const,
        maxWidth: "500px",
        padding: "0 1.5rem",
        fontStyle: "italic",
        fontWeight: 300,
        letterSpacing: "0.3px",
    },
    price: {
        color: "#FFD700",
        fontSize: "clamp(3rem, 12vw, 4.5rem)",
        fontWeight: 900,
        textAlign: "center" as const,
        marginTop: "1.5rem",
        textShadow: "0 4px 20px rgba(255, 215, 0, 0.6)",
        letterSpacing: "2px",
    },
    footer: {
        position: "fixed" as const,
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
        padding: "clamp(1.25rem, 5vw, 2rem)",
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        zIndex: 100,
        boxShadow: "0 -6px 30px rgba(0, 0, 0, 0.4)",
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
        color: "#000",
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
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
    },
    shareButton: {
        background: "rgba(0, 0, 0, 0.15)",
        border: "2px solid rgba(0, 0, 0, 0.25)",
        borderRadius: "50%",
        width: "clamp(3.5rem, 15vw, 4.5rem)",
        height: "clamp(3.5rem, 15vw, 4.5rem)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    },
    shareIcon: {
        fontSize: "clamp(1.8rem, 7vw, 2.5rem)",
    },
}

interface BurgerDetailClientProps {
    burgerId?: string
}

export default function BurgerDetailClient({ burgerId }: BurgerDetailClientProps) {
    const router = useRouter()

    const [currentBurger, setCurrentBurger] = useState<Burger | null>(null)
    const [rating, setRating] = useState(0)
    const [hoveredStar, setHoveredStar] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    // Seleccionar burger según el id de la URL
    useEffect(() => {
        if (!burgerId) {
            setCurrentBurger(burgers[0] ?? null)
            return
        }

        const found = burgers.find((burger) => burger.id === burgerId) ?? null

        if (!found) {
            router.replace("/menu/burgers")
            return
        }

        setCurrentBurger(found)
    }, [burgerId, router])

    // Detectar viewport móvil
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

    if (!currentBurger) {
        return null
    }

    const handleStarClick = (starIndex: number) => {
        setRating(starIndex)
    }

    const handleShare = async () => {
        console.log("[v0] Share burger:", currentBurger.name)

        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({
                    title: currentBurger.name,
                    text: currentBurger.description,
                    url: window.location.href,
                })
                return
            } catch (error) {
                console.error("Error al compartir la hamburguesa:", error)
            }
        }

        if (typeof window !== "undefined") {
            window.alert("La función de compartir no está disponible en este dispositivo.")
        }
    }

    const activeStars = hoveredStar || rating

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
                        onClick={() => router.push("/menu/burgers")}
                    >
                        <div style={styles.backArrow} />
                    </motion.button>
                </motion.header>

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
                        {currentBurger.name}
                    </motion.h1>

                    <motion.div
                        style={styles.burgerImageContainer}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        <svg style={styles.svgContainer} viewBox="0 0 450 450" preserveAspectRatio="xMidYMid meet">
                            {currentBurger.ingredients.map((ingredient, index) => {
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
                                        stroke="rgba(255, 215, 0, 0.7)"
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

                        <MotionImage
                            src={currentBurger.image}
                            alt={currentBurger.name}
                            style={styles.burgerImage}
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                                duration: 3,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                            }}
                        />

                        {currentBurger.ingredients.map((ingredient, index) => {
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
                                        <div style={styles.ingredientSublabel}>{ingredient.sublabel}</div>
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
                        {currentBurger.tagline}
                    </motion.p>

                    <motion.p
                        style={styles.description}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                    >
                        {currentBurger.description}
                    </motion.p>

                    <motion.div
                        style={styles.price}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1 }}
                    >
                        {currentBurger.price}
                    </motion.div>
                </motion.div>
            </div>

            <motion.footer
                style={styles.footer}
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <div style={styles.ratingContainer}>
                    <span style={styles.ratingLabel}>Calificar</span>
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
                                                "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                                                "drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))",
                                                "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                                            ],
                                        }
                                        : {}
                                }
                                transition={{ duration: 0.5 }}
                                onMouseEnter={() => setHoveredStar(starIndex)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => handleStarClick(starIndex)}
                            >
                                {starIndex <= activeStars ? "⭐" : "☆"}
                            </motion.span>
                        ))}
                    </div>
                </div>

                <motion.button
                    style={styles.shareButton}
                    whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(0, 0, 0, 0.25)",
                        rotate: [0, -5, 5, 0],
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                >
                    <span style={styles.shareIcon}>📤</span>
                </motion.button>
            </motion.footer>
        </div>
    )
}
