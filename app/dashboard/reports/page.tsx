// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, QrCode, UtensilsCrossed, Eye, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function ReportsPage() {
  const [stats, setStats] = useState([
    { label: "Visite oggi", value: "0", delta: "Nessun traffico", icon: Eye },
    { label: "Scansioni QR", value: "0", delta: "Nessuna scansione", icon: QrCode },
    { label: "Menu attivi", value: "0", delta: "Nessun menu attivo", icon: UtensilsCrossed },
    { label: "Piatto piu visto", value: "Nessun dato", delta: "Nessuna classifica", icon: TrendingUp },
  ])
  const [topDishes, setTopDishes] = useState<Array<{ name: string; views: number; trend: string }>>([])
  const [weekly, setWeekly] = useState([
    { day: "L", value: 0 },
    { day: "M", value: 0 },
    { day: "M", value: 0 },
    { day: "G", value: 0 },
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
      const topDish =
        typeof summary.topDish === "string" && summary.topDish.trim() ? summary.topDish : "Nessun dato"

      setStats([
        { label: "Visite oggi", value: String(Number(summary.visitsToday || 0)), delta: "Menu aperto oggi", icon: Eye },
        {
          label: "Scansioni QR",
          value: String(Number(summary.qrScans || 0)),
          delta: "Sessioni uniche ultimi 30 giorni",
          icon: QrCode,
        },
        {
          label: "Menu attivi",
          value: String(Number(summary.activeMenus || 0)),
          delta: Number(summary.activeMenus || 0) > 0 ? "Pubblicati ora" : "Nessuna pubblicazione attiva",
          icon: UtensilsCrossed,
        },
        { label: "Piatto piu visto", value: topDish, delta: "Classifica mensile", icon: TrendingUp },
      ])

      setTopDishes(
        dishes.map((dish: { name?: string; views?: number }, index: number) => ({
          name: dish?.name || `Piatto ${index + 1}`,
          views: Number(dish?.views || 0),
          trend: index === 0 ? "Top attuale" : "In classifica",
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
              menuName: nextContext.topMenu.menuName || "Nessun dato",
              views: Number(nextContext.topMenu.views || 0),
            }
          : null,
        topDishByMenu: Array.isArray(nextContext?.topDishByMenu)
          ? nextContext.topDishByMenu.map((item: { menuName?: string; dishName?: string; views?: number }) => ({
              menuName: item?.menuName || "Menu",
              dishName: item?.dishName || "Nessun dato",
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
              source: item?.source || "Diretto / QR",
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
    <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#070f1c] to-[#03040a] p-4 text-white md:p-6">
      <motion.div variants={container} initial="hidden" animate="visible" className="mx-auto max-w-6xl space-y-8">
        <motion.div
          variants={card}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                Statistiche in tempo reale
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">Statistiche</h1>
              <p className="mt-2 text-sm text-slate-300 md:text-base">
                Controlla l'andamento del menu, le visite e i piatti piu visualizzati.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-widest text-slate-300">
              <BarChart3 className="h-4 w-4 text-emerald-300" />
              Ultimi 7 giorni
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
                <h2 className="text-lg font-semibold text-white">Andamento settimanale</h2>
                <p className="mt-1 text-sm text-slate-400">Visite per giorno</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Settimana attuale
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
                <h2 className="text-lg font-semibold text-white">Piatti piu visualizzati</h2>
                <p className="mt-1 text-sm text-slate-400">Top 4 del mese</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Aggiornato oggi
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {topDishes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1220] px-4 py-6 text-sm text-slate-400">
                  Non ci sono ancora abbastanza visualizzazioni per mostrare una classifica.
                </div>
              ) : (
                topDishes.map((dish) => (
                  <div
                    key={dish.name}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a1220] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{dish.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{dish.views} visualizzazioni</p>
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
                <h2 className="text-lg font-semibold text-white">Contesto delle performance</h2>
                <p className="mt-1 text-sm text-slate-400">Menu piu visto, fascia migliore e confronto tra periodi</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Menu piu visto</p>
                <p className="mt-3 text-lg font-semibold text-white">{analyticsContext.topMenu?.menuName || "Nessun dato"}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {analyticsContext.topMenu
                    ? `${analyticsContext.topMenu.views} visite in 30 giorni`
                    : "Ancora nessuna visita registrata"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Fascia con piu scansioni</p>
                <p className="mt-3 text-lg font-semibold text-white">{analyticsContext.peakHour?.label || "Nessun dato"}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {analyticsContext.peakHour
                    ? `${analyticsContext.peakHour.visits} aperture in questa fascia`
                    : "Non ci sono ancora abbastanza eventi"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Confronto 7 vs 30 giorni</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {analyticsContext.comparison
                    ? `${analyticsContext.comparison.scans7d} / ${analyticsContext.comparison.scans30d}`
                    : "Nessun dato"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {analyticsContext.comparison
                    ? "Scansioni uniche in 7 giorni rispetto a 30 giorni"
                    : "In attesa di attivita per confrontare i periodi"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Periodo precedente</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {analyticsContext.comparison
                    ? `${analyticsContext.comparison.scansPrev7d} / ${analyticsContext.comparison.scansPrev30d}`
                    : "Nessun dato"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {analyticsContext.comparison
                    ? "Scansioni uniche del periodo precedente di riferimento"
                    : "Nessuna base storica disponibile"}
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
                <h2 className="text-lg font-semibold text-white">Origine del traffico</h2>
                <p className="mt-1 text-sm text-slate-400">Origine principale delle aperture del menu</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {analyticsContext.trafficSources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1220] px-4 py-6 text-sm text-slate-400">
                  Non ci sono ancora abbastanza riferimenti per identificare le fonti di traffico.
                </div>
              ) : (
                analyticsContext.trafficSources.map((source) => (
                  <div
                    key={source.source}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a1220] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-white">{source.source}</p>
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {source.visits} visite
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
              <h2 className="text-lg font-semibold text-white">Piatto piu visto per menu</h2>
              <p className="mt-1 text-sm text-slate-400">Quale piatto guida l'interesse all'interno di ogni menu</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {analyticsContext.topDishByMenu.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a1220] px-4 py-6 text-sm text-slate-400 md:col-span-2">
                Non ci sono ancora abbastanza visualizzazioni per segmentare per menu.
              </div>
            ) : (
              analyticsContext.topDishByMenu.map((item) => (
                <div key={`${item.menuName}-${item.dishName}`} className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">{item.menuName}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.dishName}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.views} visualizzazioni del piatto</p>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
