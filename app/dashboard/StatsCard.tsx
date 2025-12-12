// @ts-nocheck
"use client"
import { motion } from "framer-motion"
import { memo } from "react"

interface StatsCardProps {
  title: string
  value: number
  trend: string
}

function StatsCard({ title, value, trend }: StatsCardProps) {
  const isPositive = trend.includes("+")
  const isNeutral = trend === "="

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl group"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-[0.35em]">{title}</h3>
          <div
            className={`w-3 h-3 rounded-full ${
              isPositive ? "bg-emerald-400/80" : isNeutral ? "bg-slate-300/60" : "bg-rose-400/70"
            } shadow-sm`}
          />
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-white">
            {value.toLocaleString()}
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
