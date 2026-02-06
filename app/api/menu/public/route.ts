import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin no configurado." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const menuId = searchParams.get("menu")?.trim()

  let query = supabaseAdmin.from("menus").select("id, logo_url, nombre, categories, activo, created_at")
  if (menuId) {
    query = query.eq("id", menuId).eq("activo", true).maybeSingle()
  } else {
    query = query.eq("activo", true).order("created_at", { ascending: false }).limit(1).maybeSingle()
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Menú no encontrado." }, { status: 404 })
  }

  return NextResponse.json({ menu: data })
}
