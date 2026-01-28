// @ts-nocheck
"use client"
import { motion } from "framer-motion"
import { memo } from "react"

interface StatsCardProps {
  title: string
  value: number | string
  trend: string
}

function StatsCard({ title, value, trend }: StatsCardProps) {
  const isPositive = trend.includes("+")
  const isNeutral = trend === "="

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full min-w-[260px] max-w-sm snap-center overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-7 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl group transition-transform duration-300 sm:min-w-0 sm:p-6"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-[0.35em]">{title}</h3>
          <div
            className={`w-3 h-3 rounded-full ${
              isPositive ? "bg-emerald-400/80" : isNeutral ? "bg-slate-300/60" : "bg-rose-400/70"
            } shadow-sm`}
          />
        </div>

        <div className="space-y-2">
          <p
            className={`font-bold text-white ${typeof value === "number" ? "text-3xl" : "text-2xl sm:text-3xl"}`}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p
            className={`text-sm font-medium ${
              isPositive ? "text-emerald-300" : isNeutral ? "text-slate-400" : "text-rose-300"
            }`}
          >
            {trend}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  )
}

export default memo(StatsCard)
