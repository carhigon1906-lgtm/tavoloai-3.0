// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import type { ReactNode, ButtonHTMLAttributes } from "react"
import { memo } from "react"
import { iosSpring } from "@/lib/motion"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  glowEffect?: boolean
}

function ButtonComponent({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  glowEffect = true, // Glow activo por defecto para simular iOS
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2 font-semibold
    rounded-2xl transition-all duration-300 cursor-pointer
    focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    overflow-hidden group will-change-transform backdrop-blur-sm
    ${fullWidth ? "w-full" : ""}
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 text-white
      shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40
      border border-blue-400/20 hover:border-blue-300/30
    `,
    secondary: `
      bg-white/90 backdrop-blur-xl text-gray-900 border border-white/30
      shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10
      hover:bg-white hover:border-white/40
    `,
    ghost: `
      bg-gray-100/60 backdrop-blur-sm text-gray-700 hover:bg-gray-100/80
      border border-gray-200/50 hover:border-gray-300/60
      hover:shadow-lg hover:shadow-black/5
    `,
    outline: `
      bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 text-gray-700
      hover:bg-white hover:border-gray-300/80 hover:shadow-lg hover:shadow-black/5
    `,
  }

  const sizes = {
    sm: "px-5 py-2.5 text-sm min-h-[40px]",
    md: "px-7 py-3.5 text-base min-h-[48px]",
    lg: "px-9 py-4.5 text-lg min-h-[56px]",
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    hover: {
      x: "100%",
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  }

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={
        !disabled
          ? {
              scale: 1.02,
              y: -2,
              transition: { type: "spring", damping: 20, stiffness: 300 },
            }
          : undefined
      }
      whileTap={
        !disabled
          ? {
              scale: 0.98,
              y: 0,
              transition: { type: "spring", damping: 25, stiffness: 400 },
            }
          : undefined
      }
      initial="initial"
      whileInView="visible"
      variants={{
        initial: {
          opacity: 0,
          y: 20,
          scale: 0.95,
          filter: "blur(2px)",
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: iosSpring,
        },
      }}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        whileHover="hover"
      />

      {/* Glow effect (solo en primary) */}
      {glowEffect && variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur-xl opacity-0"
          whileHover={{
            opacity: 0.4,
            scale: 1.05,
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 rounded-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative flex items-center gap-2.5 z-10">
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            variants={loadingVariants}
            animate="animate"
          />
        ) : icon ? (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ ...iosSpring, delay: 0.1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {icon}
          </motion.div>
        ) : null}

        <motion.span
          initial={{ opacity: 0, x: -10, filter: "blur(1px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ ...iosSpring, delay: 0.05 }}
          className="text-balance font-semibold tracking-wide"
        >
          {children}
        </motion.span>
      </div>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/25 rounded-2xl scale-0"
        whileTap={{
          scale: [0, 1.2, 1],
          opacity: [0, 0.4, 0],
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
      />
    </motion.button>
  )
}

const Button = memo(ButtonComponent)

export default Button
