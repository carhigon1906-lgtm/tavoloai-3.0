// @ts-nocheck
"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { StaticImageData } from "next/image"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import RequireAuth from "@/components/guards/RequireAuth"
import { useRouter } from "next/navigation"

import tavoloLogo from "@/public/logo.png"
import logoBlanco from "@/public/logoblanco.png"
import fourMeatPlantain from "@/public/4-meat-burger-with-plantain-bun-removebg-preview.png"
import fourMeatRegular from "@/public/4-meat-burger-with-regular-bun-removebg-preview.png"
import burgerOnionPlantain from "@/public/burger-with-onion-rings-plantain-bun-removebg-preview.png"
import burgerOnionRegular from "@/public/burger-with-onion-rings-regular-bun-removebg-preview.png"
import crispyBaconPlantain from "@/public/crispy-bacon-burger-plantain-bun-removebg-preview (1).png"
import crispyBaconRegular from "@/public/crispy-bacon-burger-regular-bun-removebg-preview.png"
import tripleBbqBeef from "@/public/triple-bbq-ribs-burger-with-beef-removebg-preview.png"
import tripleBbqPlantain from "@/public/triple-bbq-ribs-burger-with-plantain-bun-removebg-preview.png"

const carouselImages: { id: string; alt: string; image: StaticImageData; tags: string[] }[] = [
    {
        id: "triple-bbq-beef",
        alt: "Triple BBQ Ribs burger",
        image: tripleBbqBeef,
        tags: ["protein-plus"],
    },
    { id: "triple-bbq-plantain", alt: "Triple BBQ Ribs burger with patacón", image: tripleBbqPlantain },
    { id: "four-meat-regular", alt: "4 Carnes burger", image: fourMeatRegular },
    { id: "four-meat-plantain", alt: "4 Carnes burger with patacón", image: fourMeatPlantain },
    { id: "onion-rings-regular", alt: "Onion Rings burger", image: burgerOnionRegular },
    { id: "onion-rings-plantain", alt: "Onion Rings burger with patacón", image: burgerOnionPlantain },
    { id: "crispy-bacon-regular", alt: "Crispy Bacon burger", image: crispyBaconRegular },
    { id: "crispy-bacon-plantain", alt: "Crispy Bacon burger with patacón", image: crispyBaconPlantain },
]

const MotionImage = motion(Image)
const MotionButton = motion.button
const MotionBox = motion.div

type Dish = {
    id: number | string
    nombre: string
    ingredientes: string
    precio: number
}

type Category = {
    id: number | string
    nombre: string
    platos: Dish[]
}

const iconForCategory = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes("burger")) return "🍔"
    if (n.includes("pizza")) return "🍕"
    if (n.includes("artesan")) return "🥖"
    if (n.includes("smooth")) return "🍹"
    if (n.includes("soda") || n.includes("bebida")) return "🥤"
    if (n.includes("special") || n.includes("especial")) return "🍽️"
    return "🍽️"
}

