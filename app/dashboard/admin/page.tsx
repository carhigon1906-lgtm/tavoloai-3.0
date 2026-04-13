// @ts-nocheck
"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  BarChart3,
  Building2,
  CircleGauge,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  MenuSquare,
  Radar,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import RequireAdmin from "@/components/guards/RequireAdmin"

type AdminPayload = {
  overview: {
    totalAccounts: number
    newAccounts7d: number
    newAccounts30d: number
    totalMenus: number
    activeMenus: number
    scans24h: number
    scans7d: number
    scans30d: number
    visitors24h: number
    visitors7d: number
    visitors30d: number
    activeBusinesses7d: number
    activeBusinesses30d: number
    stickiness: number
  }
  comparisons: {
    accounts30dDelta: number
    scans30dDelta: number
    visitors30dDelta: number
    activeBusinesses30dDelta: number
    stickinessDelta: number
  }
  health: {
    growthScore: number
    activationScore: number
    engagementScore: number
  }
  daily: Array<{ day: string; accounts: number; scans: number; visitors: number }>
  topBusinesses: Array<{
    userId: string
    email: string
    business: string
    menusTotal: number
    activeMenus: number
    scans30d: number
    visitors30d: number
  }>
  recentUsers: Array<{ id: string; email: string; business: string; createdAt: string }>
  trafficSources: Array<{ source: string; visits: number }>
  generatedAt: string
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const emptyPayload: AdminPayload = {
  overview: {
    totalAccounts: 0,
    newAccounts7d: 0,
    newAccounts30d: 0,
    totalMenus: 0,
    activeMenus: 0,
    scans24h: 0,
    scans7d: 0,
    scans30d: 0,
    visitors24h: 0,
    visitors7d: 0,
    visitors30d: 0,
    activeBusinesses7d: 0,
    activeBusinesses30d: 0,
    stickiness: 0,
  },
  comparisons: {
    accounts30dDelta: 0,
    scans30dDelta: 0,
    visitors30dDelta: 0,
    activeBusinesses30dDelta: 0,
    stickinessDelta: 0,
  },
  health: {
    growthScore: 0,
    activationScore: 0,
    engagementScore: 0,
  },
  daily: [],
  topBusinesses: [],
  recentUsers: [],
  trafficSources: [],
  generatedAt: "",
}

function MetricCard({
  icon: Icon,
  title,
  value,
  detail,
  delta,
}: {
  icon: any
  title: string
  value: string | number
  detail: string
  delta: number
}) {
  const positive = delta >= 0
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_55px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <div
            className={`mt-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              positive
                ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                : "border-rose-300/20 bg-rose-400/10 text-rose-200"
            }`}
          >
            {positive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {Math.abs(delta)}% vs periodo previo
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-cyan-400/10">
          <Icon className="h-5 w-5 text-cyan-100" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">{detail}</p>
    </div>
  )
}

function scoreTone(value: number) {
  if (value >= 75) return "from-emerald-300 to-cyan-300"
  if (value >= 55) return "from-amber-300 to-yellow-300"
  return "from-rose-300 to-orange-300"
}

function scoreLabel(value: number) {
  if (value >= 75) return "Forte"
  if (value >= 55) return "Stabile"
  return "Debole"
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminPayload>(emptyPayload)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        if (active) {
          setError("Non è stato possibile verificare la sessione.")
          setLoading(false)
        }
        return
      }

      const response = await fetch("/api/admin/summary", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        if (active) {
          setError(payload?.error || "Non è stato possibile caricare il pannello admin.")
          setLoading(false)
        }
        return
      }

      if (active) {
        setData(payload || emptyPayload)
        setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const chartMax = useMemo(() => {
    const values = data.daily.flatMap((entry) => [entry.scans, entry.visitors, entry.accounts])
    return Math.max(...values, 1)
  }, [data.daily])

  const activationRate = data.overview.totalMenus > 0
    ? Math.round((data.overview.activeMenus / data.overview.totalMenus) * 100)
    : 0
  const accountGrowthRate = data.overview.totalAccounts > 0
    ? Math.round((data.overview.newAccounts30d / data.overview.totalAccounts) * 100)
    : 0
  const visitorMix = data.overview.scans30d > 0
    ? Math.round((data.overview.visitors30d / data.overview.scans30d) * 100)
    : 0
  const linePoints = data.daily
    .map((entry, index) => {
      const x = data.daily.length <= 1 ? 0 : (index / (data.daily.length - 1)) * 100
      const y = 100 - (entry.scans / chartMax) * 100
      return `${x},${Number.isFinite(y) ? y : 100}`
    })
    .join(" ")

  return (
    <RequireAdmin>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04060d] via-[#07111c] to-[#03050b] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_52%_100%,rgba(14,165,233,0.12),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-1 py-2"
        >
          <motion.section
            variants={item}
            className="overflow-hidden rounded-[34px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(10,18,31,0.98),rgba(7,18,29,0.92)_55%,rgba(8,95,111,0.42))] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.48)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.22),transparent_24%),radial-gradient(circle_at_18%_78%,rgba(16,185,129,0.14),transparent_28%)]" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">
                  <Shield className="h-3.5 w-3.5" />
                  Control Admin
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Estado general de la plataforma
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Lectura ejecutiva de TavoloAI con crecimiento, adopcion, actividad comercial y negocios con mayor traccion.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Crecimiento</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{accountGrowthRate}%</div>
                    <div className="mt-1 text-xs text-slate-400">de las cuentas llegaron en los ultimos 30 dias</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Activacion</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{activationRate}%</div>
                    <div className="mt-1 text-xs text-slate-400">de los menus registrados siguen activos</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Calidad de trafico</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{visitorMix}%</div>
                    <div className="mt-1 text-xs text-slate-400">de los scans del mes provienen de visitantes unicos</div>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-black/25 p-5 text-sm text-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Ultima actualizacion</div>
                <div className="mt-2 font-medium text-white">
                  {data.generatedAt
                    ? new Date(data.generatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
                    : "Cargando..."}
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-slate-400">Negocios activos 30d</span>
                    <span className="font-semibold text-emerald-100">{data.overview.activeBusinesses30d.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-slate-400">Scans mensuales</span>
                    <span className="font-semibold text-cyan-100">{data.overview.scans30d.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-slate-400">Visitantes mensuales</span>
                    <span className="font-semibold text-white">{data.overview.visitors30d.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {loading ? (
            <motion.div
              variants={item}
              className="rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-12 text-center text-slate-300"
            >
              Cargando estadisticas globales...
            </motion.div>
          ) : error ? (
            <motion.div
              variants={item}
              className="rounded-[28px] border border-red-300/20 bg-red-500/10 px-6 py-12 text-center text-red-100"
            >
              {error}
            </motion.div>
          ) : (
            <>
              <motion.section variants={item} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={Users}
                  title="Cuentas Totales"
                  value={data.overview.totalAccounts}
                  detail={`${data.overview.newAccounts7d} nuevas en 7 dias y ${data.overview.newAccounts30d} nuevas en 30 dias`}
                  delta={data.comparisons.accounts30dDelta}
                />
                <MetricCard
                  icon={MenuSquare}
                  title="Menus Activos"
                  value={data.overview.activeMenus}
                  detail={`${data.overview.activeMenus} activos sobre ${data.overview.totalMenus} creados`}
                  delta={data.comparisons.activeBusinesses30dDelta}
                />
                <MetricCard
                  icon={Activity}
                  title="Visitantes Unicos"
                  value={data.overview.visitors30d}
                  detail={`${data.overview.visitors24h} en 24h y ${data.overview.visitors7d} en los ultimos 7 dias`}
                  delta={data.comparisons.visitors30dDelta}
                />
                <MetricCard
                  icon={CircleGauge}
                  title="Stickiness"
                  value={`${data.overview.stickiness}%`}
                  detail={`${data.overview.activeBusinesses30d} negocios generaron actividad en 30 dias`}
                  delta={data.comparisons.stickinessDelta}
                />
              </motion.section>

              <motion.section variants={item} className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.55fr]">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Pulso diario</h2>
                      <p className="mt-1 text-sm text-slate-400">Evolucion de adquisicion, trafico y visitas unicas durante las ultimas dos semanas.</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      Ultimos 14 dias
                    </div>
                  </div>

                  <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Scans 30d</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{data.overview.scans30d.toLocaleString()}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Delta mensual</div>
                      <div className={`mt-2 text-2xl font-semibold ${data.comparisons.scans30dDelta >= 0 ? "text-emerald-200" : "text-rose-200"}`}>
                        {data.comparisons.scans30dDelta >= 0 ? "+" : ""}{data.comparisons.scans30dDelta}%
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Visitantes</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{data.overview.visitors30d.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="relative mb-6 h-28 overflow-hidden rounded-[24px] border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(8,145,178,0.12),rgba(255,255,255,0.02))] px-4 py-4">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                      <defs>
                        <linearGradient id="adminScansLine" x1="0%" x2="100%" y1="0%" y2="0%">
                          <stop offset="0%" stopColor="rgba(34,211,238,0.85)" />
                          <stop offset="100%" stopColor="rgba(16,185,129,0.85)" />
                        </linearGradient>
                      </defs>
                      <polyline
                        fill="none"
                        stroke="url(#adminScansLine)"
                        strokeWidth="2.5"
                        points={linePoints}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    <div className="relative z-10 flex h-full items-end justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      <span>{data.daily[0] ? new Date(`${data.daily[0].day}T00:00:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) : ""}</span>
                      <span>Tendencia</span>
                      <span>{data.daily[data.daily.length - 1] ? new Date(`${data.daily[data.daily.length - 1].day}T00:00:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) : ""}</span>
                    </div>
                  </div>

                  <div className="grid h-72 grid-cols-14 items-end gap-2">
                    {data.daily.map((entry) => (
                      <div key={entry.day} className="flex h-full flex-col items-center justify-end gap-2">
                        <div className="flex h-full w-full items-end justify-center gap-1">
                          <div
                            className="w-2 rounded-t-full bg-cyan-300/85"
                            style={{ height: `${Math.max(10, (entry.scans / chartMax) * 100)}%` }}
                            title={`Scans: ${entry.scans}`}
                          />
                          <div
                            className="w-2 rounded-t-full bg-emerald-300/85"
                            style={{ height: `${Math.max(10, (entry.visitors / chartMax) * 100)}%` }}
                            title={`Visitantes: ${entry.visitors}`}
                          />
                          <div
                            className="w-2 rounded-t-full bg-violet-300/85"
                            style={{ height: `${Math.max(10, (entry.accounts / chartMax) * 100)}%` }}
                            title={`Registros: ${entry.accounts}`}
                          />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {new Date(`${entry.day}T00:00:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                      Scans QR
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                      Visitantes unicos
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
                      Nuevas cuentas
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Salud de plataforma</h2>
                      <HeartPulse className="h-4 w-4 text-cyan-200" />
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Crecimiento", value: data.health.growthScore },
                        { label: "Activacion", value: data.health.activationScore },
                        { label: "Engagement", value: data.health.engagementScore },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="flex items-center justify-between text-sm text-slate-300">
                            <span>{metric.label}</span>
                            <span className="font-medium text-white">{scoreLabel(metric.value)} · {metric.value}/100</span>
                          </div>
                          <div className="mt-2 h-2.5 rounded-full bg-white/10">
                            <div
                              className={`h-2.5 rounded-full bg-gradient-to-r ${scoreTone(metric.value)}`}
                              style={{ width: `${Math.max(6, metric.value)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
                      <TrendingUp className="h-4 w-4 text-emerald-200" />
                    </div>
                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.26em] text-slate-500">Scans 24h</div>
                        <div className="mt-1 text-3xl font-semibold text-white">{data.overview.scans24h.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.26em] text-slate-500">Scans 7 dias</div>
                        <div className="mt-1 text-2xl font-semibold text-cyan-100">{data.overview.scans7d.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.26em] text-slate-500">Negocios activos 7 dias</div>
                        <div className="mt-1 text-2xl font-semibold text-emerald-100">
                          {data.overview.activeBusinesses7d.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.26em] text-slate-500">Menus activos</div>
                        <div className="mt-1 text-2xl font-semibold text-white">{data.overview.activeMenus.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Origen del trafico</h2>
                      <BarChart3 className="h-4 w-4 text-cyan-200" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {data.trafficSources.length === 0 && <p className="text-sm text-slate-400">Aun no hay datos.</p>}
                      {data.trafficSources.map((source) => {
                        const width = data.overview.scans30d > 0 ? Math.max(8, Math.round((source.visits / data.overview.scans30d) * 100)) : 8
                        return (
                          <div key={source.source}>
                            <div className="flex items-center justify-between text-sm text-slate-300">
                              <span>{source.source}</span>
                              <span className="font-medium text-white">{source.visits.toLocaleString()}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/10">
                              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${width}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={item} className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Negocios con mayor traccion</h2>
                    <Building2 className="h-4 w-4 text-cyan-100" />
                  </div>
                  <div className="mt-6 overflow-hidden rounded-[22px] border border-white/10">
                    <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.7fr] bg-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      <span>Negocio</span>
                      <span>Menus</span>
                      <span>Scans</span>
                      <span>Visitors</span>
                    </div>
                    <div className="divide-y divide-white/10">
                      {data.topBusinesses.length === 0 && (
                        <div className="px-4 py-6 text-sm text-slate-400">Todavia no hay negocios con actividad.</div>
                      )}
                      {data.topBusinesses.map((business) => (
                        <div key={business.userId} className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.7fr] items-center px-4 py-4 text-sm">
                          <div className="min-w-0 pr-3">
                            <div className="truncate font-medium text-white">{business.business}</div>
                            <div className="truncate text-xs text-slate-400">{business.email}</div>
                          </div>
                          <span className="text-slate-300">{business.activeMenus}/{business.menusTotal}</span>
                          <span className="font-medium text-cyan-100">{business.scans30d.toLocaleString()}</span>
                          <span className="text-emerald-100">{business.visitors30d.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">Altas recientes</h2>
                      <UserPlus className="h-4 w-4 text-violet-200" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {data.recentUsers.length === 0 && <p className="text-sm text-slate-400">Aun no hay cuentas registradas.</p>}
                      {data.recentUsers.map((user) => (
                        <div key={user.id} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
                          <div className="truncate font-medium text-white">{user.business}</div>
                          <div className="mt-1 truncate text-xs text-slate-400">{user.email}</div>
                          <div className="mt-2 text-xs text-cyan-100">
                            {new Date(user.createdAt).toLocaleString("es-CO", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">Radar ejecutivo</h2>
                      <Radar className="h-4 w-4 text-cyan-200" />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Growth</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{data.comparisons.accounts30dDelta >= 0 ? "+" : ""}{data.comparisons.accounts30dDelta}%</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Traffic</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{data.comparisons.scans30dDelta >= 0 ? "+" : ""}{data.comparisons.scans30dDelta}%</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Visitors</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{data.comparisons.visitors30dDelta >= 0 ? "+" : ""}{data.comparisons.visitors30dDelta}%</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Stickiness</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{data.comparisons.stickinessDelta >= 0 ? "+" : ""}{data.comparisons.stickinessDelta} pts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            </>
          )}
        </motion.div>
      </div>
    </RequireAdmin>
  )
}
