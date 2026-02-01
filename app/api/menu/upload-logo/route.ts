import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin no configurado." }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const filePath = formData.get("path")
  const bucket = formData.get("bucket")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo invalido." }, { status: 400 })
  }

  if (!filePath || typeof filePath !== "string") {
    return NextResponse.json({ error: "Ruta invalida." }, { status: 400 })
  }

  const bucketName = typeof bucket === "string" && bucket.length > 0 ? bucket : "menu-assets"
  const arrayBuffer = await file.arrayBuffer()
  const contentType = file.type || "application/octet-stream"

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(filePath, Buffer.from(arrayBuffer), { contentType, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)
  return NextResponse.json({ publicUrl: data.publicUrl })
}