export default function HomePage() {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const prefersReducedMotion = useReducedMotion()
    const [isMobileViewport, setIsMobileViewport] = useState(false)
    const [showIntro, setShowIntro] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [menuData, setMenuData] = useState<{ logo_url?: string; categories: Category[] }>({
        logo_url: "",
        categories: [],
    })
    const [menuLoading, setMenuLoading] = useState(true)
    const [menuError, setMenuError] = useState("")

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategory(categoryId)
        router.push(`/menu/burgers?category=${encodeURIComponent(categoryId)}`)
    }

    useEffect(() => {
        if (prefersReducedMotion) {
            setShowIntro(false)
            return undefined
        }

        setShowIntro(true)

        const introTimer = setTimeout(() => {
            setShowIntro(false)
        }, 2200)

        const interval = setInterval(() => {
            setActiveImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
        }, 4200)

        return () => {
            clearTimeout(introTimer)
            clearInterval(interval)
        }
    }, [prefersReducedMotion])

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
                .select("logo_url, categories")
                .eq("user_id", session.user.id)
                .maybeSingle()

            if (error) {
                setMenuError("No pudimos cargar tu menú.")
                setMenuLoading(false)
                return
            }

            if (data && Array.isArray(data.categories)) {
                setMenuData({ logo_url: data.logo_url || "", categories: data.categories })
            }
            setMenuLoading(false)
        }

        loadMenu()
    }, [])

    useEffect(() => {
        const updateViewportFlag = () => {
            if (typeof window === "undefined") return
            setIsMobileViewport(window.matchMedia("(max-width: 768px)").matches)
        }

        updateViewportFlag()
        window.addEventListener("resize", updateViewportFlag)
        return () => window.removeEventListener("resize", updateViewportFlag)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    }

    const effectiveCategories = useMemo(() => {
        if (menuData.categories.length === 0) return []
        return menuData.categories.map((cat) => ({
            id: String(cat.id),
            name: cat.nombre.toUpperCase(),
            icon: iconForCategory(cat.nombre),
            platos: cat.platos,
        }))
    }, [menuData.categories])

    const filteredCategories = effectiveCategories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const selectedCategoryData = effectiveCategories.find((category) => category.id === selectedCategory)

    useEffect(() => {
        if (prefersReducedMotion) {
            setShowIntro(false)
            return
        }
    }, [prefersReducedMotion])

    return (
        <RequireAuth>
            <>
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        key="intro-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        style={styles.introOverlay}
                    >
                        <motion.div
                            style={styles.introBackdrop}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                        <motion.div
                            style={styles.introContent}
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.94, opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <motion.div
                                style={styles.introBadgeWrapper}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12, duration: 0.5, ease: "easeOut" }}
                            >
                                <motion.div
                                    style={styles.introBadgeHalo}
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                                />
                                <motion.div
                                    style={styles.introBadge}
                                    initial={{ scale: 0.9, rotate: -8 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
                                >
                                    <MotionImage
                                        src={tavoloLogo}
                                        alt="Taboloai logo"
                                        style={styles.introBadgeImage}
                                        width={160}
                                        height={160}
                                        priority
                                        initial={{ scale: 0.92, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.18, duration: 0.45, ease: "easeOut" }}
                                    />
                                </motion.div>
                            </motion.div>
                            <motion.h1
                                style={styles.introTitle}
                                initial={{ y: 24, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.28, duration: 0.45, ease: "easeOut" }}
                            >
                                Taboloai
                            </motion.h1>
                            <motion.p
                                style={styles.introSubtitle}
                                initial={{ y: 24, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.45, ease: "easeOut" }}
                            >
                                Encendemos tu menú digital
                            </motion.p>
                            <motion.div
                                style={styles.introAccentBar}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.52, duration: 0.4, ease: "easeOut" }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                style={{
                    ...styles.container,
                    backgroundAttachment: isMobileViewport ? "scroll" : styles.container.backgroundAttachment,
                    opacity: showIntro ? 0 : 1,
                    transition: "opacity 0.35s ease-out",
                    pointerEvents: showIntro ? "none" : "auto",
                }}
            >
                <motion.div
                    style={styles.branding}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 120 }}
                >
                    {menuData.logo_url ? (
                        <img src={menuData.logo_url} alt="Logo del menú" style={styles.brandLogo} />
                    ) : (
                        <Image src={logoBlanco} alt="Taboloai" style={styles.brandLogo} />
                    )}
                    <span style={styles.brandTagline}>Menu inteligente para tu carta digital</span>
                    <MotionBox
                        style={styles.carouselWrapper}
                        initial={
                            prefersReducedMotion
                                ? { opacity: 1 }
                                : { opacity: 0.45, scale: 1.02 }
                        }
                        animate={
                            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 0.98 }
                        }
                        transition={{ duration: 0.55, ease: "easeOut" }}
                    >
                        <MotionImage
                            key={carouselImages[activeImageIndex].id}
                            src={carouselImages[activeImageIndex].image}
                            alt={carouselImages[activeImageIndex].alt}
                            fill
                            sizes="(max-width: 768px) 78vw, 340px"
                            style={styles.carouselImage}
                            initial={
                                prefersReducedMotion
                                    ? { opacity: 0.9 }
                                    : { opacity: 0.65 }
                            }
                            animate={
                                prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }
                            }
                            transition={{ duration: 0.55, ease: "easeOut" }}
                        />
                    </MotionBox>
                    <div style={styles.carouselDots}>
                        {carouselImages.map((image, index) => (
                            <span
                                key={image.id}
                                style={{
                                    ...styles.carouselDot,
                                    ...(index === activeImageIndex ? styles.carouselDotActive : {}),
                                }}
                            />
                        ))}
                    </div>
                </motion.div>

                <main style={styles.main}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 style={styles.title}>¿QUÉ TE LLEVAMOS?</h1>
                        <h2 style={styles.subtitle}>SELECCIONA UNA CATEGORÍA</h2>
                    </motion.div>

                    <motion.div
                        style={styles.searchWrapper}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <input
                            type="text"
                            placeholder="Buscar categoría..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            style={styles.searchInput}
                        />
                    </motion.div>

                    {menuLoading && <div style={styles.statusCard}>Cargando menú...</div>}
                    {menuError && <div style={styles.statusError}>{menuError}</div>}
                    {!menuLoading && !menuError && effectiveCategories.length === 0 && (
                        <div style={styles.statusCard}>Aún no tienes un menú creado.</div>
                    )}

                    <motion.div
                        style={styles.grid}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredCategories.map((category) => (
                            <MotionButton
                                key={category.id}
                                style={{
                                    ...styles.categoryCard,
                                    ...(selectedCategory === category.id ? styles.categoryCardSelected : {}),
                                }}
                                variants={itemVariants}
                                whileHover={
                                    prefersReducedMotion
                                        ? undefined
                                        : {
                                            scale: 1.04,
                                            boxShadow: '0 18px 32px rgba(255, 215, 0, 0.18)',
                                        }
                                }
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                                onClick={() => handleCategoryClick(category.id)}
                                type="button"
                            >
                                <motion.div
                                    style={styles.iconContainer}
                                    animate={
                                        prefersReducedMotion
                                            ? undefined
                                            : {
                                                rotate: selectedCategory === category.id ? 360 : 0,
                                            }
                                    }
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                >
                                    <span style={styles.icon}>{category.icon}</span>
                                </motion.div>
                                <span style={styles.categoryName}>{category.name}</span>
                            </MotionButton>
                        ))}
                    </motion.div>

                    {selectedCategoryData && (
                        <motion.div
                            style={styles.productsSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <h3 style={styles.productsTitle}>{selectedCategoryData.name}</h3>
                            <div style={styles.productsGrid}>
                                {selectedCategoryData.platos?.length ? (
                                    selectedCategoryData.platos.map((product: Dish) => (
                                        <motion.div
                                            key={product.id}
                                            style={styles.productCard}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <div style={styles.productInfo}>
                                                <span style={styles.productName}>{product.nombre}</span>
                                                <span style={styles.productPrice}>${product.precio.toFixed(2)}</span>
                                                <span style={styles.productIngredients}>{product.ingredientes}</span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={styles.emptyProducts}>No hay platos en esta categoría.</div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        style={styles.motivationText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        <motion.span
                            style={styles.motivationYellow}
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: 'reverse',
                            }}
                        >
                            ¡DALE!
                        </motion.span>{' '}
                        <span style={styles.motivationWhite}>SIN MIEDO</span>
                    </motion.div>
                </main>

                <motion.footer
                    style={styles.footer}
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                >
                    <div style={styles.footerContent}>
                        <div style={styles.orderInfo}>
                            <span style={styles.orderText}>Taboloai</span>
                            <span style={styles.orderSubtext}>Crea tu carta inteligente en minutos</span>
                        </div>
                        <motion.div
                            style={styles.cartIcon}
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.92 }}
                        >
                            <ShoppingBag size={28} strokeWidth={2.4} />
                        </motion.div>
                        <div style={styles.priceInfo}>
                            <span style={styles.priceAmount}>Menu inteligente con IA</span>
                            <span style={styles.priceText}>Personaliza ofertas y actualiza tu carta en tiempo real</span>
                        </div>
                    </div>
                </motion.footer>
            </div>
            </>
        </RequireAuth>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
    introOverlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    introBackdrop: {
        position: 'absolute',
        inset: 0,
        background:
            'radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.08), rgba(10, 10, 10, 0.95) 60%), linear-gradient(145deg, rgba(255, 0, 0, 0.12), rgba(255, 0, 0, 0))',
        filter: 'contrast(1.08)',
    },
    introContent: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem',
    },
    introBadgeWrapper: {
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        marginBottom: '0.35rem',
    },
    introBadgeHalo: {
        position: 'absolute',
        width: '168px',
        height: '168px',
        borderRadius: '9999px',
        background: 'radial-gradient(circle, rgba(255, 76, 76, 0.45) 0%, rgba(255, 76, 76, 0) 72%)',
        filter: 'blur(0.75px)',
    },
    introBadge: {
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        width: '176px',
        height: '176px',
        borderRadius: '42px',
        background: 'linear-gradient(145deg, rgba(255, 0, 0, 0.55), rgba(60, 0, 0, 0.65))',
        boxShadow: '0 28px 56px rgba(255, 0, 0, 0.32)',
        border: '4px solid rgba(255, 255, 255, 0.12)',
        padding: '0.9rem',
        overflow: 'hidden',
    },
    introBadgeImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: 'drop-shadow(0 16px 28px rgba(0, 0, 0, 0.45))',
    },
    introTitle: {
        fontSize: 'clamp(2.1rem, 9vw, 3.5rem)',
        fontWeight: 800,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: '#fff',
        textShadow: '0 10px 32px rgba(0, 0, 0, 0.6)',
    },
    introSubtitle: {
        fontSize: 'clamp(1rem, 3.4vw, 1.35rem)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: 'rgba(255, 255, 255, 0.82)',
        textShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
    },
    introAccentBar: {
        width: 'min(160px, 34vw)',
        height: '4px',
        background: 'linear-gradient(90deg, rgba(255, 76, 76, 0) 0%, rgba(255, 76, 76, 0.9) 45%, rgba(255, 76, 76, 0.1) 100%)',
        transformOrigin: 'center',
        borderRadius: '9999px',
    },
    container: {
        minHeight: '100vh',
        backgroundColor: '#000',
        backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0.9)), url("https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif',
    },
    branding: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem 1.5rem 0',
        textAlign: 'center',
    },
    brandName: {
        fontSize: 'clamp(2rem, 6vw, 3rem)',
        fontWeight: 800,
        letterSpacing: '0.35rem',
        textTransform: 'uppercase',
    },
    brandLogo: {
        width: 'min(140px, 42vw)',
        height: 'auto',
        objectFit: 'contain',
        filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.55))',
    },
    brandTagline: {
        fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
        color: '#FFD700',
        fontWeight: 500,
        letterSpacing: '0.12rem',
        textTransform: 'uppercase',
    },
    carouselWrapper: {
        width: 'min(70vw, 360px)',
        height: 'min(70vw, 360px)',
        position: 'relative',
        transformOrigin: 'center',
    },
    carouselImage: {
        objectFit: 'contain',
        objectPosition: 'center',
        filter: 'brightness(0.92)',
        transformOrigin: 'center',
    },
    carouselDots: {
        display: 'flex',
        gap: '0.4rem',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '0.85rem',
    },
    carouselDot: {
        width: '10px',
        height: '10px',
        borderRadius: '9999px',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        transition: 'background-color 0.3s ease',
    },
    carouselDotActive: {
        backgroundColor: '#FFD700',
    },
    main: {
        flex: 1,
        padding: '1rem 1.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '0 0 0.5rem',
        color: '#FFD700',
        textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
    },
    subtitle: {
        fontSize: 'clamp(1rem, 3vw, 1.3rem)',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '0 0 2rem',
        fontStyle: 'italic',
        textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
    },
    searchWrapper: {
        width: '100%',
        maxWidth: '820px',
        marginBottom: '1.5rem',
    },
    statusCard: {
        width: '100%',
        maxWidth: '820px',
        padding: '0.9rem 1.2rem',
        borderRadius: '16px',
        border: '1px dashed rgba(255, 255, 255, 0.25)',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    statusError: {
        width: '100%',
        maxWidth: '820px',
        padding: '0.9rem 1.2rem',
        borderRadius: '16px',
        border: '1px solid rgba(248, 113, 113, 0.5)',
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        color: 'rgba(254, 202, 202, 0.9)',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    searchInput: {
        width: '100%',
        padding: '0.7rem 1rem',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.4)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: 'clamp(0.75rem, 3vw, 1.1rem)',
        width: '100%',
        maxWidth: '820px',
        marginBottom: '2rem',
    },
    categoryCard: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.72) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '18px',
        padding: 'clamp(1.2rem, 4vw, 1.6rem) clamp(0.9rem, 3vw, 1.1rem)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem',
        cursor: 'pointer',
        minHeight: '160px',
        boxShadow: '0 12px 26px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden',
    },
    categoryCardSelected: {
        borderColor: '#FFD700',
        boxShadow: '0 18px 32px rgba(255, 215, 0, 0.22)',
        transform: 'translateY(-4px)',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.22) 0%, rgba(0, 0, 0, 0.75) 100%)',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '9999px',
        background: 'rgba(0, 0, 0, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
        fontSize: '1.9rem',
    },
    icon: {
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
    },
    categoryName: {
        fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
        fontWeight: 700,
        textAlign: 'center',
        letterSpacing: '1px',
    },
    productsSection: {
        width: '100%',
        maxWidth: '820px',
        marginBottom: '2rem',
    },
    productsTitle: {
        fontSize: '1.1rem',
        fontWeight: 700,
        letterSpacing: '0.12rem',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'clamp(0.75rem, 3vw, 1.1rem)',
    },
    productCard: {
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        padding: '0.75rem',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
    },
    productImageWrapper: {
        width: '100%',
        maxWidth: '160px',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
    },
    productInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
    },
    productName: {
        fontSize: '0.95rem',
        fontWeight: 600,
        textAlign: 'center',
    },
    productPrice: {
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#FFD700',
    },
    productIngredients: {
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 1.4,
    },
    emptyProducts: {
        width: '100%',
        padding: '1rem',
        borderRadius: '16px',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px dashed rgba(255, 255, 255, 0.2)',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.9rem',
    },
    motivationText: {
        fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 'auto',
    },
    motivationYellow: {
        color: '#FFD700',
        textShadow: '2px 2px 8px rgba(255, 215, 0, 0.5)',
    },
    motivationWhite: {
        color: '#fff',
        textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
    },
    footer: {
        backgroundColor: '#FFD700',
        padding: '1rem 1.5rem',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
    },
    footerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        gap: '1.5rem',
    },
    orderInfo: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '240px',
    },
    orderText: {
        fontSize: 'clamp(1rem, 3vw, 1.3rem)',
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: '0.15rem',
    },
    orderSubtext: {
        fontSize: 'clamp(0.75rem, 2.5vw, 0.95rem)',
        color: '#111',
        fontWeight: 600,
        letterSpacing: '0.05rem',
    },
    cartIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '3.25rem',
        height: '3.25rem',
        borderRadius: '9999px',
        backgroundColor: '#000',
        color: '#FFD700',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
    },
    priceInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        maxWidth: '240px',
    },
    priceAmount: {
        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'right',
        textTransform: 'uppercase',
        letterSpacing: '0.1rem',
    },
    priceText: {
        fontSize: 'clamp(0.75rem, 2.2vw, 0.95rem)',
        color: '#000',
        fontWeight: 600,
        textAlign: 'right',
    },
}

