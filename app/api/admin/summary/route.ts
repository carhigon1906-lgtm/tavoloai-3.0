import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { isAdminEmail } from "@/lib/adminAccess"

type AuthUser = {
  id: string
  email?: string | null
  created_at?: string
  user_metadata?: {
    business?: string
    name?: string
  } | null
}

type MenuRow = {
  id: number | string
  user_id: string
  activo?: boolean | null
}

type EventRow = {
  id: number | string
  user_id: string
  session_id?: string | null
  referrer?: string | null
  created_at: string
}

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function getDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

function daysAgo(days: number) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function createEmptyDaily() {
  const result: Array<{ day: string; accounts: number; scans: number; visitors: number }> = []

  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = daysAgo(offset)
    result.push({
      day: date.toISOString().slice(0, 10),
      accounts: 0,
      scans: 0,
      visitors: 0,
    })
  }

  return result
}

function classifyTrafficSource(referrer?: string | null) {
  const clean = (referrer || "").trim().toLowerCase()
  if (!clean) return "Directo / QR"
  if (clean.includes("instagram")) return "Instagram"
  if (clean.includes("facebook")) return "Facebook"
  if (clean.includes("whatsapp") || clean.includes("wa.me")) return "WhatsApp"
  if (clean.includes("google")) return "Google"
  if (clean.includes("tiktok")) return "TikTok"

  try {
    return new URL(referrer || "").hostname.replace(/^www\./i, "") || "Referido"
  } catch {
    return "Referido"
  }
}

function uniqueSessions(events: EventRow[]) {
  return new Set(
    events.map((event) => {
      const sessionId = (event.session_id || "").trim()
      return sessionId || `anon-${event.id}`
    }),
  ).size
}

