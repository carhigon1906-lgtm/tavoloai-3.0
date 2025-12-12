// @ts-nocheck
"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimationControls, useInView } from "framer-motion"
import { openAuthModal } from "@/lib/authModal"
import { useTranslation } from "@/context/TranslationContext"

const subtleStaggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const subtleFadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.8, 0.35, 1] },
  },
}

export default function SectionFinalCTA() {
  const { dictionary } = useTranslation()
  const finalCta = dictionary.finalCta

  const [glowActive, setGlowActive] = useState(false)
  const glowContainerRef = useRef<HTMLButtonElement | null>(null)
  const badgeRef = useRef<HTMLDivElement | null>(null)
  const badgeInView = useInView(badgeRef, { margin: "-22% 0px -12% 0px" })
  const badgeControls = useAnimationControls()
  const sparkleControls = useAnimationControls()
  const haloControls = useAnimationControls()

  useEffect(() => {
    let isMounted = true

    const playEntry = async () => {
      await badgeControls.start({
        opacity: 1,
        y: [26, -6, 0],
        scale: [0.9, 1.04, 1],
        filter: "blur(0px)",
        backgroundPosition: ["0% 50%", "100% 50%"],
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
      })

      if (!isMounted) return

      badgeControls.start({
        y: [-2, 2, -2],
        scale: [1, 0.995, 1],
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        boxShadow: [
          "0 12px 28px rgba(15,23,42,0.35)",
          "0 26px 45px rgba(15,23,42,0.5)",
          "0 12px 28px rgba(15,23,42,0.35)",
        ],
        transition: { duration: 6, ease: "easeInOut", repeat: Infinity },
      })
    }

    if (badgeInView) {
      playEntry()
      sparkleControls.start({
        rotate: [0, 14, -12, 0],
        transition: { duration: 5.5, ease: "easeInOut", repeat: Infinity },
      })

      haloControls.start({
        opacity: [0.06, 0.18, 0.06],
        transition: { duration: 4.8, ease: "easeInOut", repeat: Infinity },
      })
    } else {
      badgeControls.stop()
      sparkleControls.stop()
      haloControls.stop()

      badgeControls.set({
        opacity: 0,
        y: 26,
        scale: 0.9,
        filter: "blur(20px)",
        backgroundPosition: "0% 50%",
        boxShadow: "0 12px 28px rgba(15,23,42,0.35)",
      })
      sparkleControls.set({ rotate: 0 })
      haloControls.set({ opacity: 0 })
    }

    return () => {
      isMounted = false
    }
  }, [badgeInView, badgeControls, sparkleControls, haloControls])

  const handleGlowMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = `${event.clientX - bounds.left}px`
    const y = `${event.clientY - bounds.top}px`
    const el = glowContainerRef.current
    if (el) {
      el.style.setProperty("--glow-x", x)
      el.style.setProperty("--glow-y", y)
    }
  }

  return (
    <section className="relative bg-black py-20 text-center text-slate-100">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(1000px, 100vw)",
          height: "min(640px, 100vw)",
          background:
            "radial-gradient(circle at 50% 40%, rgba(59,130,246,0.24) 0%, rgba(56,189,248,0.12) 32%, rgba(24,33,54,0.36) 60%, rgba(0,0,0,0.95) 88%, rgba(0,0,0,1) 100%)",
          filter: "blur(120px)",
          opacity: 0.45,
        }}
      />

      <motion.div
        variants={subtleStaggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="container relative z-10"
      >
        <motion.h2
          variants={subtleFadeInUp}
          className="mb-6 text-4xl font-semibold text-white text-balance md:text-5xl"
        >
          {finalCta.title}
        </motion.h2>

        <motion.p variants={subtleFadeInUp} className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          {finalCta.description}
        </motion.p>

        <motion.div variants={subtleFadeInUp} className="mt-10 flex justify-center">
          <motion.button
            ref={glowContainerRef}
            onClick={() => openAuthModal()}
            onMouseMove={handleGlowMove}
            onMouseEnter={() => setGlowActive(true)}
            onMouseLeave={() => setGlowActive(false)}
            aria-label={finalCta.cta}
            className="group relative flex items-center justify-center overflow-hidden rounded-2xl px-14 py-4 text-xl font-semibold text-white"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", damping: 20, stiffness: 320 }}
            style={{
              boxShadow: "0 75px 200px rgba(59,130,246,0.28)",
              filter: "drop-shadow(0 45px 95px rgba(59,130,246,0.22))",
            }}
          >
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-85" />
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500 ease-out"
              animate={{ opacity: glowActive ? 1 : 0 }}
              style={{
                background:
                  "radial-gradient(360px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255,255,255,0.26), transparent 65%)",
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-white/18 via-transparent to-transparent"
              animate={{ opacity: glowActive ? 0.9 : 0.5 }}
            />
            <motion.div
              className="pointer-events-none absolute inset-[-12%] blur-[120px]"
              initial={{ opacity: 0.22 }}
              animate={{ opacity: glowActive ? 0.34 : 0.22 }}
              style={{
                background:
                  "radial-gradient(160% 140% at var(--glow-x, 50%) var(--glow-y, 50%), rgba(59,130,246,0.3), rgba(0,0,0,0.9) 68%, rgba(0,0,0,1) 96%)",
              }}
            />
            <span className="relative z-20">{finalCta.cta}</span>
          </motion.button>
        </motion.div>

        <motion.div
          ref={badgeRef}
          animate={badgeControls}
          whileHover={{ scale: 1.05, y: -6 }}
          className="relative mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-slate-100/95 backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(120deg, rgba(59,130,246,0.55), rgba(129,140,248,0.25), rgba(17,24,39,0.92))",
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 50%",
            border: "1px solid rgba(255,255,255,0.14)",
            maskImage:
              "radial-gradient(200% 150% at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 95%)",
            WebkitMaskImage:
              "radial-gradient(200% 150% at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 95%)",
            boxShadow: "0 12px 28px rgba(15,23,42,0.35)",
          }}
        >
          <motion.span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white"
            animate={sparkleControls}
          >
            *
          </motion.span>
          <span className="relative z-10">{finalCta.badge}</span>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            animate={haloControls}
            style={{
              background: "radial-gradient(circle at 20% 40%, rgba(255,255,255,0.18), transparent 55%)",
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}




