// @ts-nocheck
"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { openAuthModal } from "@/lib/authModal"
import { useTranslation } from "@/context/TranslationContext"

const GRADIENT =
  "linear-gradient(90deg, #491f53 0%, #7e00bf 25%, #312783 50%, #006ae9 75%, #6adbff 90%, #3ea3dc 100%)"
const CARD_SPRING = { type: "spring", damping: 22, stiffness: 250, mass: 0.9 }

const cardEnter = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 26,
      stiffness: 220,
      mass: 0.9,
      restDelta: 0.001,
    },
  },
}

const primaryCardVariants = {
  hidden: cardEnter.hidden,
  visible: cardEnter.visible,
  hover: {
    y: -10,
    scale: 1.01,
    boxShadow: "0 45px 90px rgba(0,0,0,0.55)",
    transition: CARD_SPRING,
  },
}

const secondaryCardVariants = {
  hidden: cardEnter.hidden,
  visible: cardEnter.visible,
  hover: {
    y: -8,
    scale: 1.007,
    boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
    transition: CARD_SPRING,
  },
}

const briskListStagger = {
  hidden: {},
  visible: { transition: { delayChildren: 0.35, staggerChildren: 0.05 } },
}

const listItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
}

export default function SectionPricing() {
  const { dictionary } = useTranslation()
  const pricing = dictionary.pricing
  const freePlan = pricing.freePlan
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const billingOptions: Array<{ id: "monthly" | "yearly"; label: string }> = [
    { id: "monthly", label: pricing.billingMonthlyLabel },
    { id: "yearly", label: pricing.billingYearlyLabel },
  ]

  const freePlanPriceLabel = freePlan?.priceLabel ?? "0 €"
  const freeHeaderRef = useRef<HTMLDivElement | null>(null)
  const premiumHeaderRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const priceRefFree = useRef<HTMLDivElement | null>(null)
  const priceRefPremium = useRef<HTMLDivElement | null>(null)
  const [priceHeight, setPriceHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      const headerHeights = [
        freeHeaderRef.current?.offsetHeight ?? 0,
        premiumHeaderRef.current?.offsetHeight ?? 0,
      ]
      const maxHeader = Math.max(...headerHeights)
      setHeaderHeight(maxHeader)

      const priceHeights = [
        priceRefFree.current?.offsetHeight ?? 0,
        priceRefPremium.current?.offsetHeight ?? 0,
      ]
      const maxPrice = Math.max(...priceHeights)
      setPriceHeight(maxPrice)
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [freePlan, pricing.title, pricing.subtitle, pricing.priceLabel, pricing.priceSuffix])

  return (
    <section id="pricing" className="relative overflow-hidden bg-black py-20 text-slate-100">
      <div className="flex w-full justify-center">
        <div className="w-full max-w-7xl px-6">
          <h2 className="mb-4 text-center text-3xl font-semibold text-white md:text-4xl">{pricing.title}</h2>

          <p className="mx-auto mb-6 max-w-2xl text-center text-base text-slate-300 md:text-lg">{pricing.subtitle}</p>
          <div className="mb-6 flex w-full justify-center">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-1 text-sm font-medium text-slate-200 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur">
              {billingOptions.map(({ id, label }) => {
                const isActive = billingCycle === id
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setBillingCycle(id)}
                    className={`relative min-w-[140px] rounded-full px-5 py-2 text-xs transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_15px_35px_rgba(59,130,246,0.45)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mx-auto mb-10 mt-4 h-px w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="mx-auto flex flex-col gap-8 md:flex-row md:items-stretch">
            {freePlan && (
              <div className="flex-1">
                <TiltCard gradient={GRADIENT}>
                  <motion.div
                    variants={secondaryCardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4, margin: "-10% 0px" }}
                    whileHover="hover"
                    className="relative h-full w-full max-w-[460px] mx-auto rounded-3xl p-[2px]"
                    style={{ background: GRADIENT }}
                  >
                    <div
                      className="relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl bg-neutral-900/80 p-8 text-slate-100 backdrop-blur-md"
                      role="region"
                      aria-label={freePlan.title}
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                      <div className="relative z-10 flex flex-col gap-6">
                        <div
                          ref={freeHeaderRef}
                          style={headerHeight ? { minHeight: headerHeight } : undefined}
                          className="flex flex-col gap-4"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/50">
                            {freePlan.title.toUpperCase()}
                          </p>
                          <h3 className="text-3xl font-semibold text-white">{freePlan.title}</h3>
                          <p className="text-base text-slate-200">{freePlan.subtitle}</p>
                          <div
                            ref={priceRefFree}
                            style={priceHeight ? { minHeight: priceHeight } : undefined}
                            className="flex items-baseline gap-3"
                          >
                            <p className="text-5xl font-extrabold text-white">{freePlanPriceLabel}</p>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{pricing.priceSuffix}</p>
                          </div>
                          <div className="mt-auto">
                            <button
                              onClick={() => openAuthModal()}
                              className="w-full rounded-2xl border border-emerald-400/60 bg-transparent py-3 text-base font-semibold text-emerald-300 shadow-[0_14px_34px_rgba(16,185,129,0.35)] transition duration-300 hover:scale-[1.01] hover:bg-emerald-500/10"
                              aria-label={freePlan.cta}
                            >
                              {freePlan.cta}
                            </button>
                          </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                        <motion.ul variants={briskListStagger} className="space-y-3 text-base text-slate-200">
                          {freePlan.features.map((feature) => (
                            <motion.li key={feature} variants={listItemVariants} className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-xs font-bold text-black shadow-[0_12px_28px_rgba(16,185,129,0.35)]">
                                {"\u2713"}
                              </span>
                              <span className="leading-snug">{feature}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              </div>
            )}
            <div className={`flex-1 ${freePlan ? "" : "w-full"}`}>
              <TiltCard gradient={GRADIENT}>
                <motion.div
                  variants={primaryCardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4, margin: "-10% 0px" }}
                  whileHover="hover"
                  className="relative h-full w-full max-w-[460px] mx-auto rounded-3xl p-[2px]"
                  style={{ background: GRADIENT }}
                >
                  <div
                    className="relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl bg-neutral-900/85 p-8 text-slate-100 backdrop-blur-md"
                    role="region"
                    aria-label={pricing.title}
                  >
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    <div className="relative z-10 flex flex-col gap-6">
                      <div
                        ref={premiumHeaderRef}
                        style={headerHeight ? { minHeight: headerHeight } : undefined}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-200/70">
                            Plan Premium
                          </p>
                          <span className="rounded-full border border-white/20 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/80">
                            {pricing.billingMonthlyLabel}
                          </span>
                        </div>
                        <h3 className="text-3xl font-semibold text-white">{pricing.title}</h3>
                        <p className="text-base text-slate-200">{pricing.subtitle}</p>
                        <div
                          ref={priceRefPremium}
                          style={priceHeight ? { minHeight: priceHeight } : undefined}
                          className="flex items-baseline gap-3"
                        >
                          <p className="text-5xl font-extrabold text-white">{pricing.priceLabel}</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{pricing.priceSuffix}</p>
                        </div>
                        <div className="mt-auto">
                          <button
                            onClick={() => openAuthModal()}
                            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-base font-semibold text-white shadow-[0_20px_40px_rgba(37,99,235,0.35)] transition duration-300 hover:scale-[1.01]"
                            aria-label={pricing.cta}
                          >
                            {pricing.cta}
                          </button>
                        </div>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                      <motion.ul variants={briskListStagger} className="space-y-3 text-base text-slate-200">
                        {pricing.features.map((feature) => (
                          <motion.li key={feature} variants={listItemVariants} className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-bold text-white shadow-[0_15px_35px_rgba(59,130,246,0.35)]">
                              {"\u2713"}
                            </span>
                            <span className="leading-snug">{feature}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type TiltCardProps = {
  children: React.ReactNode
  gradient?: string
}

function TiltCard({ children }: TiltCardProps) {
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    const cols = 5
    const rows = 5

    const colRaw = Math.floor((x + 0.5) * cols)
    const rowRaw = Math.floor((y + 0.5) * rows)

    const col = Math.max(0, Math.min(cols - 1, colRaw))
    const row = Math.max(0, Math.min(rows - 1, rowRaw))

    const tiltXByRow = [20, 10, 0, -10, -20]
    const tiltYByCol = [-10, -5, 0, 5, 10]

    const rotateX = tiltXByRow[row]
    const rotateY = tiltYByCol[col]

    const scale = 1.02

    target.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    target.style.filter = "brightness(1.1)"
  }, [])

  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    target.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)"
    target.style.filter = "brightness(1)"
  }, [])

  return (
    <div style={{ perspective: "800px", height: "100%" }}>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          height: "100%",
          transformStyle: "preserve-3d",
          transform: "rotateX(0deg) rotateY(0deg) scale(1)",
          transition: "transform 125ms ease-in-out, filter 150ms ease-in-out",
        }}
      >
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </div>
  )
}
