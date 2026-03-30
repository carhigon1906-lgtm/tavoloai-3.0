// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, QrCode, UtensilsCrossed, Eye, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function ReportsPage() {
  const [stats, setStats] = useState([
    { label: "Visitas hoy", value: "0", delta: "Sin tráfico", icon: Eye },
    { label: "Escaneos QR", value: "0", delta: "Sin escaneos", icon: QrCode },
    { label: "Menús activos", value: "0", delta: "Sin menús activos", icon: UtensilsCrossed },
    { label: "Plato más visto", value: "Sin datos", delta: "Aún sin ranking", icon: TrendingUp },
  ])
  const [topDishes, setTopDishes] = useState<Array<{ name: string; views: number; trend: string }>>([])
  const [weekly, setWeekly] = useState([
    { day: "L", value: 0 },
    { day: "M", value: 0 },
    { day: "X", value: 0 },
    { day: "J", value: 0 },
    { day: "V", value: 0 },
    { day: "S", value: 0 },
    { day: "D", value: 0 },
  ])
  const [analyticsContext, setAnalyticsContext] = useState<{
    topMenu: { menuName: string; views: number } | null
    topDishByMenu: Array<{ menuName: string; dishName: string; views: number }>
    peakHour: { label: string; visits: number } | null
    trafficSources: Array<{ source: string; visits: number }>
    comparison: { scans7d: number; scans30d: number; scansPrev7d: number; scansPrev30d: number } | null
  }>({
    topMenu: null,
    topDishByMenu: [],
    peakHour: null,
    trafficSources: [],
    comparison: null,
  })

  useEffect(() => {
    const loadAnalytics = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) return

      const response = await fetch("/api/analytics/summary", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) return

      const payload = await response.json()
      const summary = payload?.stats || {}
      const dishes = Array.isArray(payload?.topDishes) ? payload.topDishes : []
      const weeklyRows = Array.isArray(payload?.weekly) ? payload.weekly : []
      const nextContext = payload?.context || {}
      const topDish = typeof summary.topDish === "string" && summary.topDish.trim() ? summary.topDish : "Sin datos"

      setStats([
        { label: "Visitas hoy", value: String(Number(summary.visitsToday || 0)), delta: "Menú abierto hoy", icon: Eye },
        { label: "Escaneos QR", value: String(Number(summary.qrScans || 0)), delta: "Sesiones únicas 30 días", icon: QrCode },
        {
          label: "Menús activos",
          value: String(Number(summary.activeMenus || 0)),
          delta: Number(summary.activeMenus || 0) > 0 ? "Publicados ahora" : "Sin publicaciones activas",
          icon: UtensilsCrossed,
        },
        { label: "Plato más visto", value: topDish, delta: "Ranking mensual", icon: TrendingUp },
      ])

      setTopDishes(
        dishes.map((dish: { name?: string; views?: number }, index: number) => ({
          name: dish?.name || `Plato ${index + 1}`,
          views: Number(dish?.views || 0),
          trend: index === 0 ? "Top actual" : "En ranking",
        })),
      )

      if (weeklyRows.length > 0) {
        setWeekly(
          weeklyRows.map((row: { day?: string; value?: number }) => ({
            day: row?.day?.slice(0, 1) || "",
            value: Number(row?.value || 0),
          })),
        )
      }

      setAnalyticsContext({
        topMenu: nextContext?.topMenu
          ? {
              menuName: nextContext.topMenu.menuName || "Sin datos",
              views: Number(nextContext.topMenu.views || 0),
            }
          : null,
        topDishByMenu: Array.isArray(nextContext?.topDishByMenu)
          ? nextContext.topDishByMenu.map((item: { menuName?: string; dishName?: string; views?: number }) => ({
              menuName: item?.menuName || "Menu",
              dishName: item?.dishName || "Sin datos",
              views: Number(item?.views || 0),
            }))
          : [],
        peakHour: nextContext?.peakHour
          ? {
              label: nextContext.peakHour.label || "00:00",
              visits: Number(nextContext.peakHour.visits || 0),
            }
          : null,
        trafficSources: Array.isArray(nextContext?.trafficSources)
          ? nextContext.trafficSources.map((item: { source?: string; visits?: number }) => ({
              source: item?.source || "Directo / QR",
              visits: Number(item?.visits || 0),
            }))
          : [],
        comparison: nextContext?.comparison
          ? {
              scans7d: Number(nextContext.comparison.scans7d || 0),
              scans30d: Number(nextContext.comparison.scans30d || 0),
              scansPrev7d: Number(nextContext.comparison.scansPrev7d || 0),
              scansPrev30d: Number(nextContext.comparison.scansPrev30d || 0),
            }
          : null,
      })
    }

    loadAnalytics()
  }, [])

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

  const maxWeekly = Math.max(...weekly.map((item) => item.value), 1)

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
              {weekly.map(({ day, value }, index) => (
                <div key={`${day}-${index}`} className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-emerald-100">{value}</span>
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-emerald-500/80 via-emerald-300/60 to-emerald-100/30 shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
                    style={{ height: `${Math.max(24, (value / maxWeekly) * 100)}%` }}
                  />
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">{day}</span>
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
              {topDishes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1220] px-4 py-6 text-sm text-slate-400">
                  Aún no hay suficientes visualizaciones de platos para mostrar un ranking.
                </div>
              ) : (
                topDishes.map((dish) => (
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
                ))
              )}
            </div>
          </motion.section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.section
            variants={card}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Contexto de rendimiento</h2>
                <p className="mt-1 text-sm text-slate-400">Menu más visto, horario pico y comparación de periodos</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Menu mas visto</p>
                <p className="mt-3 text-lg font-semibold text-white">{analyticsContext.topMenu?.menuName || "Sin datos"}</p>
                <p className="mt-1 text-sm text-slate-400">{analyticsContext.topMenu ? `${analyticsContext.topMenu.views} visitas en 30 dias` : "Aun sin visitas registradas"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Horario con mas escaneos</p>
                <p className="mt-3 text-lg font-semibold text-white">{analyticsContext.peakHour?.label || "Sin datos"}</p>
                <p className="mt-1 text-sm text-slate-400">{analyticsContext.peakHour ? `${analyticsContext.peakHour.visits} aperturas en la franja` : "Aun no hay suficientes eventos"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Comparacion 7 vs 30 dias</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {analyticsContext.comparison ? `${analyticsContext.comparison.scans7d} / ${analyticsContext.comparison.scans30d}` : "Sin datos"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {analyticsContext.comparison
                    ? `Escaneos unicos en 7 dias frente a 30 dias`
                    : "Esperando actividad para comparar periodos"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Periodo anterior</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {analyticsContext.comparison ? `${analyticsContext.comparison.scansPrev7d} / ${analyticsContext.comparison.scansPrev30d}` : "Sin datos"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {analyticsContext.comparison
                    ? `Escaneos unicos del periodo previo de referencia`
                    : "Sin base historica para comparar"}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={card}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Fuente de trafico</h2>
                <p className="mt-1 text-sm text-slate-400">Origen principal de aperturas del menu</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {analyticsContext.trafficSources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1220] px-4 py-6 text-sm text-slate-400">
                  Aun no hay suficientes referencias para identificar fuentes de trafico.
                </div>
              ) : (
                analyticsContext.trafficSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a1220] px-4 py-3">
                    <p className="text-sm font-semibold text-white">{source.source}</p>
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {source.visits} visitas
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        <motion.section
          variants={card}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Plato mas visto por menu</h2>
              <p className="mt-1 text-sm text-slate-400">Que plato lidera el interes dentro de cada menu</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {analyticsContext.topDishByMenu.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1220] px-4 py-6 text-sm text-slate-400 md:col-span-2">
                Aun no hay suficientes visualizaciones de platos para segmentar por menu.
              </div>
            ) : (
              analyticsContext.topDishByMenu.map((item) => (
                <div key={`${item.menuName}-${item.dishName}`} className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">{item.menuName}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.dishName}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.views} visualizaciones del plato</p>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
