// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Link from "next/link"
import { AlertTriangle, BookOpen, Image, LayoutTemplate, PenLine, Settings } from "lucide-react"

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
    key: "new-menu",
    name: "Creacion de nuevo menu",
    title: "CREACION DE NUEVO MENU",
    desc: "Arma un menu completo con secciones y platos sugeridos.",
    icon: BookOpen,
    href: "/dashboard/menu/new",
    color: "from-emerald-400 to-lime-600",
  },
  {
    key: "panic",
    name: "Botón de pánico",
    title: "BOTÓN DE PÁNICO",
    desc: "Oculta platos agotados en tiempo real.",
    icon: AlertTriangle,
    href: "/dashboard/panic",
    color: "from-amber-400 to-red-600",
  },
  {
    key: "studio",
    name: "Estudio fotográfico IA",
    title: "ESTUDIO FOTOGRÁFICO IA",
    desc: "Fotos pro con ajuste automático.",
    icon: Image,
    href: "/dashboard/media",
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    key: "posters",
    name: "Diseñador de afiches IA",
    title: "DISEÑADOR DE AFICHES IA",
    desc: "Afiches listos para redes y menú.",
    icon: LayoutTemplate,
    href: "/dashboard/posters",
    color: "from-cyan-500 to-blue-600",
  },
  {
    key: "writer",
    name: "Redactor & traductor IA",
    title: "REDACTOR & TRADUCTOR IA",
    desc: "Textos gourmet y traducciones globales.",
    icon: PenLine,
    href: "/dashboard/writer",
    color: "from-amber-400 to-fuchsia-600",
  },
]

const quickLinks = [
  ...dashboardLinks.map(({ key, name, href, icon }) => ({ key, name, href, icon })),
  { key: "settings", name: "Configuración", href: "/dashboard/settings", icon: Settings },
]

const stats = [
  { title: "Scans QR", value: 124, trend: "+12% esta semana" },
  { title: "Menús activos", value: 12, trend: "=" },
  { title: "Plato más visto", value: "Spaghetti carbonara", trend: "Top hoy" },
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
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600/30 to-indigo-700/40 shadow-lg border border-white/10">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Dashboard principal</h1>
          <p className="mt-2 text-lg font-normal text-slate-300">Centro de control de tu restaurante</p>
        </motion.section>

        <motion.section variants={item} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 justify-items-center">
          {stats.map(({ title, value, trend }) => (
            <StatsCard key={title} title={title} value={value} trend={trend} />
          ))}
        </motion.section>

        <motion.section
          variants={item}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
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
                className="relative flex-1 rounded-t-lg border border-blue-400/30 bg-gradient-to-t from-blue-500/40 to-teal-400/20 shadow-lg"
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-400">
                  {value}
                </span>
              </motion.div>
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
          {dashboardLinks.map(({ key, title, desc, icon: Icon, color, href }) => {
            const hoverProps = key === "panic" ? { y: -10, scale: 1.07 } : { y: -8, scale: 1.06 }

            return (
              <MotionLink
                key={key}
                href={href}
                whileHover={hoverProps}
                whileTap={{ scale: 0.98 }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-[0_30px_70px_rgba(0,0,0,0.55)] transition-all hover:shadow-2xl backdrop-blur-2xl relative overflow-hidden"
              >
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl border opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  borderColor: key === "new-menu"
                    ? "rgba(52,211,153,0.85)"
                    : key === "panic"
                      ? "rgba(251,191,36,0.8)"
                      : key === "studio"
                        ? "rgba(139,92,246,0.8)"
                        : key === "posters"
                          ? "rgba(34,211,238,0.8)"
                          : "rgba(251,191,36,0.7)",
                }}
              />
              <div
                className="pointer-events-none absolute -inset-1 opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: key === "new-menu"
                    ? "radial-gradient(circle at 20% 20%, rgba(52,211,153,0.85), transparent 55%)"
                    : key === "panic"
                      ? "radial-gradient(circle at 20% 20%, rgba(251,191,36,0.85), transparent 55%)"
                      : key === "studio"
                        ? "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.85), transparent 55%)"
                        : key === "posters"
                          ? "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.85), transparent 55%)"
                          : "radial-gradient(circle at 20% 20%, rgba(251,191,36,0.75), transparent 55%)",
                }}
              />
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]`}
              >
                <Icon className="h-6 w-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
              </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{desc}</p>
              </MotionLink>
            )
          })}
        </motion.section>

        <motion.footer
          variants={item}
          className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Descargar QR (Alta Res)
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Generar PDF para Imprimir
            </button>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  )
}
