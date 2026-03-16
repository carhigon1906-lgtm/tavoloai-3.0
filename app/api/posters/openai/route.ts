import { NextResponse } from "next/server"

export const runtime = "nodejs"

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
  const exactTextInstructions =
    mode === "event"
      ? [
          `Use this exact headline text in the poster: "${cleanTitle}"`,
          `Use this exact schedule text in the poster: "${cleanEventDate}"`,
          `Use this exact supporting text in the poster: "${cleanEventText}"`,
          `Use this exact secondary description in the poster: "${cleanSubtitle}"`,
          "Make the typography readable, deliberate, premium, and clearly part of the final composition.",
        ]
      : [
          `Use this exact headline text in the poster: "${cleanTitle}"`,
          `Use this exact timing text in the poster: "${promoTiming}"`,
          `Use this exact supporting text in the poster: "${cleanSubtitle}"`,
          "Make the typography readable, deliberate, premium, and clearly part of the final composition.",
        ]

  const concept =
    mode === "event"
      ? [
          ...EVENT_PRESET,
          `featured event: ${cleanTitle}`,
          `event schedule: ${cleanEventDate}`,
          `event hook: ${cleanEventText}`,
          `supporting description: ${cleanSubtitle}`,
          ...exactTextInstructions,
          "people enjoying the venue, ambient lighting, stylish interior, live entertainment mood, clear hierarchy",
        ]
      : [
          ...promotionPreset,
          `promotion headline: ${cleanTitle}`,
          `promotion type: ${typeLabel}`,
          `promotion timing: ${promoTiming}`,
          `supporting description: ${cleanSubtitle}`,
          ...exactTextInstructions,
          "hero food or drink photography, appetizing presentation, warm cinematic lighting, premium branding, clear focal point",
        ]

  return [
    ...concept,
    "Design a polished commercial poster for a restaurant brand.",
    "Avoid gibberish text, random letters, misspellings, watermarks, low quality rendering, cluttered composition, distorted anatomy, extra fingers.",
  ].join(", ")
}

export async function POST(request: Request) {
  const apiKey = process.env["OPENAI_API_KEY"]
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY no configurado." }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as PosterRequest | null
  if (!body?.title || !body?.subtitle) {
    return NextResponse.json({ error: "Titulo o descripcion invalidos." }, { status: 400 })
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: buildPrompt(body),
      size: "1024x1536",
      quality: "high",
      output_format: "png",
    }),
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => null)) as
    | { data?: Array<{ b64_json?: string }>; error?: { message?: string } }
    | null

  if (!response.ok) {
    return NextResponse.json(
      {
        error: payload?.error?.message || "No se pudo generar la imagen con OpenAI.",
      },
      { status: response.status },
    )
  }

  const imageBase64 = payload?.data?.[0]?.b64_json
  if (!imageBase64) {
    return NextResponse.json({ error: "OpenAI no devolvio una imagen." }, { status: 502 })
  }

  return NextResponse.json({ imageUrl: `data:image/png;base64,${imageBase64}` })
}
