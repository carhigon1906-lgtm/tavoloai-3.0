// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Link from "next/link"
import { FilePlus, QrCode, Bolt, Image, BarChart2, Settings } from "lucide-react"

const StatsCard = dynamic(() => import("./StatsCard"))
const MotionLink = motion(Link)

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const dashboardLinks = [
  {
    key: "menus",
    name: "Menus",
    title: "Crear menu nuevo",
    desc: "Disena tu carta digital facilmente.",
    icon: FilePlus,
    href: "/dashboard/menus",
    color: "from-blue-500 to-indigo-500",
  },
  {
    key: "qr",
    name: "QR",
    title: "Generar codigo QR",
    desc: "Crea y descarga tu QR personalizado.",
    icon: QrCode,
    href: "/dashboard/qr",
    color: "from-emerald-500 to-teal-500",
  },
  {
    key: "boost",
    name: "Promociones",
    title: "Crear promocion (Tavolo Boost)",
    desc: "Aumenta tus ventas con promociones.",
    icon: Bolt,
    href: "/dashboard/boost",
    color: "from-amber-400 to-orange-500",
  },
  {
    key: "media",
    name: "Media",
    title: "Subir fotos / logos",
    desc: "Administra imagenes y branding.",
    icon: Image,
    href: "/dashboard/media",
    color: "from-pink-500 to-rose-500",
  },
  {
    key: "analytics",
    name: "Analiticas",
    title: "Ver estadisticas",
    desc: "Consulta el rendimiento y visitas.",
    icon: BarChart2,
    href: "/dashboard/analytics",
    color: "from-sky-500 to-cyan-500",
  },
]

const quickLinks = [
  ...dashboardLinks.map(({ key, name, href, icon }) => ({ key, name, href, icon })),
  { key: "settings", name: "Configuracion", href: "/dashboard/settings", icon: Settings },
]

const stats = [
  { title: "Scans QR", value: 124, trend: "+12% esta semana" },
  { title: "Visitas", value: 89, trend: "+8%" },
  { title: "Menus activos", value: 12, trend: "=" },
  { title: "Pedidos hoy", value: 37, trend: "+5" },
]

const qrScanValues = [10, 14, 9, 18, 22, 17, 25]
const qrScanDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#050b16] to-[#010204] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.16),transparent_55%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.section
          variants={item}
          className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600/30 to-indigo-700/40 shadow-lg border border-white/10">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard principal</h1>
          <p className="mt-2 text-lg font-medium text-slate-300">Centro de control de tu restaurante</p>
        </motion.section>

        <motion.section variants={item} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ title, value, trend }) => (
            <StatsCard key={title} title={title} value={value} trend={trend} />
          ))}
        </motion.section>

        <motion.section
          variants={item}
          className="rounded-3xl border border-white/10 bg-[#060b19]/70 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Scans del QR (últimos 7 días)</h3>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">Semana actual</span>
          </div>

          <div className="flex h-48 items-end justify-between gap-3 px-2">
            {qrScanValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${value * 6}px`, opacity: 1 }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
                className="flex-1 rounded-t-lg border border-blue-400/30 bg-gradient-to-t from-blue-500/40 to-teal-400/20 shadow-lg"
              />
            ))}
          </div>

          <div className="mt-4 flex justify-between px-2 text-xs font-medium text-slate-400">
            {qrScanDays.map((day) => (
              <span key={day} className="flex-1 text-center">
                {day}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardLinks.map(({ key, title, desc, icon: Icon, color, href }) => (
            <MotionLink
              key={key}
              href={href}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-[0_30px_70px_rgba(0,0,0,0.55)] transition-all hover:shadow-2xl backdrop-blur-2xl"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg transition-transform group-hover:scale-105`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-300">{desc}</p>
            </MotionLink>
          ))}
        </motion.section>

        <motion.section
          variants={item}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">Accesos rápidos</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {quickLinks.map(({ key, name, href, icon: Icon }) => (
              <MotionLink
                key={key}
                href={href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/5 p-4 text-white shadow-sm transition-all hover:shadow-lg"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-center text-sm font-medium">{name}</span>
              </MotionLink>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
