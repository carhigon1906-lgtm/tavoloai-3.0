import { NextResponse } from "next/server"

export const runtime = "nodejs"

const HF_IMAGE_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"

type PosterRequest = {
  title?: string
  subtitle?: string
  mode?: "promotion" | "event"
  promotionType?: string
  promoDate?: string
  eventDate?: string
  eventText?: string
}

const PROMOTION_PRESETS: Record<string, string[]> = {
  plato: [
    "premium food poster",
    "hero dish close-up",
    "appetizing plating",
    "warm cinematic lighting",
    "restaurant advertising composition",
    "luxury gastronomy branding",
    "space reserved for headline and offer",
  ],
  bebida: [
    "premium beverage poster",
    "hero drink photography",
    "condensation, reflections, ice, glow",
    "dramatic studio lighting",
    "elegant nightlife hospitality aesthetic",
    "space reserved for headline and offer",
  ],
  menu: [
    "premium restaurant menu campaign poster",
    "editorial composition",
    "clean hierarchy",
    "refined food styling",
    "commercial layout for restaurant marketing",
    "space reserved for headline and supporting copy",
  ],
  general: [
    "premium restaurant promotional poster",
    "high-end hospitality branding",
    "clean focal point",
    "elegant composition",
    "social media advertising layout",
    "space reserved for marketing copy",
  ],
}

const EVENT_PRESET = [
  "premium restaurant event poster",
  "hospitality nightlife campaign",
  "ambient venue atmosphere",
  "stylish interior",
  "editorial event layout",
  "space reserved for headline, schedule, and event details",
]

function buildPrompt({ title, subtitle, mode, promotionType, promoDate, eventDate, eventText }: PosterRequest) {
  const cleanTitle = title?.trim() || "Promocion gourmet"
  const cleanSubtitle = subtitle?.trim() || "Afiche publicitario para restaurante"
  const typeLabel = promotionType?.trim() || "especialidad de la casa"
  const promoTiming = promoDate?.trim() || "disponible por tiempo limitado"
  const cleanEventDate = eventDate?.trim() || "proximamente"
  const cleanEventText = eventText?.trim() || "evento especial en el local"
  const presetKey =
    promotionType === "plato" || promotionType === "bebida" || promotionType === "menu" || promotionType === "general"
      ? promotionType
      : "general"
  const promotionPreset = PROMOTION_PRESETS[presetKey] ?? PROMOTION_PRESETS["general"] ?? []

  const concept =
    mode === "event"
      ? [
          ...EVENT_PRESET,
          `featured event: ${cleanTitle}`,
          `event schedule: ${cleanEventDate}`,
          `event hook: ${cleanEventText}`,
          `supporting description: ${cleanSubtitle}`,
          "people enjoying the venue, ambient lighting, stylish interior, live entertainment mood, clear hierarchy, space reserved for headline and event details",
        ]
      : [
          ...promotionPreset,
          `promotion headline: ${cleanTitle}`,
          `promotion type: ${typeLabel}`,
          `promotion timing: ${promoTiming}`,
          `supporting description: ${cleanSubtitle}`,
          "hero food photography, appetizing presentation, warm cinematic lighting, premium branding, clear focal point, space reserved for promotional copy and price offer",
        ]

  return [
    ...concept,
    "professional advertising image, realistic details, clean composition, high contrast focal subject, no watermark, no random unreadable text",
  ].join(", ")
}

export async function POST(request: Request) {
  const apiKey = process.env["HF_TOKEN"]
  if (!apiKey) {
    return NextResponse.json({ error: "HF_TOKEN no configurado." }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as PosterRequest | null
  if (!body?.title || !body?.subtitle) {
    return NextResponse.json({ error: "Titulo o descripcion invalidos." }, { status: 400 })
  }

  const response = await fetch(HF_IMAGE_MODEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: buildPrompt(body),
      parameters: {
        negative_prompt: "blurry, low quality, watermark, text artifacts, distorted anatomy",
        width: 1024,
        height: 1280,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    return NextResponse.json(
      {
        error: errorBody || "No se pudo generar la imagen con Hugging Face.",
      },
      { status: response.status },
    )
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get("content-type") || "image/png"
  const base64 = imageBuffer.toString("base64")
  const imageUrl = `data:${contentType};base64,${base64}`

  return NextResponse.json({ imageUrl })
}
