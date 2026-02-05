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

  const tint = isPositive ? "emerald" : isNeutral ? "slate" : "rose"

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full min-w-[260px] max-w-sm snap-center overflow-hidden rounded-[30px] border border-white/10 bg-[#0f172a]/40 p-7 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-[22px] group transition-transform duration-300 sm:min-w-0 sm:p-6"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_35%,rgba(255,255,255,0.05))]" />
        <div className="absolute -top-20 right-6 h-44 w-44 rounded-full bg-white/8 blur-3xl" />
        <div
          className={`absolute -bottom-24 left-4 h-48 w-48 rounded-full blur-3xl ${
            tint === "emerald" ? "bg-emerald-400/24" : tint === "rose" ? "bg-rose-400/24" : "bg-slate-300/18"
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.08),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 rounded-[30px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />
        <div className="absolute inset-0 rounded-[30px] shadow-[inset_0_-1px_0_rgba(15,23,42,0.55)]" />
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-[0.35em]">{title}</h3>
          <div
            className={`relative h-3 w-3 rounded-full ${
              isPositive ? "bg-emerald-400/90" : isNeutral ? "bg-slate-300/70" : "bg-rose-400/80"
            } shadow-[0_0_12px_rgba(255,255,255,0.35)]`}
          >
            <span
              className={`absolute inset-0 rounded-full blur-[6px] ${
                isPositive ? "bg-emerald-300/70" : isNeutral ? "bg-slate-200/60" : "bg-rose-300/70"
              }`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p
            className={`font-bold ${
              isPositive ? "text-emerald-100" : isNeutral ? "text-slate-100" : "text-rose-100"
            } ${typeof value === "number" ? "text-3xl" : "text-2xl sm:text-3xl"}`}
            style={{
              textShadow: isPositive
                ? "0 0 6px rgba(16,185,129,0.5), 0 0 18px rgba(16,185,129,0.45), 0 0 32px rgba(16,185,129,0.35)"
                : isNeutral
                  ? "0 0 6px rgba(148,163,184,0.45), 0 0 16px rgba(148,163,184,0.35), 0 0 28px rgba(148,163,184,0.25)"
                  : "0 0 6px rgba(244,63,94,0.5), 0 0 18px rgba(244,63,94,0.45), 0 0 32px rgba(244,63,94,0.35)",
            }}
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

      <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-gradient-to-r from-white/0 via-white/14 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className={`pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          tint === "emerald"
            ? "shadow-[0_0_35px_rgba(16,185,129,0.25)]"
            : tint === "rose"
              ? "shadow-[0_0_35px_rgba(244,63,94,0.25)]"
              : "shadow-[0_0_28px_rgba(148,163,184,0.18)]"
        }`}
      />
    </motion.div>
  )
}

export default memo(StatsCard)
