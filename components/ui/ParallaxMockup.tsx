// @ts-nocheck
"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

export default function ParallaxMockup() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { scrollY } = useScroll()

  // Parallax vertical con efecto más marcado
  const yRaw = useTransform(scrollY, [0, 800], [0, -80])
  const y = useSpring(yRaw, { damping: 30, stiffness: 150, mass: 0.8 })

  // Parallax por puntero
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - (rect.left + rect.width / 2)) / rect.width
      const py = (e.clientY - (rect.top + rect.height / 2)) / rect.height
      el.style.setProperty("--px", String(px * 1.2))
      el.style.setProperty("--py", String(py * 1.2))
    }

    window.addEventListener("mousemove", handleMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  return (
    <motion.div
      ref={containerRef}
      style={{ y }}
      className="hidden md:block fixed right-12 top-24 w-80 z-20 pointer-events-none"
      aria-hidden
      initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      }}
    >
      <motion.div
        style={{
          transform: `translate3d(calc(var(--px, 0) * 12px), calc(var(--py, 0) * 8px), 0) rotate(calc(var(--px, 0) * 3deg))`,
        }}
        className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/90 backdrop-blur-sm relative group"
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          rotateX: 5,
          transition: { type: "spring", damping: 20, stiffness: 300 },
        }}
      >
        {/* Capas de profundidad con gradientes */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 pointer-events-none rounded-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 rounded-3xl pointer-events-none" />

        <motion.div
          className="relative overflow-hidden rounded-3xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/mockup-device.png"
            width={640}
            height={640}
            alt="TavoloAI mockup"
            priority
            className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>

        {/* Shine sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
      </motion.div>
    </motion.div>
  )
}
