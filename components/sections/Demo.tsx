// @ts-nocheck
"use client"

import { useEffect, useId, useRef, useState } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import Image from "next/image"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import { useTranslation } from "@/context/TranslationContext"

const FRAME_GRADIENT_STOPS = [
  { offset: "0%", color: "#491f53" },
  { offset: "20%", color: "#7e00bf" },
  { offset: "45%", color: "#312783" },
  { offset: "70%", color: "#006ae9" },
  { offset: "100%", color: "#6adbff" },
]

const PHONE_OUTLINE_PATH =
  "M76 12H164Q220 12 220 68V432Q220 488 164 488H76Q20 488 20 432V68Q20 12 76 12Z"
const PHONE_INNER_OUTLINE_PATH =
  "M86 28H154Q202 28 202 76V424Q202 472 154 472H86Q38 472 38 424V76Q38 28 86 28Z"
const PHONE_BODY_INSET = { top: 12, right: 42, bottom: 12, left: 42 }
const PHONE_SCREEN_INSET = { top: 62, right: 56, bottom: 52, left: 56 }

export default function SectionDemo() {
  const { dictionary, t } = useTranslation()
  const tasks = dictionary.demo.tasks

  const [done, setDone] = useState<string[]>([])
  const [stage, setStage] = useState<"idle" | "wire" | "content">("idle")
  const gradientId = useId()
  const sectionRef = useRef<HTMLElement | null>(null)
  const isSectionInView = useInView(sectionRef, { once: true, margin: "-25% 0px" })
  const toggle = (id: string) =>
    setDone((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))

  const progress = Math.round((done.length / tasks.length) * 100)
  const isContentStage = stage === "content"

  useEffect(() => {
    if (isSectionInView && stage === "idle") {
      setStage("wire")
    }
  }, [isSectionInView, stage])

  useEffect(() => {
    if (stage !== "wire") return
    const timer = window.setTimeout(() => setStage("content"), 2400)
    return () => window.clearTimeout(timer)
  }, [stage])

  return (
    <section id="demo" className="relative overflow-hidden bg-black py-20 text-slate-100" ref={sectionRef}>
      <motion.div
        className="container mx-auto grid items-start gap-12 px-6 md:grid-cols-2 md:px-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          variants={fadeInUp}
          whileHover={{
            scale: 1.02,
            rotateY: -5,
            boxShadow: "0 35px 70px rgba(0, 0, 0, 0.65)",
          }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />

          <div
            className={`mx-auto w-[394px] h-[620px] rounded-[42px] relative overflow-hidden transition-all duration-500 ${
              isContentStage ? "bg-neutral-900/90" : "bg-white/5"
            }`}
          >
            <AnimatePresence mode="wait">
              {stage === "wire" && (
                <motion.div
                  key="wireframe"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 240 500"
                    fill="none"
                    className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
                  >
                    <defs>
                      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        {FRAME_GRADIENT_STOPS.map((stop) => (
                          <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                        ))}
                      </linearGradient>
                    </defs>
                    <motion.path
                      d={PHONE_OUTLINE_PATH}
                      stroke={`url(#${gradientId})`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.1, ease: "easeInOut" }}
                    />
                    <motion.path
                      d={PHONE_INNER_OUTLINE_PATH}
                      stroke={`url(#${gradientId})`}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
                    />
                    <motion.rect
                      x="84"
                      y="44"
                      width="72"
                      height="52"
                      rx="18"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    />
                    <motion.rect
                      x="52"
                      y="100"
                      width="92"
                      height="32"
                      rx="16"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.65, delay: 0.32, ease: "easeOut" }}
                    />
                    <motion.rect
                      x="146"
                      y="100"
                      width="92"
                      height="32"
                      rx="16"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.65, delay: 0.36, ease: "easeOut" }}
                    />
                    <motion.rect
                      x="52"
                      y="160"
                      width="156"
                      height="78"
                      rx="22"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.75, delay: 0.42, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="76"
                      y1="190"
                      x2="188"
                      y2="190"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="76"
                      y1="212"
                      x2="172"
                      y2="212"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.56, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="42"
                      y1="198"
                      x2="20"
                      y2="198"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.58, ease: "easeOut" }}
                    />
                    <motion.rect
                      x="52"
                      y="258"
                      width="156"
                      height="78"
                      rx="22"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.75, delay: 0.72, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="76"
                      y1="288"
                      x2="188"
                      y2="288"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.82, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="76"
                      y1="310"
                      x2="172"
                      y2="310"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.88, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="42"
                      y1="296"
                      x2="20"
                      y2="296"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
                    />
                    <motion.rect
                      x="72"
                      y="372"
                      width="118"
                      height="46"
                      rx="20"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.96, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="98"
                      y1="398"
                      x2="166"
                      y2="398"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.65, delay: 1.02, ease: "easeOut" }}
                    />
                    <motion.line
                      x1="204"
                      y1="338"
                      x2="228"
                      y2="338"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 1.05, ease: "easeOut" }}
                    />
                  </motion.svg>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isContentStage && (
                <motion.div
                  key="mockup-frame"
                  className="absolute rounded-[46px] border-[8px] border-white/10 bg-black/80 shadow-[0_45px_90px_rgba(0,0,0,0.7)]"
                  style={PHONE_BODY_INSET}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isContentStage && (
                <motion.div
                  key="content"
                  className="absolute space-y-3 rounded-[30px] bg-neutral-900/90 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.65)] backdrop-blur-md"
                  style={PHONE_SCREEN_INSET}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
                >
                  <div className="flex justify-between items-center">
                    <motion.button
                      onClick={() => toggle("lang")}
                      className={`text-xs border px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                        done.includes("lang")
                          ? "bg-white text-black border-white shadow-[0_15px_35px_rgba(0,0,0,0.45)]"
                          : "bg-white/10 border-white/20 text-slate-200 hover:border-white/40 hover:bg-white/15"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-pressed={done.includes("lang")}
                    >
                      ES/EN/IT
                    </motion.button>

                    <motion.button
                      onClick={() => toggle("gluten")}
                      className={`text-xs border px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                        done.includes("gluten")
                          ? "bg-emerald-400 text-black border-emerald-400 shadow-[0_18px_40px_rgba(52,211,153,0.45)]"
                          : "bg-white/10 border-white/20 text-slate-200 hover:border-emerald-300 hover:bg-emerald-300/10"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-pressed={done.includes("gluten")}
                    >
                      {dictionary.demo.glutenButton}
                    </motion.button>
                  </div>

                  <motion.div
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      done.includes("dish")
                        ? "bg-amber-400/15 border-amber-300/70 shadow-[0_20px_50px_rgba(251,191,36,0.25)]"
                        : "bg-white/5 border-white/10 hover:border-amber-300/60 hover:bg-amber-300/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => toggle("dish")}
                      className="text-sm font-semibold text-amber-100 w-full text-left"
                      aria-pressed={done.includes("dish")}
                    >
                      {dictionary.demo.dishHighlight}
                    </button>
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      done.includes("share")
                        ? "bg-emerald-400/15 border-emerald-300/70 shadow-[0_20px_50px_rgba(52,211,153,0.25)]"
                        : "bg-white/5 border-white/10 hover:border-emerald-300/60 hover:bg-emerald-300/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => toggle("share")}
                      className="text-sm font-medium text-emerald-100 w-full text-left"
                      aria-pressed={done.includes("share")}
                    >
                      {dictionary.demo.shareButton}
                    </button>
                  </motion.div>

                  <div className="text-xs font-medium text-slate-300 text-center bg-white/10 rounded-lg py-2">
                    {dictionary.demo.simulationBadge}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div className="space-y-6" variants={fadeInUp}>
          <motion.h2
            className="text-balance text-3xl font-semibold text-white md:text-4xl"
            variants={fadeInUp}
          >
            {dictionary.demo.title}
          </motion.h2>

          <motion.p className="text-pretty text-lg leading-relaxed text-slate-300" variants={fadeInUp}>
            {dictionary.demo.description}
          </motion.p>

          <motion.div
            className="h-40 w-40 overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm"
            variants={fadeInUp}
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Image width={144} height={144} src="/qr-demo.png" alt={dictionary.demo.qrAlt} className="w-full h-full object-cover rounded-xl" />
          </motion.div>

          <motion.div className="mt-6" variants={fadeInUp}>
            <div className="h-3 overflow-hidden rounded-full bg-white/10 shadow-inner shadow-black/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: progress + "%" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_10px_30px_rgba(59,130,246,0.45)]"
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-200">{t("demo.progressLabel", { value: progress })}</p>
          </motion.div>

          <motion.ul className="space-y-3" variants={staggerContainer}>
            {tasks.map((task) => (
              <motion.li
                key={task.id}
                className="flex items-center gap-3 text-sm"
                variants={fadeInUp}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <motion.span
                  className={`w-6 h-6 inline-flex items-center justify-center rounded-full border-2 font-medium transition-all duration-300 ${
                    done.includes(task.id)
                      ? "border-blue-500 bg-blue-500 text-white shadow-[0_15px_35px_rgba(59,130,246,0.45)]"
                      : "border-white/20 bg-white/5 text-slate-400 hover:border-blue-400/70"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-hidden="true"
                >
                  <AnimatePresence>
                    {done.includes(task.id) && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      >
                        {"\u2713"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>
                <span className="font-medium text-slate-200">{task.label}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </section>
  )
}

