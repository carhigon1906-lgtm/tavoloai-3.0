"use client"

import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface NeonGradientCardProps extends HTMLAttributes<HTMLDivElement> {
  wrapperClassName?: string
  innerClassName?: string
  contentClassName?: string
}

export function NeonGradientCard({
  className,
  children,
  wrapperClassName,
  innerClassName,
  contentClassName,
  ...props
}: NeonGradientCardProps) {
  return (
    <div className={cn("relative flex w-full items-center justify-center overflow-visible", className)} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-36px] -z-10 rounded-[90px] bg-[radial-gradient(circle,rgba(255,41,117,0.28),transparent_65%)] opacity-80 blur-[120px]"
      />

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[48px] p-[10px] animate-neon-border shadow-[0_40px_120px_rgba(3,5,21,0.65)]",
          wrapperClassName,
        )}
        style={{
          background: "linear-gradient(120deg,#ff2975,#ffb347,#00fff1,#7f5dff,#ff2975)",
          backgroundSize: "260% 260%",
        }}
      >
        <div
          className={cn(
            "relative rounded-[42px] border border-white/15 bg-[#05060a]/92 p-6 text-white shadow-[0_35px_80px_rgba(3,5,21,0.55)]",
            innerClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