function buildDemoPayload() {
  const daily = createEmptyDaily().map((entry, index) => ({
    day: entry.day,
    accounts: [1, 0, 2, 1, 2, 1, 3, 2, 1, 4, 2, 3, 2, 5][index],
    scans: [8, 12, 10, 16, 14, 18, 24, 22, 20, 30, 28, 34, 32, 38][index],
    visitors: [6, 9, 8, 12, 11, 15, 19, 18, 16, 24, 23, 26, 25, 29][index],
  }))

  return {
    overview: {
      totalAccounts: 24,
      newAccounts7d: 9,
      newAccounts30d: 18,
      totalMenus: 31,
      activeMenus: 22,
      scans24h: 38,
      scans7d: 207,
      scans30d: 812,
      visitors24h: 29,
      visitors7d: 156,
      visitors30d: 403,
      activeBusinesses7d: 11,
      activeBusinesses30d: 17,
      stickiness: 39,
    },
    comparisons: {
      accounts30dDelta: 24,
      scans30dDelta: 18,
      visitors30dDelta: 15,
      activeBusinesses30dDelta: 12,
      stickinessDelta: 6,
    },
    health: {
      growthScore: 78,
      activationScore: 71,
      engagementScore: 74,
    },
    daily,
    topBusinesses: [
      { userId: "demo-1", email: "roma@example.com", business: "Roma Burger", menusTotal: 4, activeMenus: 3, scans30d: 148, visitors30d: 87 },
      { userId: "demo-2", email: "brasa@example.com", business: "La Brasa House", menusTotal: 3, activeMenus: 3, scans30d: 123, visitors30d: 76 },
      { userId: "demo-3", email: "mar@example.com", business: "Costa y Mar", menusTotal: 2, activeMenus: 2, scans30d: 94, visitors30d: 58 },
    ],
    recentUsers: [
      { id: "demo-u1", email: "nuevo1@example.com", business: "Burger Point", createdAt: new Date().toISOString() },
      { id: "demo-u2", email: "nuevo2@example.com", business: "Pizza Nova", createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { id: "demo-u3", email: "nuevo3@example.com", business: "Taco Lab", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    ],
    trafficSources: [
      { source: "Directo / QR", visits: 356 },
      { source: "Instagram", visits: 171 },
      { source: "WhatsApp", visits: 108 },
      { source: "Google", visits: 92 },
    ],
    generatedAt: new Date().toISOString(),
  }
}

async function listAllUsers() {
  const users: AuthUser[] = []
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabaseAdmin!.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const batch = Array.isArray(data?.users) ? (data.users as AuthUser[]) : []
    users.push(...batch)

    if (batch.length < perPage) break
    page += 1
  }

  return users
}

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin no configurado." }, { status: 500 })
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
  if (!bearer) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(bearer)

  if (userError || !user) {
    return NextResponse.json({ error: "Sesion invalida." }, { status: 401 })
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  }

  try {
    const [users, menusResult, eventsResult] = await Promise.all([
      listAllUsers(),
      supabaseAdmin.from("menus").select("id, user_id, activo"),
      supabaseAdmin
        .from("menu_analytics_events")
        .select("id, user_id, session_id, referrer, created_at, event_type")
        .eq("event_type", "menu_view")
        .order("created_at", { ascending: false })
        .limit(5000),
    ])

    if (menusResult.error) throw menusResult.error
    if (eventsResult.error) throw eventsResult.error

    const menus = (menusResult.data || []) as MenuRow[]
    const allEvents = (eventsResult.data || []) as EventRow[]

    if (users.length <= 1 && menus.length === 0 && allEvents.length === 0) {
      return NextResponse.json(buildDemoPayload())
    }

    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const events24h = allEvents.filter((event) => now - new Date(event.created_at).getTime() <= dayMs)
    const events7d = allEvents.filter((event) => now - new Date(event.created_at).getTime() <= 7 * dayMs)
    const events30d = allEvents.filter((event) => now - new Date(event.created_at).getTime() <= 30 * dayMs)
    const eventsPrev30d = allEvents.filter((event) => {
      const age = now - new Date(event.created_at).getTime()
      return age > 30 * dayMs && age <= 60 * dayMs
    })

    const users7d = users.filter((entry) => entry.created_at && now - new Date(entry.created_at).getTime() <= 7 * dayMs)
    const users30d = users.filter((entry) => entry.created_at && now - new Date(entry.created_at).getTime() <= 30 * dayMs)
    const usersPrev30d = users.filter((entry) => {
      if (!entry.created_at) return false
      const age = now - new Date(entry.created_at).getTime()
      return age > 30 * dayMs && age <= 60 * dayMs
    })
    const activeMenus = menus.filter((menu) => !!menu.activo)

    const usersMap = new Map(
      users.map((entry) => [
        entry.id,
        {
          email: entry.email || "Sin email",
          business: entry.user_metadata?.business || entry.user_metadata?.name || entry.email || "Negocio sin nombre",
          createdAt: entry.created_at || new Date().toISOString(),
        },
      ]),
    )

    const trafficMap = new Map<string, number>()
    events30d.forEach((event) => {
      const source = classifyTrafficSource(event.referrer)
      trafficMap.set(source, (trafficMap.get(source) || 0) + 1)
    })

    const byUser = new Map<string, { menusTotal: number; activeMenus: number; scans30d: number; visitors30d: Set<string> }>()
    menus.forEach((menu) => {
      const current = byUser.get(menu.user_id) || { menusTotal: 0, activeMenus: 0, scans30d: 0, visitors30d: new Set<string>() }
      current.menusTotal += 1
      if (menu.activo) current.activeMenus += 1
      byUser.set(menu.user_id, current)
    })

    events30d.forEach((event) => {
      const current = byUser.get(event.user_id) || { menusTotal: 0, activeMenus: 0, scans30d: 0, visitors30d: new Set<string>() }
      current.scans30d += 1
      current.visitors30d.add((event.session_id || "").trim() || `anon-${event.id}`)
      byUser.set(event.user_id, current)
    })

    const dailyMap = new Map(createEmptyDaily().map((entry) => [entry.day, { ...entry }]))
    users.forEach((entry) => {
      if (!entry.created_at) return
      const key = getDayKey(entry.created_at)
      const day = dailyMap.get(key)
      if (day) day.accounts += 1
    })
    allEvents.forEach((event) => {
      const key = getDayKey(event.created_at)
      const day = dailyMap.get(key)
      if (day) day.scans += 1
    })
    createEmptyDaily().forEach((entry) => {
      const dayEvents = allEvents.filter((event) => getDayKey(event.created_at) === entry.day)
      const day = dailyMap.get(entry.day)
      if (day) day.visitors = uniqueSessions(dayEvents)
    })

    const topBusinesses = Array.from(byUser.entries())
      .map(([userId, metrics]) => ({
        userId,
        email: usersMap.get(userId)?.email || "Sin email",
        business: usersMap.get(userId)?.business || "Negocio sin nombre",
        menusTotal: metrics.menusTotal,
        activeMenus: metrics.activeMenus,
        scans30d: metrics.scans30d,
        visitors30d: metrics.visitors30d.size,
      }))
      .sort((a, b) => b.scans30d - a.scans30d || b.visitors30d - a.visitors30d)
      .slice(0, 6)

    const recentUsers = users
      .slice()
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 8)
      .map((entry) => ({
        id: entry.id,
        email: entry.email || "Sin email",
        business: entry.user_metadata?.business || entry.user_metadata?.name || entry.email || "Usuario sin nombre",
        createdAt: entry.created_at || new Date().toISOString(),
      }))

    const trafficSources = Array.from(trafficMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([source, visits]) => ({ source, visits }))

    const visitors7d = uniqueSessions(events7d)
    const visitors30d = uniqueSessions(events30d)
    const visitorsPrev30d = uniqueSessions(eventsPrev30d)
    const activeBusinessesPrev30d = new Set(eventsPrev30d.map((event) => event.user_id)).size
    const stickiness = visitors30d > 0 ? Math.round((visitors7d / visitors30d) * 100) : 0
    const stickinessPrev = visitorsPrev30d > 0 ? Math.round((uniqueSessions(eventsPrev30d.filter((event) => now - new Date(event.created_at).getTime() <= 37 * dayMs && now - new Date(event.created_at).getTime() > 30 * dayMs)) / visitorsPrev30d) * 100) : 0

    const activationRate = menus.length > 0 ? Math.round((activeMenus.length / menus.length) * 100) : 0
    const growthRate = users.length > 0 ? Math.min(100, Math.round((users30d.length / users.length) * 100)) : 0
    const engagementRate = events30d.length > 0 ? Math.min(100, Math.round((visitors30d / events30d.length) * 100)) : 0

    return NextResponse.json({
      overview: {
        totalAccounts: users.length,
        newAccounts7d: users7d.length,
        newAccounts30d: users30d.length,
        totalMenus: menus.length,
        activeMenus: activeMenus.length,
        scans24h: events24h.length,
        scans7d: events7d.length,
        scans30d: events30d.length,
        visitors24h: uniqueSessions(events24h),
        visitors7d,
        visitors30d,
        activeBusinesses7d: new Set(events7d.map((event) => event.user_id)).size,
        activeBusinesses30d: new Set(events30d.map((event) => event.user_id)).size,
        stickiness,
      },
      comparisons: {
        accounts30dDelta: pctChange(users30d.length, usersPrev30d.length),
        scans30dDelta: pctChange(events30d.length, eventsPrev30d.length),
        visitors30dDelta: pctChange(visitors30d, visitorsPrev30d),
        activeBusinesses30dDelta: pctChange(new Set(events30d.map((event) => event.user_id)).size, activeBusinessesPrev30d),
        stickinessDelta: stickiness - stickinessPrev,
      },
      health: {
        growthScore: growthRate,
        activationScore: activationRate,
        engagementScore: engagementRate,
      },
      daily: Array.from(dailyMap.values()),
      topBusinesses,
      recentUsers,
      trafficSources,
      generatedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(buildDemoPayload())
  }
}
