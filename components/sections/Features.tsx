// @ts-nocheck
"use client"

import Image, { type StaticImageData } from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import fotosIaImage from "@/public/fotos-con-ia.webp"
import edicionImage from "@/public/edicion.webp"
import promocionImage from "@/public/promocion.png"
import ocultarImage from "@/public/ocultar.webp"
import filtrosImage from "@/public/filtros.webp"
import multiIdiomaImage from "@/public/multi-idioma.webp"
import { useTranslation } from "@/context/TranslationContext"

type FeatureSlide = {
  title: string
  badge: string
  description: string
  image?: StaticImageData
}

const featureImages: StaticImageData[] = [
  fotosIaImage,
  edicionImage,
  promocionImage,
  ocultarImage,
  filtrosImage,
  multiIdiomaImage,
]

const GRADIENT = "linear-gradient(135deg, rgba(8,8,10,0.95), rgba(3,3,4,0.95))"
const WRAPPER_SPRING = { type: "spring", stiffness: 90, damping: 16, mass: 0.6 }
const SLIDE_SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 24,
  mass: 0.45,
  restDelta: 0.001,
}

type Direction = 1 | -1

const slideVariants = {
  enter: (direction: Direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (direction: Direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
}

function modIndex(i: number, n: number) {
  return ((i % n) + n) % n
}

function FeatureImage({ src, alt, priority = false }: { src?: StaticImageData; alt?: string; priority?: boolean }) {
  if (!src) {
    return <div className="h-full w-full bg-neutral-800" aria-hidden="true" />
  }
  return (
    <Image
      src={src}
      alt={alt ?? "preview"}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 560px"
      placeholder={src.blurDataURL ? "blur" : undefined}
      priority={priority}
    />
  )
}

export default function SectionFeatures() {
  const { dictionary, t } = useTranslation()
  const translatedItems = dictionary.features.items
  const featureItems: FeatureSlide[] = useMemo(
    () =>
      translatedItems.map((item, index) => ({
        ...item,
        image: featureImages[index],
      })),
    [translatedItems],
  );

  const [currentIndex, setCurrentIndex] = useState(1)
  const [direction, setDirection] = useState<Direction>(1)
  const [magicActive, setMagicActive] = useState(false)
  const magicBoundsRef = useRef<DOMRect | null>(null)
  const magicLayerRef = useRef<HTMLDivElement | null>(null)
  const n = featureItems.length

  const currentSlide = featureItems[currentIndex]

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((p) => modIndex(p - 1, n))
  }, [n])

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((p) => modIndex(p + 1, n))
  }, [n])

  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return undefined

    const interval = setInterval(() => {
      handleNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused, handleNext])

  const handleMagicEnter = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    magicBoundsRef.current = event.currentTarget.getBoundingClientRect()
    setMagicActive(true)
  }, [])

  const handleMagicLeave = useCallback(() => {
    magicBoundsRef.current = null
    setMagicActive(false)
  }, [])

  const handleMagicMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = magicBoundsRef.current ?? event.currentTarget.getBoundingClientRect()
    magicBoundsRef.current = bounds
    const x = `${event.clientX - bounds.left}px`
    const y = `${event.clientY - bounds.top}px`

    if (magicLayerRef.current) {
      magicLayerRef.current.style.setProperty("--magic-x", x)
      magicLayerRef.current.style.setProperty("--magic-y", y)
    }
  }, [])

  return (
    <section id="features" className="relative overflow-hidden bg-black py-20 text-slate-100">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container mx-auto"
      >
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-2xl font-semibold text-white md:text-3xl"
        >
          {t("features.title")}
        </motion.h2>

        <div
          className="relative flex flex-col items-center px-4"
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
          onPointerDown={() => setIsPaused(true)}
          onPointerUp={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`feature-card-${currentIndex}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_SPRING}
              className="w-full max-w-5xl px-4 md:px-0"
            >
              <motion.div
                className="relative mx-auto w-full max-w-5xl overflow-visible rounded-[30px] p-[1px] min-h-[520px] md:h-[520px]"
                style={{ background: GRADIENT, boxShadow: "0 45px 120px rgba(0,0,0,0.85)" }}
                initial={false}
                whileHover={{ y: -6, boxShadow: "0 55px 140px rgba(0,0,0,0.95)" }}
                transition={WRAPPER_SPRING}
                onPointerMove={handleMagicMove}
                onPointerEnter={handleMagicEnter}
                onPointerLeave={handleMagicLeave}
              >
                {currentSlide?.image && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
                    <Image
                      src={currentSlide.image}
                      alt=""
                      fill
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      className="object-cover opacity-[0.18]"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/80 to-[#050505]/85" />
                  </div>
                )}

                <div
                  ref={magicLayerRef}
                  className="pointer-events-none absolute inset-0 rounded-[30px] transition-opacity duration-500 ease-out"
                  style={{
                    opacity: magicActive ? 1 : 0,
                    background:
                      "radial-gradient(520px at var(--magic-x, 50%) var(--magic-y, 50%), rgba(255,255,255,0.14), transparent 70%)",
                  }}
                />

                <div className="relative h-full overflow-hidden rounded-[26px] border border-white/10 bg-[#060607]/95 backdrop-blur-lg">
                  <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-br from-white/8 via-white/2 to-transparent" />

                  <div className="relative z-10 flex flex-col justify-between space-y-8 p-8 md:h-full md:max-w-[50%] md:p-10 md:pr-12">
                    <div className="space-y-6">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-300">
                        {currentSlide?.badge}
                      </span>
                      <h3 className="text-[32px] font-semibold text-white md:text-[36px]">
                        {currentSlide?.title}
                      </h3>
                      <p className="text-base leading-relaxed text-slate-300 md:text-lg">
                        {currentSlide?.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{t("sectionActions.infoLabel")}</span>
                      <button className="inline-flex items-center gap-2 text-white transition-colors hover:text-white/80">
                        {t("sectionActions.primaryCta")}
                        <span aria-hidden>{"\u2192"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full h-64 overflow-hidden md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[52%]">
                    <div className="relative h-full w-full">
                      <FeatureImage src={currentSlide?.image} alt={currentSlide?.title} priority />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex w-full max-w-5xl items-center justify-between">
            <button
              onClick={handlePrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition-all hover:bg-white/10"
              aria-label={t("features.prevLabel")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {featureItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentIndex ? "h-2.5 w-6 bg-white" : "h-2 w-2 bg-white/25 hover:bg-white/40"
                  }`}
                  aria-label={t("features.dotAria", { index: i + 1 })}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition-all hover:bg-white/10"
              aria-label={t("features.nextLabel")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
