// @ts-nocheck
"use client"
import { motion, AnimatePresence } from "framer-motion"
import type React from "react"
import { iosSpring } from "@/lib/motion"

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export default function Modal({ open, onClose, children, title }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{
              y: 420,
              opacity: 0.8,
              scale: 0.95,
              filter: "blur(4px)",
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              y: 420,
              opacity: 0.8,
              scale: 0.95,
              filter: "blur(2px)",
            }}
            transition={iosSpring}
            className="w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fondo con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-3xl" />
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            {/* Botón de cerrar */}
            <motion.button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 z-10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              aria-label="Cerrar modal"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6.707 6l3.647-3.646a.5.5 0 0 0-.708-.708L6 5.293 2.354 1.646a.5.5 0 0 0-.708.708L5.293 6 1.646 9.646a.5.5 0 0 0 .708.708L6 6.707l3.646 3.647a.5.5 0 0 0 .708-.708L6.707 6z" />
              </svg>
            </motion.button>

            {/* Contenido */}
            <div className="relative z-10">
              {title && (
                <motion.h3
                  className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h3>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
