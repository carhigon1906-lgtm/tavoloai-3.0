// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { fadeIn, tapScale } from "@/lib/motion"

interface CardProps {
  children: ReactNode
  className?: string
  variant?: "default" | "glass" | "elevated" | "minimal"
  hover?: boolean
  clickable?: boolean
  padding?: "none" | "sm" | "md" | "lg"
  onClick?: () => void
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

function Card({
  children,
  className = "",
  variant = "default",
  hover = true,
  clickable = false,
  padding = "md",
  onClick,
}: CardProps) {
  const baseClasses = `
    relative rounded-2xl transition-all duration-300 will-change-transform
    ${clickable ? "cursor-pointer" : ""}
  `

  const variants = {
    default: `
      bg-white/90 backdrop-blur-xl border border-white/20
      shadow-lg shadow-black/5
    `,
    glass: `
      bg-white/10 backdrop-blur-2xl border border-white/20
      shadow-xl shadow-black/10
    `,
    elevated: `
      bg-white shadow-2xl shadow-black/10 border border-gray-100/50
    `,
    minimal: `
      bg-gray-50/80 backdrop-blur-sm border border-gray-200/50
    `,
  }

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  const restShadow =
    variant === "glass" ? "0 10px 40px rgba(0, 0, 0, 0.1)" : "0 4px 20px rgba(0, 0, 0, 0.05)"

  const hoverShadow =
    variant === "glass" ? "0 20px 60px rgba(0, 0, 0, 0.15)" : "0 10px 40px rgba(0, 0, 0, 0.1)"

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`}
      initial="hidden"
      whileInView="visible"
      variants={fadeIn}
      viewport={{ once: true, margin: "-50px" }}
      animate={hover ? { scale: 1, y: 0, boxShadow: restShadow } : undefined}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -4,
              boxShadow: hoverShadow,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }
          : undefined
      }
      whileTap={clickable ? tapScale : undefined}
      onClick={onClick}
    >
      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />

      {/* Highlight superior */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Contenido */}
      <div className="relative z-10">{children}</div>

      {/* Glow en hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}

function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`relative z-10 ${className}`}>{children}</div>
}

export { Card, CardContent }
export default Card
