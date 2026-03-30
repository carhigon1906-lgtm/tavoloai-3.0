import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

type TrackPayload = {
  menuId?: string | number
  eventType?: "menu_view" | "dish_view"
  dishId?: string | number | null
  sessionId?: string
  path?: string
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin no configurado." }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as TrackPayload | null
  const menuId = body?.menuId ? Number(body.menuId) : 0
  const eventType = body?.eventType

  if (!menuId || (eventType !== "menu_view" && eventType !== "dish_view")) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 })
  }

  const { data: menu, error: menuError } = await supabaseAdmin
    .from("menus")
    .select("id, user_id")
    .eq("id", menuId)
    .maybeSingle()

  if (menuError) {
    return NextResponse.json({ error: menuError.message }, { status: 500 })
  }

  if (!menu?.user_id) {
    return NextResponse.json({ error: "Menu no encontrado." }, { status: 404 })
  }

  const userAgent = request.headers.get("user-agent") || ""
  const referrer = request.headers.get("referer") || ""
  const path = body?.path?.slice(0, 240) || ""
  const sessionId = body?.sessionId?.slice(0, 120) || null
  const dishId = body?.dishId ? String(body.dishId).slice(0, 120) : null

  const { error } = await supabaseAdmin.from("menu_analytics_events").insert({
    user_id: menu.user_id,
    menu_id: menuId,
    event_type: eventType,
    dish_id: dishId,
    session_id: sessionId,
    path,
    user_agent: userAgent,
    referrer,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
