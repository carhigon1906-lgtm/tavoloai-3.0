import { NextResponse } from "next/server"

export const runtime = "nodejs"

const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1"
const DEFAULT_MODEL_ID = "b820ea11-02bf-4652-97ae-9ac0cc00593d"
const POLL_INTERVAL_MS = 2500
const MAX_ATTEMPTS = 24

type PosterRequest = {
  title?: string
  subtitle?: string
  cta?: string
  format?: string
  palette?: string
}

const formatDimensions: Record<string, { width: number; height: number }> = {
  "feed-4-5": { width: 832, height: 1024 },
  story: { width: 576, height: 1024 },
  square: { width: 1024, height: 1024 },
  "menu-header": { width: 1024, height: 576 },
}

const paletteLabels: Record<string, string> = {
  cyan: "azules profundos y detalles cian luminosos",
  emerald: "verdes esmeralda y turquesa elegante",
  amber: "ambar dorado y acentos calidos premium",
}

function buildPrompt({ title, subtitle, cta, format, palette }: PosterRequest) {
  const paletteLabel = paletteLabels[palette || "cyan"] || paletteLabels["cyan"]
  const formatLabel =
    format === "story" ? "story vertical para Instagram" : format === "square" ? "post cuadrado para redes" : format === "menu-header" ? "header horizontal de menu" : "post vertical 4:5 para feed"

  const headline = title?.trim() || "Promocion gourmet"
  const support = subtitle?.trim() || "Campana premium para restaurante"
  const action = cta?.trim() || "Reserva hoy"

  return [
    "premium restaurant promotional poster, luxury food campaign, elegant art direction, sophisticated typography layout, polished advertising composition, high-end gastronomy branding, no watermark",
    `headline theme: ${headline}`,
    `supporting copy theme: ${support}`,
    `call to action theme: ${action}`,
    `color palette: ${paletteLabel}`,
    `format: ${formatLabel}`,
    "rich cinematic lighting, refined textures, premium editorial poster, realistic gourmet food presentation, space reserved for marketing copy",
  ].join(", ")
}

function buildNegativePrompt() {
  return [
    "low quality",
    "blurry",
    "distorted text",
    "extra fingers",
    "duplicate objects",
    "cropped food",
    "watermark",
    "logo",
    "artifact",
    "deformed composition",
  ].join(", ")
}

function extractGenerationId(payload: any) {
  return (
    payload?.sdGenerationJob?.generationId ||
    payload?.generations?.[0]?.id ||
    payload?.generationId ||
    payload?.id ||
    null
  )
}

function extractImageUrl(payload: any) {
  const generation = payload?.generations_by_pk || payload?.generation || payload
  const images = generation?.generated_images

  if (!Array.isArray(images) || images.length === 0) {
    return null
  }

  return images.find((image: any) => typeof image?.url === "string")?.url || null
}

function extractStatus(payload: any) {
  return payload?.generations_by_pk?.status || payload?.generation?.status || payload?.status || ""
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  const apiKey = process.env["LEONARDO_API_KEY"]
  if (!apiKey) {
    return NextResponse.json({ error: "LEONARDO_API_KEY no configurado." }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as PosterRequest | null
  if (!body) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  const dimensions = formatDimensions[body.format || "feed-4-5"] ?? { width: 832, height: 1024 }
  const { width, height } = dimensions
  const createResponse = await fetch(`${LEONARDO_API_URL}/generations`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      accept: "application/json",
    },
    body: JSON.stringify({
      prompt: buildPrompt(body),
      negative_prompt: buildNegativePrompt(),
      modelId: DEFAULT_MODEL_ID,
      width,
      height,
      num_images: 1,
      public: false,
    }),
  })

  const createPayload = await createResponse.json().catch(() => null)
  if (!createResponse.ok) {
    const message = createPayload?.error || createPayload?.message || "No se pudo iniciar la generación en Leonardo."
    return NextResponse.json({ error: message, details: createPayload }, { status: createResponse.status })
  }

  const generationId = extractGenerationId(createPayload)
  if (!generationId) {
    return NextResponse.json({ error: "Leonardo respondió sin generationId.", details: createPayload }, { status: 502 })
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    await sleep(POLL_INTERVAL_MS)

    const statusResponse = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
      headers: {
        authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
      cache: "no-store",
    })

    const statusPayload = await statusResponse.json().catch(() => null)
    if (!statusResponse.ok) {
      const message = statusPayload?.error || statusPayload?.message || "No se pudo consultar el estado en Leonardo."
      return NextResponse.json({ error: message, details: statusPayload }, { status: statusResponse.status })
    }

    const imageUrl = extractImageUrl(statusPayload)
    if (imageUrl) {
      return NextResponse.json({ imageUrl, generationId, status: extractStatus(statusPayload) || "COMPLETE" })
    }

    const status = String(extractStatus(statusPayload) || "").toUpperCase()
    if (status === "FAILED") {
      return NextResponse.json(
        { error: "Leonardo no pudo completar la generación.", generationId, details: statusPayload },
        { status: 502 },
      )
    }
  }

  return NextResponse.json(
    { error: "La generación sigue en proceso. Intenta de nuevo en unos segundos.", generationId },
    { status: 504 },
  )
}
