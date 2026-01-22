// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  QrCode,
  Timer,
  Users,
  TrendingUp,
  Smartphone,
  Monitor,
  Share2,
} from "lucide-react"

const summaryStats = [
  { title: "Scans QR", value: "1,248", trend: "+14% semana", icon: QrCode },
  { title: "Visitas menu", value: "3,402", trend: "+9% semana", icon: Users },
  { title: "Tiempo medio", value: "2m 18s", trend: "+12s", icon: Timer },
  { title: "Conversiones", value: "28%", trend: "+3%", icon: TrendingUp },
]

const scansByDay = [120, 160, 140, 220, 260, 210, 300]
const scanDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

const topItems = [
  { name: "Tacos al pastor", views: 420, trend: "+18%" },
  { name: "Hamburguesa clasica", views: 360, trend: "+9%" },
  { name: "Pizza margherita", views: 310, trend: "+6%" },
  { name: "Ensalada fresca", views: 240, trend: "+4%" },
]

const deviceSplit = [
  { label: "Movil", value: 72, icon: Smartphone },
  { label: "Desktop", value: 28, icon: Monitor },
]

const sources = [
  { label: "Mesas", value: 48 },
  { label: "Mostrador", value: 22 },
  { label: "Delivery", value: 16 },
  { label: "Redes", value: 14 },
]

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

export default function AnalyticsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#050b16] to-[#010204] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(168,85,247,0.16),transparent_60%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.section
          variants={item}
          className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600/30 to-indigo-700/40 shadow-lg border border-white/10">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Estadisticas del menu QR</h1>
          <p className="mt-2 text-lg font-medium text-slate-300">
            Monitorea el rendimiento del menu inteligente con datos claros y accionables.
          </p>
        </motion.section>

        <motion.section variants={item} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {summaryStats.map(({ title, value, trend, icon: Icon }) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{title}</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                  <Icon className="h-5 w-5 text-slate-200" />
                </div>
              </div>
              <div className="mt-4 text-3xl font-bold text-white">{value}</div>
              <div className="mt-2 text-sm font-medium text-emerald-300">{trend}</div>
            </div>
          ))}
        </motion.section>

        <motion.section
          variants={item}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Scans QR por dia</h3>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">Ultimos 7 dias</span>
          </div>

          <div className="flex h-52 items-end justify-between gap-3 px-2">
            {scansByDay.map((value, index) => (
              <div key={index} className="relative flex-1">
                <div
                  className="h-full rounded-t-lg border border-blue-400/30 bg-gradient-to-t from-blue-500/40 to-teal-400/20 shadow-lg"
                  style={{ height: `${value * 0.6}px` }}
                />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-400">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between px-2 text-xs font-medium text-slate-400">
            {scanDays.map((day) => (
              <span key={day} className="flex-1 text-center">
                {day}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Platos mas vistos</h4>
              <Share2 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-4">
              {topItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.views} vistas</div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">{item.trend}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="mb-4 text-lg font-semibold text-white">Dispositivos</div>
            <div className="space-y-4">
              {deviceSplit.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    <Icon className="h-5 w-5 text-slate-200" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{label}</span>
                      <span className="text-white font-semibold">{value}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500/60 to-indigo-500/60" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="mb-4 text-lg font-semibold text-white">Origen de scans</div>
            <div className="space-y-4">
              {sources.map((source) => (
                <div key={source.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{source.label}</span>
                    <span className="text-white font-semibold">{source.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/70"
                      style={{ width: `${source.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
