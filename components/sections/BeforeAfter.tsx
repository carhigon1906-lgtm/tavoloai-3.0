// @ts-nocheck
"use client"

import { memo, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { useTranslation } from "@/context/TranslationContext"

const NeonGradientCard = dynamic(
  () => import("@/components/ui/neon-gradient-card").then((mod) => mod.NeonGradientCard),
  { ssr: false },
)

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1], staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
}

function SectionBeforeAfter() {
  const [sliderValue, setSliderValue] = useState(50)
  const { t } = useTranslation()

  return (
    <section id="before-after" className="relative overflow-hidden bg-black py-20 text-slate-100">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 h-full w-screen -translate-x-1/2 bg-gradient-to-r from-[#0f0c29]/70 via-[#302b63]/55 to-[#24243e]/65 blur-[120px] opacity-70" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="container mx-auto flex flex-col items-center px-4"
      >
        <motion.h2
          variants={itemVariants}
          className="mb-12 text-center text-3xl font-semibold text-white text-balance md:text-4xl"
        >
          {t("beforeAfter.title")}
        </motion.h2>

        <motion.div
          className="relative w-full max-w-[34rem] md:max-w-[40rem]"
          variants={itemVariants}
          whileHover={{
            scale: 1.01,
            boxShadow: "0 24px 60px rgba(8,15,40,0.5)",
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[110%] w-[110%] max-w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-[80px] bg-gradient-to-r from-[#ff2975]/30 via-[#ffb347]/25 to-[#00fff1]/30 blur-[120px] opacity-75" />
          <NeonGradientCard
            className="relative z-10 w-full mx-auto"
            borderSize={0.25}
            borderRadius={20}
            neonColors={{ firstColor: "#ff2975", secondColor: "#00FFF1" }}
            contentClassName="bg-black/10 p-0.5 text-white shadow-[0_8px_24px_rgba(3,5,21,0.4)] backdrop-blur-md md:p-1"
          >
            <div className="group relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-white/10 bg-black/20">
              <Image
                src="/before.gif"
                alt={t("beforeAfter.beforeLabel")}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
                priority
              />

              <motion.div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - sliderValue}% 0 0)`,
                  willChange: "clip-path",
                }}
              >
                <Image
                  src="/after.gif"
                  alt={t("beforeAfter.afterLabel")}
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover"
                />
              </motion.div>

              <motion.div
                className="pointer-events-none absolute top-0 bottom-0 w-1 bg-white/80 shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                style={{
                  left: `${sliderValue}%`,
                  willChange: "left",
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/70 shadow-[0_20px_45px_rgba(0,0,0,0.55)]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_8px_20px_rgba(59,130,246,0.45)]">
                    <div className="h-4 w-1 rounded-full bg-white/80" />
                  </div>
                </div>
              </motion.div>

              <input
                aria-label={t("beforeAfter.sliderAria")}
                type="range"
                min={0}
                max={100}
                value={sliderValue}
                onChange={(event) => setSliderValue(Number.parseInt(event.target.value, 10))}
                className="absolute bottom-4 left-6 right-4 h-2 rounded-full bg-white/10 backdrop-blur-sm shadow-[0_18px_35px_rgba(0,0,0,0.45)] appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:bg-gradient-to-r from-blue-500 to-purple-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:shadow-[0_10px_25px_rgba(59,130,246,0.45)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white/60
                  [&::-moz-range-thumb]:appearance-none
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:bg-gradient-to-r from-blue-500 to-purple-500
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-white/60
                  [&::-moz-range-thumb]:rounded-full transition-transform duration-200 hover:scale-[1.02]"
              />

              <motion.div
                className="absolute top-4 left-4 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
                whileHover={{ scale: 1.05 }}
              >
                {t("beforeAfter.beforeLabel")}
              </motion.div>

              <motion.div
                className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-2 text-xs font-medium text-white shadow-[0_18px_40px_rgba(59,130,246,0.45)]"
                whileHover={{ scale: 1.05 }}
              >
                {t("beforeAfter.afterLabel")}
              </motion.div>
            </div>
          </NeonGradientCard>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default memo(SectionBeforeAfter)

