import { NextResponse } from "next/server"

export const runtime = "nodejs"

const HF_IMAGE_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"

type PosterRequest = {
  title?: string
  subtitle?: string
}

function buildPrompt({ title, subtitle }: PosterRequest) {
  const cleanTitle = title?.trim() || "Promocion gourmet"
  const cleanSubtitle = subtitle?.trim() || "Afiche publicitario para restaurante"

  return [
    "premium restaurant poster, gourmet food advertising, elegant typography space, polished marketing composition, social media poster",
    `main headline theme: ${cleanTitle}`,
    `supporting description theme: ${cleanSubtitle}`,
    "warm lighting, cinematic food styling, premium branding, realistic details, professional advertising image",
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
