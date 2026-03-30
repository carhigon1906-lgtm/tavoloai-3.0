import { NextResponse } from "next/server"

export const runtime = "nodejs"

const OPENAI_IMAGE_TIMEOUT_MS = 90_000
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])

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

function classifyEnhanceError(status: number, message?: string, code?: string) {
  const normalizedMessage = (message || "").toLowerCase()
  const normalizedCode = (code || "").toLowerCase()

  if (status === 429 || normalizedCode.includes("rate_limit")) {
    return "OpenAI rechazo la solicitud por limite de uso. Intenta nuevamente en unos minutos."
  }

  if (normalizedCode.includes("insufficient_quota") || normalizedMessage.includes("billing")) {
    return "La cuenta de OpenAI no tiene credito disponible para mejorar la imagen."
  }

  if (normalizedCode.includes("invalid_image") || normalizedMessage.includes("image")) {
    return "La imagen no es valida para OpenAI. Prueba con PNG, JPG o WEBP."
  }

  if (status >= 500) {
    return "OpenAI tuvo un problema interno al procesar la imagen."
  }

  return "No se pudo mejorar la imagen con OpenAI."
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export async function POST(request: Request) {
  const apiKey = process.env["OPENAI_API_KEY"]
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY no configurado." }, { status: 500 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo invalido." }, { status: 400 })
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: "La imagen debe ser PNG, JPG o WEBP." }, { status: 400 })
  }

  const openaiFormData = new FormData()
  openaiFormData.append("model", "gpt-image-1.5")
  openaiFormData.append(
    "prompt",
    [
      "Enhance this isolated dish image for restaurant marketing.",
      "Preserve the exact food, exact plating, exact shape, exact camera angle, and exact proportions.",
      "The subject must remain the same dish with the same outline and presentation.",
      "Improve only lighting, realism, texture, color depth, contrast, edge cleanliness, and premium studio quality.",
      "Keep the background fully transparent and preserve transparency in the final output.",
      "Do not generate any new background, surface, table, shadow plate, environment, or decorative scene behind the dish.",
      "No props, no hands, no text, no logos, no cutlery, no extra garnish, no new ingredients, no duplicate food items, no layout changes.",
    ].join(" "),
  )
  openaiFormData.append("size", "1024x1024")
  openaiFormData.append("quality", "medium")
  openaiFormData.append("background", "transparent")
  openaiFormData.append("output_format", "png")
  openaiFormData.append("input_fidelity", "high")
  openaiFormData.append("image", file, file.name || "input.png")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENAI_IMAGE_TIMEOUT_MS)

  try {
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiFormData,
      cache: "no-store",
      signal: controller.signal,
    })

    const payload = (await response.json().catch(() => null)) as (OpenAiSuccessPayload & OpenAiErrorPayload) | null
    if (!response.ok) {
      const requestId = response.headers.get("x-request-id") || ""
      return NextResponse.json(
        {
          error: classifyEnhanceError(response.status, payload?.error?.message, payload?.error?.code),
          status: response.status,
          requestId,
          providerMessage: payload?.error?.message,
        },
        { status: response.status },
      )
    }

    const imageBase64 = payload?.data?.[0]?.b64_json
    if (!imageBase64) {
      return NextResponse.json({ error: "OpenAI no devolvio una imagen valida." }, { status: 502 })
    }

    return NextResponse.json({ tmpUrl: `data:image/png;base64,${imageBase64}` })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    console.error("[OpenAI Enhance] Error", { message: errorMessage, error })

    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "OpenAI demoro demasiado en responder al mejorar la imagen.",
          status: 504,
          detail: errorMessage,
        },
        { status: 504 },
      )
    }

    return NextResponse.json(
      {
        error: "No se pudo completar la mejora con OpenAI.",
        status: 502,
        detail: errorMessage,
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
