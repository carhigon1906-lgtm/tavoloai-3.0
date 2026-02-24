import { NextResponse } from "next/server"

export const runtime = "nodejs"

const CLAID_API_URL = "https://api.claid.ai/v1/image/edit/upload"

export async function POST(request: Request) {
  const apiKey = process.env["CLAID_API_KEY"]
  if (!apiKey) {
    return NextResponse.json({ error: "CLAID_API_KEY no configurado." }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo inválido." }, { status: 400 })
  }

  const operations = {
    restorations: {
      decompress: "auto",
      upscale: "smart_enhance",
      polish: true,
    },
    adjustments: {
      hdr: 40,
      sharpness: 20,
    },
  }

  const payload = new FormData()
  payload.append("file", file, file.name || "input.png")
  payload.append(
    "data",
    JSON.stringify({
      operations,
      output: { format: { type: "png", compression: "optimal" } },
    }),
  )

  const response = await fetch(CLAID_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: payload,
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body?.detail || body?.error || "Error al procesar la imagen con Claid."
    return NextResponse.json({ error: message }, { status: response.status })
  }

  const tmpUrl = body?.data?.output?.tmp_url
  if (!tmpUrl || typeof tmpUrl !== "string") {
    return NextResponse.json({ error: "Respuesta inválida de Claid." }, { status: 502 })
  }

  return NextResponse.json({ tmpUrl })
}
