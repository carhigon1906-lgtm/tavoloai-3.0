// @ts-nocheck
"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, QrCode, UtensilsCrossed, Eye, Sparkles } from "lucide-react"

export default function ReportsPage() {
  const stats = useMemo(
    () => [
      { label: "Visitas hoy", value: "1,248", delta: "+12%", icon: Eye },
      { label: "Escaneos QR", value: "3,402", delta: "+8%", icon: QrCode },
      { label: "Menús activos", value: "6", delta: "+1", icon: UtensilsCrossed },
      { label: "Crecimiento semanal", value: "18%", delta: "+3%", icon: TrendingUp },
    ],
    [],
  )

  const topDishes = useMemo(
    () => [
      { name: "Tavolo Burger", views: "1,128", trend: "+9%" },
      { name: "Bruschetta Trufa", views: "942", trend: "+6%" },
      { name: "Pizza Fuego", views: "815", trend: "+4%" },
      { name: "Ensalada Mediterránea", views: "693", trend: "+2%" },
    ],
    [],
  )

  const weekly = useMemo(() => [120, 180, 140, 220, 260, 210, 280], [])

  const container = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 28, staggerChildren: 0.08 },
    },
  }

  const card = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 26 } },
  }

  const maxWeekly = Math.max(...weekly)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#070f1c] to-[#03040a] p-4 md:p-6 text-white">
      <motion.div variants={container} initial="hidden" animate="visible" className="mx-auto max-w-6xl space-y-8">
        <motion.div variants={card} className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                Estadísticas en vivo
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">Estadísticas</h1>
              <p className="mt-2 text-sm text-slate-300 md:text-base">
                Revisa el rendimiento del menú, visitas y platos más vistos.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-widest text-slate-300">
              <BarChart3 className="h-4 w-4 text-emerald-300" />
              Últimos 7 días
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <motion.div
              key={item.label}
              variants={card}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15">
                  <item.icon className="h-5 w-5 text-emerald-200" />
                </div>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {item.delta}
                </span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <motion.section
            variants={card}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Tendencia semanal</h2>
                <p className="mt-1 text-sm text-slate-400">Visitas por día</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Semana actual
              </div>
            </div>

            <div className="mt-6 grid h-44 grid-cols-7 items-end gap-3">
              {weekly.map((value, index) => (
                <div key={`${value}-${index}`} className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-emerald-100">{value}</span>
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-emerald-500/80 via-emerald-300/60 to-emerald-100/30 shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
                    style={{ height: `${Math.max(24, (value / maxWeekly) * 100)}%` }}
                  />
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">{["L", "M", "X", "J", "V", "S", "D"][index]}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            variants={card}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Platos más vistos</h2>
                <p className="mt-1 text-sm text-slate-400">Top 4 del mes</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Actualizado hoy
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {topDishes.map((dish) => (
                <div
                  key={dish.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a1220] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{dish.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{dish.views} vistas</p>
                  </div>
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {dish.trend}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}
