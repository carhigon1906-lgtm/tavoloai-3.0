import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

function startOfDayIso() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

function daysAgoIso(days: number) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  now.setDate(now.getDate() - days)
  return now.toISOString()
}

function formatDayLabel(date: Date) {
  return ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][date.getDay()] || ""
}

function formatHourLabel(hour: number) {
  const normalizedHour = ((hour % 24) + 24) % 24
  return `${String(normalizedHour).padStart(2, "0")}:00`
}

function getBogotaHour(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value))

  const hourPart = parts.find((part) => part.type === "hour")?.value || "00"
  return Number(hourPart)
}

function classifyTrafficSource(referrer?: string | null) {
  const cleanReferrer = (referrer || "").trim()
  if (!cleanReferrer) {
    return "Directo / QR"
  }

  try {
    const hostname = new URL(cleanReferrer).hostname.replace(/^www\./i, "").toLowerCase()

    if (hostname.includes("instagram")) return "Instagram"
    if (hostname.includes("facebook")) return "Facebook"
    if (hostname.includes("wa.me") || hostname.includes("whatsapp")) return "WhatsApp"
    if (hostname.includes("google")) return "Google"
    if (hostname.includes("tiktok")) return "TikTok"

    return hostname
  } catch {
    return "Directo / QR"
  }
}

