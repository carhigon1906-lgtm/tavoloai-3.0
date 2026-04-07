// @ts-nocheck
"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  BarChart3,
  Building2,
  CircleGauge,
  MenuSquare,
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
}: {
  icon: any
  title: string
  value: string | number
  detail: string
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_55px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-cyan-400/10">
          <Icon className="h-5 w-5 text-cyan-100" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">{detail}</p>
    </div>
  )
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
          setError("No se pudo validar la sesion.")
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
          setError(payload?.error || "No se pudo cargar el panel admin.")
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

  return (
    <RequireAdmin>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04060d] via-[#07111c] to-[#03050b] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_52%_100%,rgba(14,165,233,0.12),transparent_30%)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-1 py-2"
        >
          <motion.section
            variants={item}
            className="rounded-[30px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(6,182,212,0.14),rgba(15,23,42,0.88))] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.48)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">
                  <Shield className="h-3.5 w-3.5" />
                  Admin privado
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Centro de control global
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Vista operativa de TavoloAI: cuentas creadas, negocios activos, scans QR y uso real de la plataforma.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Ultima actualizacion</div>
                <div className="mt-2 font-medium">
                  {data.generatedAt
                    ? new Date(data.generatedAt).toLocaleString("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Cargando..."}
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
                  title="Cuentas"
                  value={data.overview.totalAccounts}
                  detail={`+${data.overview.newAccounts7d} en 7 dias, +${data.overview.newAccounts30d} en 30 dias`}
                />
                <MetricCard
                  icon={MenuSquare}
                  title="Menus"
                  value={data.overview.totalMenus}
                  detail={`${data.overview.activeMenus} activos, ${activationRate}% de activacion`}
                />
                <MetricCard
                  icon={Activity}
                  title="Visitantes"
                  value={data.overview.visitors30d}
                  detail={`${data.overview.visitors24h} en 24h, ${data.overview.visitors7d} en 7 dias`}
                />
                <MetricCard
                  icon={CircleGauge}
                  title="Stickiness"
                  value={`${data.overview.stickiness}%`}
                  detail={`${data.overview.activeBusinesses30d} negocios activos en 30 dias`}
                />
              </motion.section>

              <motion.section variants={item} className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Pulso diario</h2>
                      <p className="mt-1 text-sm text-slate-400">Ultimos 14 dias de altas, scans y visitantes unicos.</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      Escala relativa
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
                    <h2 className="text-xl font-semibold text-white">Negocios con mas traccion</h2>
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

                <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Ultimos registros</h2>
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
              </motion.section>
            </>
          )}
        </motion.div>
      </div>
    </RequireAdmin>
  )
}
