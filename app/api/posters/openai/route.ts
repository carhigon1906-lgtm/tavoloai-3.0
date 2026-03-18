import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

export const runtime = "nodejs"

const OPENAI_IMAGE_TIMEOUT_MS = 75_000
const ALLOWED_REFERENCE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])

type PosterRequest = {
  title?: string
  subtitle?: string
  creativeBrief?: string
  mode?: "promotion" | "event"
  promotionType?: string
  promoDate?: string
  eventDate?: string
  eventText?: string
}

type OpenAiErrorPayload = {
  error?: {
    message?: string
    code?: string
    type?: string
    param?: string | null
  }
}

type OpenAiSuccessPayload = {
  data?: Array<{ b64_json?: string }>
}

function classifyOpenAiError(args: {
  status: number
  message?: string
  code?: string
  type?: string
  hasReferenceImage: boolean
}) {
  const message = (args.message || "").toLowerCase()
  const code = (args.code || "").toLowerCase()
  const type = (args.type || "").toLowerCase()

  if (args.status === 429 || code.includes("rate_limit")) {
    return "OpenAI rechazo la solicitud por limite de uso. Espera un momento e intenta de nuevo."
  }

  if (code.includes("insufficient_quota") || message.includes("insufficient_quota") || message.includes("billing")) {
    return "La cuenta de OpenAI no tiene creditos disponibles o alcanzo su limite de facturacion."
  }

  if (
    code.includes("invalid_image") ||
    type.includes("invalid_request_error") ||
    message.includes("image") ||
    message.includes("mask")
  ) {
    return args.hasReferenceImage
      ? "La imagen de referencia no es valida para OpenAI. Prueba con un PNG, JPG o WEBP mas liviano."
      : "OpenAI rechazo la solicitud de imagen por un parametro invalido."
  }

  if (args.status >= 500) {
    return "OpenAI tuvo un problema interno al generar el afiche. Intenta nuevamente."
  }

  return "No se pudo generar la imagen con OpenAI."
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

function buildPrompt({ title, subtitle, creativeBrief, mode, promotionType, promoDate, eventDate, eventText }: PosterRequest) {
  const cleanTitle = title?.trim() || "Promocion gourmet"
  const cleanSubtitle = subtitle?.trim() || "Afiche publicitario para restaurante"
  const cleanCreativeBrief = creativeBrief?.trim() || "premium commercial art direction, polished composition, restaurant marketing focus"
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
          `additional creative direction: ${cleanCreativeBrief}`,
          ...exactTextInstructions,
          "people enjoying the venue, ambient lighting, stylish interior, live entertainment mood, clear hierarchy",
        ]
      : [
          ...promotionPreset,
          `promotion headline: ${cleanTitle}`,
          `promotion type: ${typeLabel}`,
          `promotion timing: ${promoTiming}`,
          `supporting description: ${cleanSubtitle}`,
          `additional creative direction: ${cleanCreativeBrief}`,
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

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 })
  }

  const body: PosterRequest = {
    title: String(formData.get("title") || ""),
    subtitle: String(formData.get("subtitle") || ""),
    creativeBrief: String(formData.get("creativeBrief") || ""),
    mode: formData.get("mode") === "event" ? "event" : "promotion",
    promotionType: String(formData.get("promotionType") || ""),
    promoDate: String(formData.get("promoDate") || ""),
    eventDate: String(formData.get("eventDate") || ""),
    eventText: String(formData.get("eventText") || ""),
  }

  if (!body.title || !body.subtitle) {
    return NextResponse.json({ error: "Titulo o descripcion invalidos." }, { status: 400 })
  }

  const referenceImage = formData.get("referenceImage")
  const hasReferenceImage = referenceImage instanceof File && referenceImage.size > 0

  if (hasReferenceImage && !ALLOWED_REFERENCE_IMAGE_TYPES.has(referenceImage.type)) {
    return NextResponse.json(
      {
        error: "La imagen de referencia debe ser PNG, JPG o WEBP.",
        errorCode: "invalid_reference_image_type",
      },
      { status: 400 },
    )
  }

  const clientRequestId = randomUUID()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENAI_IMAGE_TIMEOUT_MS)

  try {
    const response = hasReferenceImage
      ? await (async () => {
          const openaiFormData = new FormData()
          openaiFormData.append("model", "gpt-image-1")
          openaiFormData.append("prompt", buildPrompt(body))
          openaiFormData.append("size", "1024x1024")
          openaiFormData.append("quality", "medium")
          openaiFormData.append("output_format", "png")
          openaiFormData.append("input_fidelity", "low")
          openaiFormData.append("image", referenceImage)

          return fetch("https://api.openai.com/v1/images/edits", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "X-Client-Request-Id": clientRequestId,
            },
            body: openaiFormData,
            cache: "no-store",
            signal: controller.signal,
          })
        })()
      : await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Client-Request-Id": clientRequestId,
          },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: buildPrompt(body),
            size: "1024x1024",
            quality: "medium",
            output_format: "png",
          }),
          cache: "no-store",
          signal: controller.signal,
        })

    const requestId = response.headers.get("x-request-id") || undefined
    const processingMs = response.headers.get("openai-processing-ms") || undefined
    const payload = (await response.json().catch(() => null)) as (OpenAiSuccessPayload & OpenAiErrorPayload) | null

    if (!response.ok) {
      return NextResponse.json(
        {
          error: classifyOpenAiError({
            status: response.status,
            message: payload?.error?.message,
            code: payload?.error?.code,
            type: payload?.error?.type,
            hasReferenceImage,
          }),
          errorCode: payload?.error?.code || payload?.error?.type || "openai_request_failed",
          requestId,
          processingMs,
          usedReferenceImage: hasReferenceImage,
          providerMessage: payload?.error?.message,
        },
        { status: response.status },
      )
    }

    const imageBase64 = payload?.data?.[0]?.b64_json
    if (!imageBase64) {
      return NextResponse.json(
        {
          error: "OpenAI no devolvio una imagen valida.",
          errorCode: "missing_image_data",
          requestId,
          processingMs,
          usedReferenceImage: hasReferenceImage,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${imageBase64}`,
      requestId,
      processingMs,
      usedReferenceImage: hasReferenceImage,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          error:
            "OpenAI demoro demasiado en responder. Prueba con una imagen de referencia mas ligera o genera el afiche sin imagen.",
          errorCode: "openai_timeout",
          requestId: clientRequestId,
          usedReferenceImage: hasReferenceImage,
        },
        { status: 504 },
      )
    }

    return NextResponse.json(
      {
        error: "No se pudo completar la solicitud a OpenAI.",
        errorCode: "openai_network_error",
        requestId: clientRequestId,
        usedReferenceImage: hasReferenceImage,
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
