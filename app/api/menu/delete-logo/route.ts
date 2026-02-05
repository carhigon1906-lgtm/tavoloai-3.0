import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin no configurado." }, { status: 500 })
  }

  let payload: { bucket?: string; path?: string } = {}
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 })
  }

  const bucketName = typeof payload.bucket === "string" && payload.bucket.length > 0 ? payload.bucket : "menu-assets"
  const filePath = typeof payload.path === "string" ? payload.path : ""

  if (!filePath) {
    return NextResponse.json({ error: "Ruta invalida." }, { status: 400 })
  }

  const { error } = await supabaseAdmin.storage.from(bucketName).remove([filePath])
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
