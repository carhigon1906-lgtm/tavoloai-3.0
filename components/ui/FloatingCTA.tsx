// @ts-nocheck
"use client"
import type React from "react"
import { memo, useCallback, useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { openAuthModal } from "@/lib/authModal"
import { useTranslation } from "@/context/TranslationContext"

type FloatingCTAProps = {
  label?: string
  href?: string
  onClick?: () => void
  sectionSelector?: string
  // control de delay para ocultar en secciones no válidas (ms)
  hideDelayMs?: number
  // distancia mínima desde bottom del viewport (px)
  bottomOffsetPx?: number
}

const DEFAULT_HIDE_DELAY = 400
const DEFAULT_BOTTOM_OFFSET = 80
const HEADER_SAFE_OFFSET = 96
const CTA_APPEARANCE_VARIANTS = {
  hidden: { opacity: 0, y: 26, scale: 0.95, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
}
const CTA_APPEARANCE_TRANSITION = {
  duration: 0.55,
  ease: [0.25, 1, 0.3, 1],
  opacity: { duration: 0.5, ease: "linear" },
  filter: { duration: 0.45, ease: "linear" },
}
const CTA_HOVER_SPRING = {
  type: "spring" as const,
  damping: 30,
  stiffness: 260,
  mass: 0.9,
}
const CTA_TAP_SPRING = {
  type: "spring" as const,
  damping: 34,
  stiffness: 320,
  mass: 0.75,
}
function FloatingCTA({
  label,
  href,
  onClick,
  sectionSelector = "section",
  hideDelayMs = DEFAULT_HIDE_DELAY,
  bottomOffsetPx = DEFAULT_BOTTOM_OFFSET,
}: FloatingCTAProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<Element | null>(null)
  const [topPx, setTopPx] = useState<number | null>(null)
  const [renderTop, setRenderTop] = useState<number | null>(null)
  const [globallyBlocked, setGloballyBlocked] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const rafRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const smoothRafRef = useRef<number | null>(null)
  const animatedTopRef = useRef<number | null>(null)

  // Observer: detecta la sección visible y aplica la regla index % 4 === 0
  useEffect(() => {
    const sections = document.querySelectorAll(sectionSelector)
    if (!sections.length) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // buscamos la entrada más visible (puede mejorarse si hay multiplex)
        const entry = entries.find((e) => e.isIntersecting)
        if (!entry) return

        const index = Array.from(sections).indexOf(entry.target)
        const shouldShow = index % 4 === 0

        if (shouldShow) {
          // si hay timer para ocultar, cancelarlo
          if (hideTimerRef.current) {
            globalThis.clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
          }
          // fijar la sección activa y hacer visible (queda anclado mientras la sección siga intersectando)
          setActiveSection(entry.target)
          setVisible(true)
        } else {
          // Si no es sección válida, oculta con un pequeño delay (evitar parpadeos)
          if (hideTimerRef.current) globalThis.clearTimeout(hideTimerRef.current)
          hideTimerRef.current = globalThis.setTimeout(() => {
            setActiveSection(null)
            setVisible(false)
            hideTimerRef.current = null
          }, hideDelayMs) as unknown as number
        }
      },
      { root: null, threshold: 0.28 },
    )

    sections.forEach((s) => observerRef.current?.observe(s))
    return () => {
      sections.forEach((s) => observerRef.current?.unobserve(s))
      if (observerRef.current) observerRef.current.disconnect()
      if (rafRef.current) globalThis.cancelAnimationFrame(rafRef.current)
      if (hideTimerRef.current) globalThis.clearTimeout(hideTimerRef.current)
    }
  }, [sectionSelector, hideDelayMs])

  // Mientras exista activeSection, recalculamos topPx pero sólo cuando hay scroll/resize para evitar loops infinitos
  useEffect(() => {
    if (!activeSection) {
      setTopPx(null)
      setRenderTop(null)
      animatedTopRef.current = null
      if (rafRef.current) {
        globalThis.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return undefined
    }

    const updatePosition = () => {
      const rect = (activeSection as Element).getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const approxCTAHeight = 56 // aproximado para posicionar bien
      const desiredTop = Math.min(rect.bottom - approxCTAHeight, viewportHeight - bottomOffsetPx)
      const clampedTop = Math.max(desiredTop, HEADER_SAFE_OFFSET)
      setTopPx(Math.round(clampedTop))
      rafRef.current = null
    }

    const scheduleUpdate = () => {
      if (rafRef.current != null) return
      rafRef.current = globalThis.requestAnimationFrame(updatePosition)
    }

    scheduleUpdate()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      if (rafRef.current != null) {
        globalThis.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [activeSection, bottomOffsetPx])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    if (topPx == null) {
      if (smoothRafRef.current != null) {
        globalThis.cancelAnimationFrame(smoothRafRef.current)
        smoothRafRef.current = null
      }
      animatedTopRef.current = null
      setRenderTop(null)
      return undefined
    }

    if (animatedTopRef.current == null) {
      animatedTopRef.current = topPx
      setRenderTop(topPx)
      return undefined
    }

    if (smoothRafRef.current != null) {
      globalThis.cancelAnimationFrame(smoothRafRef.current)
      smoothRafRef.current = null
    }

    const step = () => {
      if (animatedTopRef.current == null) return
      const current = animatedTopRef.current
      const delta = topPx - current
      const next = Math.abs(delta) < 0.6 ? topPx : current + delta * 0.25
      animatedTopRef.current = next
      setRenderTop(next)

      if (next !== topPx) {
        smoothRafRef.current = globalThis.requestAnimationFrame(step)
      } else {
        smoothRafRef.current = null
      }
    }

    smoothRafRef.current = globalThis.requestAnimationFrame(step)

    return () => {
      if (smoothRafRef.current != null) {
        globalThis.cancelAnimationFrame(smoothRafRef.current)
        smoothRafRef.current = null
      }
    }
  }, [topPx])

  // limpiar timers si el componente se desmonta
  useEffect(() => {
    return () => {
      if (rafRef.current) globalThis.cancelAnimationFrame(rafRef.current)
      if (smoothRafRef.current) globalThis.cancelAnimationFrame(smoothRafRef.current)
      if (hideTimerRef.current) globalThis.clearTimeout(hideTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>
      setGloballyBlocked(Boolean(customEvent.detail))
    }
    window.addEventListener("floating:block", handler as EventListener)
    const initialState = Boolean((window as typeof window & { __floatingBlocked?: boolean }).__floatingBlocked)
    setGloballyBlocked(initialState)
    return () => {
      window.removeEventListener("floating:block", handler as EventListener)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return undefined
    const handleOpen = () => setAuthModalOpen(true)
    const handleClose = () => setAuthModalOpen(false)
    window.addEventListener("auth:open", handleOpen)
    window.addEventListener("auth:close", handleClose)
    return () => {
      window.removeEventListener("auth:open", handleOpen)
      window.removeEventListener("auth:close", handleClose)
    }
  }, [])

  const handleClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (onClick) onClick()
      else openAuthModal()
    },
    [onClick],
  )

  const resolvedLabel = label ?? t("floatingCta.label")

  const ctaStyle: React.CSSProperties = {
    background: "rgba(17,24,39,0.35)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: expanded ? "0 18px 32px rgba(14,165,233,0.18)" : "0 6px 18px rgba(2,6,23,0.22)",
    transition: "box-shadow 220ms ease, transform 220ms ease",
  }

  const ButtonInner = (
    <motion.div
      layout
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      exit="hidden"
      variants={CTA_APPEARANCE_VARIANTS}
      transition={CTA_APPEARANCE_TRANSITION}
      role="button"
      aria-label={resolvedLabel}
      whileHover={{
        scale: 1.01,
        y: -1,
        boxShadow: "0 22px 38px rgba(14,165,233,0.18)",
        transition: CTA_HOVER_SPRING,
      }}
      whileTap={{ scale: 0.992, transition: CTA_TAP_SPRING }}
      className="relative flex items-center gap-3 rounded-full px-5 py-3 select-none"
      style={{
        ...ctaStyle,
        paddingLeft: 16,
        paddingRight: 14,
      }}
    >
      <span className="text-white font-semibold leading-none" style={{ letterSpacing: "0.1px", fontSize: 14 }}>
        {resolvedLabel}
      </span>

      <span style={{ width: 8 }} />

      <span
        className="flex items-center justify-center rounded-full"
        style={{
          width: 30,
          height: 30,
          background: "linear-gradient(180deg,#0ea5e9,#06b6d4)",
          boxShadow: "0 6px 14px rgba(14,165,233,0.16)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </motion.div>
  )

  const resolvedTop = renderTop ?? topPx

  // Render: si no hay sección activa (o topPx aún no calculado) o está bloqueado globalmente, no mostramos.
  return (
    <AnimatePresence>
      {visible && resolvedTop != null && !globallyBlocked && !authModalOpen && (
        <div
          className="fixed left-1/2 z-50 pointer-events-none"
          style={{
            transform: "translateX(-50%)",
            top: resolvedTop,
          }}
        >
          <div
            className="pointer-events-auto"
            onMouseEnter={() => {
              // al entrar el mouse evitamos que se oculte por hideTimer
              if (hideTimerRef.current) {
                globalThis.clearTimeout(hideTimerRef.current)
                hideTimerRef.current = null
              }
              setExpanded(true)
            }}
            onMouseLeave={() => {
              setExpanded(false)
              // si el usuario sale y la sección no es válida, se ocultará por observer + hideDelay
            }}
          >
            {href ? (
              <Link href={href} onClick={handleClick} aria-label={resolvedLabel}>
                {ButtonInner}
              </Link>
            ) : (
              <button onClick={handleClick} aria-label={resolvedLabel}>
                {ButtonInner}
              </button>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default memo(FloatingCTA)
