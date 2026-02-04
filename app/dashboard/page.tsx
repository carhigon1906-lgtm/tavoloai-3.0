// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Link from "next/link"
import { AlertTriangle, BarChart3, BookOpen, Image, LayoutTemplate, PenLine, Settings } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
    name: "Creación de menú",
    title: "CREACIÓN DE MENÚ",
    desc: "Crea tu menú desde cero con secciones y platos sugeridos.",
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
  {
    key: "stats",
    name: "Estadísticas",
    title: "ESTADÍSTICAS",
    desc: "Estadísticas del menú QR inteligente en tiempo real.",
    icon: BarChart3,
    href: "/dashboard/reports",
    color: "from-sky-400 to-emerald-500",
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
const maxQrScans = Math.max(...qrScanValues)

export default function DashboardPage() {
  const statsScrollRef = useRef<HTMLDivElement | null>(null)
  const cardsSectionRef = useRef<HTMLElement | null>(null)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  useEffect(() => {
    const container = statsScrollRef.current
    if (!container) return

    const media = window.matchMedia("(max-width: 639px)")
    if (!media.matches) return

    let timerId = 0
    let cards: HTMLElement[] = []
    let index = 0

    const collectCards = () => {
      cards = Array.from(container.children) as HTMLElement[]
    }

    const scrollToIndex = (nextIndex: number) => {
      if (cards.length === 0) return
      const next = cards[nextIndex]
      const targetLeft = next.offsetLeft - (container.clientWidth - next.clientWidth) / 2
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" })
    }

    const tick = () => {
      if (container.scrollWidth <= container.clientWidth) return
      index = (index + 1) % cards.length
      scrollToIndex(index)
    }

    collectCards()
    timerId = window.setInterval(tick, 3200)

    const resizeHandler = () => {
      collectCards()
      index = 0
      scrollToIndex(0)
    }
    window.addEventListener("resize", resizeHandler)

    return () => {
      window.clearInterval(timerId)
      window.removeEventListener("resize", resizeHandler)
    }
  }, [])

  useEffect(() => {
    const section = cardsSectionRef.current
    if (!section) return

    const media = window.matchMedia("(max-width: 639px)")
    if (!media.matches) return

    const cards = Array.from(section.querySelectorAll("[data-card-key]")) as HTMLElement[]
    if (cards.length === 0) return

    let settleTimer: number | null = null
    let rafId = 0

    const updateActive = () => {
      const header = document.querySelector("header")
      const bottomNav = document.getElementById("dashboard-mobile-nav")
      const headerHeight = header ? (header as HTMLElement).offsetHeight : 0
      const bottomNavHeight = bottomNav ? (bottomNav as HTMLElement).offsetHeight : 0
      const availableHeight = window.innerHeight - headerHeight - bottomNavHeight
      const viewportCenter = headerHeight + availableHeight / 2
      let best: { key: string; distance: number } | null = null

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.top + rect.height / 2
        const distance = Math.abs(cardCenter - viewportCenter)
        const key = card.dataset.cardKey
        if (!key) return
        if (!best || distance < best.distance) {
          best = { key, distance }
        }
      })

      if (best) setActiveCard(best.key)
    }

    const scheduleUpdate = () => {
      if (settleTimer) window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        rafId = window.requestAnimationFrame(updateActive)
      }, 260)
    }

    scheduleUpdate()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (settleTimer) window.clearTimeout(settleTimer)
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#070b12] via-[#0a111d] to-[#05070c] text-white pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+28px)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.16),transparent_55%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-12 sm:gap-14 sm:px-6 sm:py-12 lg:px-8"
      >
        <motion.section
          variants={item}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="rounded-[26px] border border-white/10 bg-white/10 px-5 py-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:px-6 sm:py-5 sm:text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600/30 to-indigo-700/40 shadow-lg border border-white/10 sm:h-16 sm:w-16 sm:rounded-3xl">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">Dashboard principal</h1>
          <p className="mt-2 text-sm font-normal text-slate-300 sm:text-lg">Centro de control de tu restaurante</p>
        </motion.section>

        <motion.section
          variants={item}
          className="flex snap-x snap-mandatory scroll-smooth gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible xl:grid-cols-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          ref={statsScrollRef}
        >
          {stats.map(({ title, value, trend }) => (
            <StatsCard key={title} title={title} value={value} trend={trend} />
          ))}
        </motion.section>

        <motion.section
          variants={item}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="rounded-[28px] border border-white/10 bg-[#0a1220]/75 p-7 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Scans del QR (últimos 7 días)</h3>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">Semana actual</span>
          </div>

          <div className="mt-2 grid h-44 grid-cols-7 items-end gap-1.5 sm:gap-3">
            {qrScanValues.map((value, index) => (
              <div key={`${value}-${index}`} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-teal-100">{value}</span>
                <div
                  className="mx-auto w-full max-w-[28px] rounded-2xl bg-gradient-to-t from-teal-500/90 via-cyan-300/70 to-teal-100/35 shadow-[0_12px_30px_rgba(20,184,166,0.55)] sm:max-w-none sm:w-24"
                  style={{ height: `${Math.max(24, (value / maxQrScans) * 100)}%` }}
                />
                <span className="text-[10px] uppercase tracking-widest text-slate-400">{qrScanDays[index]}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={item}
          ref={cardsSectionRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {dashboardLinks.map(({ key, title, desc, icon: Icon, color, href }) => {
            const hoverProps = key === "panic" ? { y: -10, scale: 1.07 } : { y: -8, scale: 1.06 }
            const isActive = activeCard === key

            return (
              <MotionLink
                key={key}
                href={href}
                whileHover={hoverProps}
                whileTap={{ scale: 0.98 }}
                data-card-key={key}
                className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/10 p-7 text-left shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all hover:shadow-2xl backdrop-blur-2xl sm:p-6"
              >
              <div
                className={`pointer-events-none absolute inset-0 rounded-3xl border transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
                }`}
                style={{
                  borderColor: key === "new-menu"
                    ? "rgba(52,211,153,0.85)"
                    : key === "panic"
                      ? "rgba(251,191,36,0.8)"
                    : key === "studio"
                        ? "rgba(139,92,246,0.8)"
                        : key === "posters"
                          ? "rgba(34,211,238,0.8)"
                          : key === "stats"
                            ? "rgba(56,189,248,0.8)"
                          : "rgba(251,191,36,0.7)",
                }}
              />
              <div
                className={`pointer-events-none absolute -inset-1 opacity-15 blur-2xl transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
                }`}
                style={{
                  background: key === "new-menu"
                    ? "radial-gradient(circle at 20% 20%, rgba(52,211,153,0.85), transparent 55%)"
                    : key === "panic"
                      ? "radial-gradient(circle at 20% 20%, rgba(251,191,36,0.85), transparent 55%)"
                    : key === "studio"
                        ? "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.85), transparent 55%)"
                        : key === "posters"
                          ? "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.85), transparent 55%)"
                          : key === "stats"
                            ? "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.85), transparent 55%)"
                          : "radial-gradient(circle at 20% 20%, rgba(251,191,36,0.75), transparent 55%)",
                }}
              />
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br ${color} text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] sm:h-14 sm:w-14 sm:rounded-2xl`}
                >
                  <Icon className="h-5 w-5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
                <p className="mt-3 text-sm text-slate-300">{desc}</p>
              </MotionLink>
            )
          })}
        </motion.section>

        <motion.footer
          variants={item}
          className="rounded-[28px] border border-white/10 bg-white/10 px-7 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-6"
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
