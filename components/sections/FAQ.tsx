// @ts-nocheck
"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import { useTranslation } from "@/context/TranslationContext"

export default function SectionFAQ() {
  const { dictionary } = useTranslation()
  const faqItems = dictionary.faq.items
  const [open, setOpen] = useState<number | null>(0)
  const sectionRef = useRef<HTMLElement | null>(null)
  const bgVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const sectionEl = sectionRef.current
    const videoEl = bgVideoRef.current
    if (!sectionEl || !videoEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.25
        if (isVisible) {
          videoEl.play().catch(() => {
            /* ignore play failures */
          })
        } else {
          videoEl.pause()
        }
      },
      { threshold: [0, 0.25], rootMargin: "0px 0px 0px 0px" },
    )

    observer.observe(sectionEl)

    return () => {
      observer.disconnect()
      videoEl.pause()
    }
  }, [])

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative overflow-hidden bg-black py-20 text-slate-100"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", width: "100vw" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          ref={bgVideoRef}
          className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
          src="/videofondo.mp4"
          preload="metadata"
          loop
          muted
          playsInline
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
      </div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4"
      >
        <motion.h2 variants={fadeInUp} className="mb-10 w-full max-w-3xl text-center text-3xl font-semibold text-white text-balance md:text-4xl">
          {dictionary.faq.title}
        </motion.h2>

        <motion.div
          className="w-full max-w-3xl rounded-[40px_40px_24px_24px] border border-white/5 bg-white/0 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.3)] backdrop-blur-sm"
          variants={fadeInUp}
        >
          {faqItems.map((item, index) => {
            const isOpen = open === index
            return (
              <motion.div
                key={item.question}
                className={`border-b border-white/10 last:border-b-0 overflow-hidden ${
                  index === 0
                    ? "rounded-t-[32px]"
                    : index === faqItems.length - 1
                      ? "rounded-b-[24px]"
                      : ""
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className={`group flex w-full items-center justify-between gap-4 p-6 text-left font-semibold text-white transition-colors duration-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    index === 0 ? "rounded-t-[32px]" : index === faqItems.length - 1 ? "rounded-b-[24px]" : ""
                  }`}
                  onClick={() => setOpen(isOpen ? null : index)}
                  whileHover={{ x: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <span className="pr-4 text-slate-100">{item.question}</span>
                  <motion.span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-lg font-bold text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] group-hover:shadow-[0_18px_40px_rgba(59,130,246,0.45)]"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isOpen ? "x" : "+"}
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 200,
                        opacity: { duration: 0.2 },
                      }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        className="bg-gradient-to-r from-white/5 to-transparent px-6 pb-6 text-slate-300 leading-relaxed"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {item.answer}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </section>
  )
}
