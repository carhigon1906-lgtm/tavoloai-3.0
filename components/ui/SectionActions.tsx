// @ts-nocheck
"use client"

import type React from "react"
import { memo, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Button from "./Button"
import { openAuthModal } from "@/lib/authModal"
import { fadeInUp, iosSpring } from "@/lib/motion"
import { useTranslation } from "@/context/TranslationContext"

type SectionActionsProps = {
  infoTitle?: string
  children?: React.ReactNode
  className?: string
}

function SectionActions({ infoTitle, children, className }: SectionActionsProps) {
  const [open, setOpen] = useState(false)
  const { dictionary } = useTranslation()

  const infoLabel = infoTitle ?? dictionary.sectionActions.infoLabel
  const hideLabel = dictionary.sectionActions.hideLabel
  const primaryLabel = dictionary.sectionActions.primaryCta

  const handleToggle = useCallback(() => {
    setOpen((value) => !value)
  }, [])

  const handlePrimaryClick = useCallback(() => {
    openAuthModal()
  }, [])

  return (
    <div className={["relative mt-12", className].filter(Boolean).join(" ")}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          mass: 0.8,
        }}
        className="mx-auto w-full max-w-3xl"
      >
        <motion.div
          className="flex items-center justify-center gap-4"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="md"
              variant="outline"
              onClick={handleToggle}
              aria-expanded={open}
              className="relative overflow-hidden group"
            >
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="inline-block mr-2"
              >
                {open ? "−" : "+"}
              </motion.span>
              {open ? hideLabel : infoLabel}
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="md"
              onClick={handlePrimaryClick}
              aria-label={primaryLabel}
              glowEffect
              className="shadow-xl shadow-blue-500/25"
            >
              {primaryLabel}
            </Button>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
                scale: 0.95,
                filter: "blur(4px)",
              }}
              animate={{
                height: "auto",
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                height: 0,
                opacity: 0,
                scale: 0.95,
                filter: "blur(2px)",
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                opacity: { duration: 0.2 },
                filter: { duration: 0.3 },
              }}
              className="overflow-hidden"
            >
              <motion.div
                className="mt-6 rounded-3xl border border-white/20 bg-white/90 backdrop-blur-xl p-6 text-sm leading-relaxed shadow-xl relative overflow-hidden"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, ...iosSpring }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 pointer-events-none rounded-3xl" />
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="relative z-10 text-gray-700">{children}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default memo(SectionActions)