function getPeriodBounds(days: number) {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - (days - 1))
  return {
    startIso: start.toISOString(),
    previousStartIso: new Date(start.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
    previousEndIso: start.toISOString(),
  }
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

  const period7 = getPeriodBounds(7)
  const period30 = getPeriodBounds(30)

  const [menusResult, userMenusResult, todayViewsResult, weeklyViewsResult, menuViews30Result, dishViews30Result, menuViews7Result, menuViewsPrev7Result, menuViewsPrev30Result] = await Promise.all([
    supabaseAdmin.from("menus").select("id, activo", { count: "exact", head: true }).eq("user_id", user.id).eq("activo", true),
    supabaseAdmin.from("menus").select("id, nombre, categories").eq("user_id", user.id),
    supabaseAdmin
      .from("menu_analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("event_type", "menu_view")
      .gte("created_at", startOfDayIso()),
    supabaseAdmin
      .from("menu_analytics_events")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("event_type", "menu_view")
      .gte("created_at", daysAgoIso(6)),
    supabaseAdmin
      .from("menu_analytics_events")
      .select("menu_id, session_id, referrer, created_at")
      .eq("user_id", user.id)
      .eq("event_type", "menu_view")
      .gte("created_at", period30.startIso),
    supabaseAdmin
      .from("menu_analytics_events")
      .select("menu_id, dish_id, created_at")
      .eq("user_id", user.id)
      .eq("event_type", "dish_view")
      .not("dish_id", "is", null)
      .gte("created_at", period30.startIso),
    supabaseAdmin
      .from("menu_analytics_events")
      .select("session_id")
      .eq("user_id", user.id)
      .eq("event_type", "menu_view")
      .gte("created_at", period7.startIso),
    supabaseAdmin
      .from("menu_analytics_events")
      .select("session_id")
      .eq("user_id", user.id)
      .eq("event_type", "menu_view")
      .gte("created_at", period7.previousStartIso)
      .lt("created_at", period7.previousEndIso),
    supabaseAdmin
      .from("menu_analytics_events")
      .select("session_id")
      .eq("user_id", user.id)
      .eq("event_type", "menu_view")
      .gte("created_at", period30.previousStartIso)
      .lt("created_at", period30.previousEndIso),
  ])

  const firstError =
    menusResult.error ||
    userMenusResult.error ||
    todayViewsResult.error ||
    weeklyViewsResult.error ||
    menuViews30Result.error ||
    dishViews30Result.error ||
    menuViews7Result.error ||
    menuViewsPrev7Result.error ||
    menuViewsPrev30Result.error

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 })
  }

  const userMenus = userMenusResult.data || []
  const qrScanSessions = new Set(
    (menuViews30Result.data || [])
      .map((row) => row.session_id)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  )

  const weeklyMap = new Map<string, number>()
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - i)
    weeklyMap.set(date.toISOString().slice(0, 10), 0)
  }

  for (const row of weeklyViewsResult.data || []) {
    const key = String(row.created_at).slice(0, 10)
    weeklyMap.set(key, (weeklyMap.get(key) || 0) + 1)
  }

  const weekly = Array.from(weeklyMap.entries()).map(([key, value]) => ({
    day: formatDayLabel(new Date(`${key}T00:00:00`)),
    value,
  }))

  const dishCountMap = new Map<string, number>()
  const menuCountMap = new Map<string, number>()
  const menuDishCountMap = new Map<string, Map<string, number>>()
  const hourCountMap = new Map<number, number>()
  const trafficSourceMap = new Map<string, number>()

  for (const row of menuViews30Result.data || []) {
    const menuId = row.menu_id != null ? String(row.menu_id) : ""
    if (menuId) {
      menuCountMap.set(menuId, (menuCountMap.get(menuId) || 0) + 1)
    }

    if (typeof row.created_at === "string") {
      const hour = getBogotaHour(row.created_at)
      hourCountMap.set(hour, (hourCountMap.get(hour) || 0) + 1)
    }

    const source = classifyTrafficSource(row.referrer)
    trafficSourceMap.set(source, (trafficSourceMap.get(source) || 0) + 1)
  }

  for (const row of dishViews30Result.data || []) {
    const dishId = row.dish_id ? String(row.dish_id) : ""
    const menuId = row.menu_id != null ? String(row.menu_id) : ""
    if (!dishId) continue

    dishCountMap.set(dishId, (dishCountMap.get(dishId) || 0) + 1)

    if (menuId) {
      const menuDishMap = menuDishCountMap.get(menuId) || new Map<string, number>()
      menuDishMap.set(dishId, (menuDishMap.get(dishId) || 0) + 1)
      menuDishCountMap.set(menuId, menuDishMap)
    }
  }

  const topDishEntries = Array.from(dishCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const menuNameMap = new Map<string, string>()
  const dishNameMap = new Map<string, string>()

  for (const menu of userMenus) {
    const menuId = menu?.id != null ? String(menu.id) : ""
    if (menuId && typeof menu?.nombre === "string" && menu.nombre.trim()) {
      menuNameMap.set(menuId, menu.nombre.trim())
    }

    const categories = Array.isArray(menu?.categories) ? menu.categories : []
    for (const category of categories) {
      const dishes = Array.isArray(category?.platos) ? category.platos : []
      for (const dish of dishes) {
        const dishId = dish?.id != null ? String(dish.id) : ""
        if (dishId && typeof dish?.nombre === "string" && dish.nombre.trim()) {
          dishNameMap.set(dishId, dish.nombre.trim())
        }
      }
    }
  }

  let topDishes: Array<{ name: string; views: number }> = []

  if (topDishEntries.length > 0) {
    topDishes = topDishEntries.map(([dishId, views]) => ({
      name: dishNameMap.get(dishId) || `Plato ${dishId}`,
      views,
    }))
  }

  const topMenuEntry = Array.from(menuCountMap.entries()).sort((a, b) => b[1] - a[1])[0]
  const peakHourEntry = Array.from(hourCountMap.entries()).sort((a, b) => b[1] - a[1])[0]
  const trafficSources = Array.from(trafficSourceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, visits]) => ({ source, visits }))

  const topDishByMenu = Array.from(menuDishCountMap.entries())
    .map(([menuId, dishMap]) => {
      const topDishEntry = Array.from(dishMap.entries()).sort((a, b) => b[1] - a[1])[0]
      if (!topDishEntry) return null

      return {
        menuId,
        menuName: menuNameMap.get(menuId) || `Menu ${menuId}`,
        dishName: dishNameMap.get(topDishEntry[0]) || `Plato ${topDishEntry[0]}`,
        views: topDishEntry[1],
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b?.views || 0) - (a?.views || 0))
    .slice(0, 4)

  const scans7d = new Set(
    (menuViews7Result.data || [])
      .map((row) => row.session_id)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  ).size

  const scansPrev7d = new Set(
    (menuViewsPrev7Result.data || [])
      .map((row) => row.session_id)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  ).size

  const scansPrev30d = new Set(
    (menuViewsPrev30Result.data || [])
      .map((row) => row.session_id)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  ).size

  return NextResponse.json({
    stats: {
      visitsToday: todayViewsResult.count || 0,
      qrScans: qrScanSessions.size,
      activeMenus: menusResult.count || 0,
      topDish: topDishes[0]?.name || "Sin datos",
    },
    weekly,
    topDishes,
    context: {
      topMenu: topMenuEntry
        ? {
            menuId: topMenuEntry[0],
            menuName: menuNameMap.get(topMenuEntry[0]) || `Menu ${topMenuEntry[0]}`,
            views: topMenuEntry[1],
          }
        : null,
      topDishByMenu,
      peakHour: peakHourEntry
        ? {
            label: formatHourLabel(peakHourEntry[0]),
            visits: peakHourEntry[1],
          }
        : null,
      trafficSources,
      comparison: {
        scans7d,
        scans30d: qrScanSessions.size,
        scansPrev7d,
        scansPrev30d,
      },
    },
  })
}
