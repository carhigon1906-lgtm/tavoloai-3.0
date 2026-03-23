import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import sharp from "sharp"

export const runtime = "nodejs"

const OPENAI_IMAGE_TIMEOUT_MS = 75_000
const ALLOWED_REFERENCE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])

type PosterRequest = {
  title?: string
  subtitle?: string
  secondaryText?: string
  creativeBrief?: string
  mode?: "promotion" | "event"
  promotionType?: string
  promoDate?: string
  eventDate?: string
  eventText?: string
  size?: "1024x1024" | "1024x1536" | "1536x1024"
  quality?: "medium" | "high" | "auto"
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

type PosterDimensions = {
  width: number
  height: number
}

type PosterVisualStyle = {
  accent: string
  accentSoftOpacity: number
  badgeFill: string
  shadeTopOpacity: number
  shadeMidOpacity: number
  shadeBottomOpacity: number
  metaFallback: string
  footerText: string
  titleYOffsetRatio: number
  glowX: number
  glowY: number
  glowScaleX: number
  glowScaleY: number
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

const VISUAL_STYLES: Record<"plato" | "bebida" | "menu" | "general" | "event", PosterVisualStyle> = {
  plato: {
    accent: "#f59e0b",
    accentSoftOpacity: 0.24,
    badgeFill: "rgba(34,18,8,0.52)",
    shadeTopOpacity: 0.08,
    shadeMidOpacity: 0.18,
    shadeBottomOpacity: 0.92,
    metaFallback: "SELECCION DEL CHEF",
    footerText: "Fotografia gastronomica premium y acabado editorial",
    titleYOffsetRatio: 0.4,
    glowX: 0.22,
    glowY: 0.17,
    glowScaleX: 0.78,
    glowScaleY: 0.52,
  },
  bebida: {
    accent: "#38bdf8",
    accentSoftOpacity: 0.28,
    badgeFill: "rgba(8,21,34,0.56)",
    shadeTopOpacity: 0.1,
    shadeMidOpacity: 0.2,
    shadeBottomOpacity: 0.9,
    metaFallback: "SIGNATURE DRINK",
    footerText: "Brillo nocturno, contraste alto y energia premium",
    titleYOffsetRatio: 0.37,
    glowX: 0.74,
    glowY: 0.16,
    glowScaleX: 0.7,
    glowScaleY: 0.44,
  },
  menu: {
    accent: "#a78bfa",
    accentSoftOpacity: 0.2,
    badgeFill: "rgba(23,16,38,0.56)",
    shadeTopOpacity: 0.05,
    shadeMidOpacity: 0.14,
    shadeBottomOpacity: 0.88,
    metaFallback: "CURATED MENU",
    footerText: "Direccion de arte editorial con jerarquia de campaña",
    titleYOffsetRatio: 0.34,
    glowX: 0.5,
    glowY: 0.2,
    glowScaleX: 0.92,
    glowScaleY: 0.36,
  },
  general: {
    accent: "#34d399",
    accentSoftOpacity: 0.22,
    badgeFill: "rgba(9,14,25,0.48)",
    shadeTopOpacity: 0.08,
    shadeMidOpacity: 0.18,
    shadeBottomOpacity: 0.92,
    metaFallback: "OFERTA DESTACADA",
    footerText: "Comunicacion comercial refinada para restaurante",
    titleYOffsetRatio: 0.42,
    glowX: 0.2,
    glowY: 0.18,
    glowScaleX: 0.78,
    glowScaleY: 0.5,
  },
  event: {
    accent: "#fb7185",
    accentSoftOpacity: 0.24,
    badgeFill: "rgba(37,11,20,0.56)",
    shadeTopOpacity: 0.06,
    shadeMidOpacity: 0.16,
    shadeBottomOpacity: 0.9,
    metaFallback: "UNA NOCHE ESPECIAL",
    footerText: "Experiencia gastronomica, ambientacion y energia en vivo",
    titleYOffsetRatio: 0.36,
    glowX: 0.18,
    glowY: 0.14,
    glowScaleX: 0.84,
    glowScaleY: 0.54,
  },
}

const STYLE_ART_DIRECTION: Record<"plato" | "bebida" | "menu" | "general" | "event", string[]> = {
  plato: [
    "main dish must be the single hero subject with no competing food items",
    "refined fine-dining plating with premium ingredient texture and realistic garnish restraint",
    "rich warm side lighting with subtle specular highlights and cinematic contrast",
    "shallow depth of field and dark editorial restaurant background",
    "luxury gastronomy advertising, appetizing realism, elegant composition",
  ],
  bebida: [
    "drink must be the single dominant hero object with no competing elements",
    "crisp glass detail, realistic condensation, clean reflections, premium liquid rendering",
    "dramatic studio lighting inspired by nightlife hospitality campaigns",
    "deep moody background with glossy highlights and controlled contrast",
    "luxury bar advertising, seductive premium atmosphere, polished composition",
  ],
  menu: [
    "editorial restaurant campaign aesthetic rather than a single product shot",
    "tasteful arrangement of only a few culinary elements with strong hierarchy",
    "magazine-inspired premium hospitality art direction and designed negative space",
    "balanced surfaces, polished styling, controlled lighting, coherent visual rhythm",
    "avoid buffet look, avoid clutter, avoid overcrowded table scene",
  ],
  general: [
    "elevated restaurant brand campaign with premium hospitality atmosphere",
    "clean focal hierarchy, cinematic polish, and balanced negative space",
    "high-end commercial food advertising look, not generic stock imagery",
    "refined textures, controlled lighting, composed frame, sophisticated mood",
  ],
  event: [
    "cinematic venue atmosphere with upscale nightlife energy",
    "elegant crowd presence only if useful, never chaotic or messy",
    "dramatic stage or performance lighting with premium hospitality mood",
    "editorial nightlife campaign look with depth, anticipation, and sophistication",
    "avoid amateur club aesthetic, avoid overexposed effects, avoid readable signage",
  ],
}

function getVisualStyle(body: PosterRequest) {
  if (body.mode === "event") {
    return VISUAL_STYLES["event"]
  }

  if (body.promotionType === "plato" || body.promotionType === "bebida" || body.promotionType === "menu" || body.promotionType === "general") {
    return VISUAL_STYLES[body.promotionType]
  }

  return VISUAL_STYLES["general"]
}

function getStyleDirection(body: PosterRequest) {
  if (body.mode === "event") {
    return STYLE_ART_DIRECTION["event"]
  }

  if (body.promotionType === "plato" || body.promotionType === "bebida" || body.promotionType === "menu" || body.promotionType === "general") {
    return STYLE_ART_DIRECTION[body.promotionType]
  }

  return STYLE_ART_DIRECTION["general"]
}

function getDimensions(size?: PosterRequest["size"]): PosterDimensions {
  if (size === "1536x1024") {
    return { width: 1536, height: 1024 }
  }

  if (size === "1024x1024") {
    return { width: 1024, height: 1024 }
  }

  return { width: 1024, height: 1536 }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) {
    return [""]
  }

  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word

    if (lines.length === maxLines - 1) {
      break
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine)
  }

  const remainingWords = words.join(" ")
  const reconstructed = lines.join(" ")
  if (remainingWords.length > reconstructed.length && lines.length > 0) {
    const lastLineIndex = lines.length - 1
    lines[lastLineIndex] = `${lines[lastLineIndex]?.replace(/\.\.\.$/, "")}...`
  }

  return lines.slice(0, maxLines)
}

function normalizeCopy(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getPromotionSupportLine(promotionType?: string) {
  switch (promotionType) {
    case "plato":
      return "Seleccion gastronomica con presentacion premium"
    case "bebida":
      return "Bebida protagonista con look nocturno y acabado premium"
    case "menu":
      return "Curaduria especial con enfoque editorial para compartir"
    default:
      return "Campana comercial con imagen refinada para restaurante"
  }
}

function getPromotionMetaFallback(promotionType?: string) {
  switch (promotionType) {
    case "plato":
      return "PLATO DESTACADO"
    case "bebida":
      return "BARRA DESTACADA"
    case "menu":
      return "MENU CURADO"
    default:
      return "PROMOCION ESPECIAL"
  }
}

function getPromotionFooterLine(promotionType?: string, promoDate?: string) {
  const cleanPromoDate = (promoDate || "").trim()

  switch (promotionType) {
    case "plato":
      return cleanPromoDate
        ? `Ideal para comunicar una propuesta especial ${cleanPromoDate.toLowerCase()}`
        : "Ideal para comunicar una propuesta gastronomica especial"
    case "bebida":
      return cleanPromoDate
        ? `Perfecto para impulsar la barra ${cleanPromoDate.toLowerCase()}`
        : "Perfecto para impulsar la barra con una estetica nocturna premium"
    case "menu":
      return cleanPromoDate
        ? `Pensado para destacar el menu ${cleanPromoDate.toLowerCase()}`
        : "Pensado para destacar una seleccion curada del menu"
    default:
      return cleanPromoDate
        ? `Campana visual lista para activar ${cleanPromoDate.toLowerCase()}`
        : "Campana visual lista para comunicar una promocion destacada"
  }
}

function getEventMetaFallback(eventDate?: string) {
  const cleanEventDate = (eventDate || "").trim()
  return cleanEventDate ? cleanEventDate.toUpperCase() : "NOCHE ESPECIAL"
}

function getEventSupportLine(eventText?: string) {
  const cleanEventText = (eventText || "").trim()
  return cleanEventText || "Experiencia en vivo con atmosfera premium y convocatoria clara"
}

function getEventFooterLine(eventDate?: string) {
  const cleanEventDate = (eventDate || "").trim()
  return cleanEventDate
    ? `Comunicacion lista para promover asistencia ${cleanEventDate.toLowerCase()}`
    : "Comunicacion lista para promover una noche especial en el local"
}

function dedupeSupportCopy({
  title,
  meta,
  subtitle,
  fallback,
}: {
  title: string
  meta: string
  subtitle: string
  fallback: string
}) {
  const normalizedTitle = normalizeCopy(title)
  const normalizedMeta = normalizeCopy(meta)
  const normalizedSubtitle = normalizeCopy(subtitle)

  if (!normalizedSubtitle) {
    return fallback
  }

  const subtitleContainsTitle = normalizedTitle && normalizedSubtitle.includes(normalizedTitle)
  const subtitleContainsMeta = normalizedMeta && normalizedSubtitle.includes(normalizedMeta)

  if (subtitleContainsTitle || subtitleContainsMeta || normalizedSubtitle === normalizedTitle || normalizedSubtitle === normalizedMeta) {
    return fallback
  }

  return subtitle
}

function buildPosterCopy(body: PosterRequest) {
  const title = body.title?.trim() || (body.mode === "event" ? "Evento especial" : "Promocion especial")

  if (body.mode === "event") {
    const metaLabel = getEventMetaFallback(body.eventDate)
    const subtitle = dedupeSupportCopy({
      title,
      meta: body.eventDate?.trim() || "",
      subtitle: body.secondaryText?.trim() || body.eventText?.trim() || body.subtitle?.trim() || "",
      fallback: getEventSupportLine(body.eventText),
    })

    return {
      title,
      metaLabel,
      subtitle,
      footer: getEventFooterLine(body.eventDate),
    }
  }

  const metaLabel = body.promoDate?.trim() || getPromotionMetaFallback(body.promotionType)
  const subtitle = dedupeSupportCopy({
    title,
    meta: body.promoDate?.trim() || "",
    subtitle: body.secondaryText?.trim() || body.subtitle?.trim() || "",
    fallback: getPromotionSupportLine(body.promotionType),
  })

  return {
    title,
    metaLabel,
    subtitle,
    footer: getPromotionFooterLine(body.promotionType, body.promoDate),
  }
}

function buildPrompt({
  title,
  subtitle,
  creativeBrief,
  mode,
  promotionType,
  promoDate,
  eventDate,
  eventText,
  size,
}: PosterRequest) {
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
  const styleDirection = getStyleDirection({ mode, promotionType })

  const concept =
    mode === "event"
      ? [
          ...EVENT_PRESET,
          `featured event theme: ${cleanTitle}`,
          `event atmosphere reference: ${cleanEventText}`,
          `secondary context: ${cleanSubtitle}`,
          `schedule context: ${cleanEventDate}`,
          `additional creative direction: ${cleanCreativeBrief}`,
          ...styleDirection,
          "people enjoying the venue, ambient lighting, stylish interior, live entertainment mood, clear hierarchy",
        ]
      : [
          ...promotionPreset,
          `promotion theme: ${cleanTitle}`,
          `promotion type: ${typeLabel}`,
          `promotion timing context: ${promoTiming}`,
          `secondary context: ${cleanSubtitle}`,
          `additional creative direction: ${cleanCreativeBrief}`,
          ...styleDirection,
          "hero food or drink photography, appetizing presentation, warm cinematic lighting, premium branding, clear focal point",
        ]

  const layoutInstruction =
    size === "1536x1024"
      ? "Use a horizontal advertising layout with the focal subject offset to one side and clean negative space for editorial text overlay."
      : size === "1024x1024"
        ? "Use a square campaign layout with a balanced composition and a clear safe zone for copy overlay."
        : "Use a vertical poster layout optimized for restaurant advertising, mobile stories, and printed flyers with a strong subject and generous negative space for copy overlay."

  return [
    ...concept,
    layoutInstruction,
    "Design a polished commercial poster background for a restaurant brand.",
    "The image must look like a final advertising background approved by an art director, with deliberate framing, premium lighting, realistic material rendering, and strong visual hierarchy.",
    "Keep one clear focal subject or a tightly curated focal grouping depending on the selected promotion type.",
    "Preserve clean negative space for later copy overlay and keep background areas controlled, darker, and visually calm where text can be placed.",
    "The result must feel premium, realistic, elegant, campaign-ready, and not generic.",
    "Do not render any text, letters, typography, logos, price tags, UI, watermark, badge, or signage.",
    "Do not invent extra hero objects, do not create clutter, and do not fill the frame with unnecessary props.",
    "Avoid cluttered composition, distorted anatomy, extra fingers, low quality rendering, random objects, cheap stock-photo aesthetics, and busy unreadable details.",
  ].join(", ")
}

function buildPosterOverlay(body: PosterRequest, dimensions: PosterDimensions) {
  const { width, height } = dimensions
  const isLandscape = width > height
  const style = getVisualStyle(body)
  const sidePadding = Math.round(width * 0.08)
  const topPadding = Math.round(height * 0.07)
  const bottomPadding = Math.round(height * 0.08)
  const eyebrowFontSize = Math.round(width * 0.028)
  const metaFontSize = Math.round(width * 0.034)
  const titleFontSize = Math.round((isLandscape ? width : height) * (isLandscape ? 0.055 : 0.05))
  const bodyFontSize = Math.round(width * 0.03)
  const titleMaxChars = isLandscape ? 22 : 16
  const subtitleMaxChars = isLandscape ? 48 : 32
  const footerMaxChars = isLandscape ? 54 : 34

  const copy = buildPosterCopy(body)
  const modeLabel = body.mode === "event" ? "EVENTO" : "PROMOCION"
  const accent = style.accent
  const title = copy.title
  const subtitle = copy.subtitle
  const footer = copy.footer || style.footerText
  const metaLabel = copy.metaLabel || style.metaFallback

  const titleLines = wrapText(title, titleMaxChars, isLandscape ? 3 : 4)
  const subtitleLines = wrapText(subtitle, subtitleMaxChars, 3)
  const footerLines = wrapText(footer, footerMaxChars, 2)

  const titleLineHeight = Math.round(titleFontSize * 1.04)
  const bodyLineHeight = Math.round(bodyFontSize * 1.35)
  const footerLineHeight = Math.round(metaFontSize * 1.3)
  const titleBlockHeight = titleLines.length * titleLineHeight
  const subtitleBlockHeight = subtitleLines.length * bodyLineHeight
  const footerBlockHeight = footerLines.length * footerLineHeight

  const footerY = height - bottomPadding
  const subtitleY = footerY - footerBlockHeight - Math.round(height * 0.035)
  const titleY = subtitleY - subtitleBlockHeight - Math.round(height * 0.05)
  const safeTitleY = Math.max(titleY, Math.round(height * style.titleYOffsetRatio))
  const metaY = safeTitleY - Math.round(height * 0.055)
  const badgeHeight = Math.round(height * 0.058)
  const badgeWidth = Math.max(Math.round(width * 0.2), modeLabel.length * eyebrowFontSize + 80)
  const badgeY = topPadding

  const renderLines = (lines: string[], x: number, y: number, lineHeight: number) =>
    lines
      .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
      .join("")

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="posterShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#040A14" stop-opacity="${style.shadeTopOpacity}" />
          <stop offset="55%" stop-color="#040A14" stop-opacity="${style.shadeMidOpacity}" />
          <stop offset="100%" stop-color="#040A14" stop-opacity="${style.shadeBottomOpacity}" />
        </linearGradient>
        <radialGradient id="posterGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * style.glowX} ${height * style.glowY}) rotate(37) scale(${width * style.glowScaleX} ${height * style.glowScaleY})">
          <stop stop-color="${accent}" stop-opacity="${style.accentSoftOpacity}" />
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="glassLine" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#FFFFFF" stop-opacity="0.4" />
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.12" />
        </linearGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#posterShade)" />
      <rect width="${width}" height="${height}" fill="url(#posterGlow)" />
      <rect x="${sidePadding}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="${Math.round(badgeHeight / 2)}" fill="${style.badgeFill}" stroke="url(#glassLine)" />
      <circle cx="${sidePadding + 28}" cy="${badgeY + badgeHeight / 2}" r="7" fill="${accent}" />
      <text x="${sidePadding + 48}" y="${badgeY + badgeHeight / 2 + eyebrowFontSize * 0.36}" fill="#F8FAFC" font-size="${eyebrowFontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="700" letter-spacing="2.6">${escapeXml(modeLabel)}</text>

      <text x="${sidePadding}" y="${Math.max(metaY, badgeY + badgeHeight + Math.round(height * 0.08))}" fill="${accent}" font-size="${metaFontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="700" letter-spacing="2.2">${escapeXml(metaLabel.toUpperCase())}</text>

      <text x="${sidePadding}" y="${safeTitleY}" fill="#FFFFFF" font-size="${titleFontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="800">
        ${renderLines(titleLines, sidePadding, safeTitleY, titleLineHeight)}
      </text>

      <text x="${sidePadding}" y="${safeTitleY + titleBlockHeight + Math.round(height * 0.03)}" fill="rgba(241,245,249,0.92)" font-size="${bodyFontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="500">
        ${renderLines(subtitleLines, sidePadding, safeTitleY + titleBlockHeight + Math.round(height * 0.03), bodyLineHeight)}
      </text>

      <line x1="${sidePadding}" y1="${subtitleY - Math.round(height * 0.025)}" x2="${Math.min(width - sidePadding, sidePadding + width * 0.26)}" y2="${subtitleY - Math.round(height * 0.025)}" stroke="${accent}" stroke-width="5" stroke-linecap="round" />

      <text x="${sidePadding}" y="${footerY - footerBlockHeight + footerLineHeight * 0.1}" fill="rgba(226,232,240,0.78)" font-size="${metaFontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="600">
        ${renderLines(footerLines, sidePadding, footerY - footerBlockHeight + footerLineHeight * 0.1, footerLineHeight)}
      </text>
    </svg>
  `
}

async function composePosterImage(base64Image: string, body: PosterRequest) {
  const dimensions = getDimensions(body.size)
  const baseBuffer = Buffer.from(base64Image, "base64")
  const overlayBuffer = Buffer.from(buildPosterOverlay(body, dimensions))

  return sharp(baseBuffer)
    .resize(dimensions.width, dimensions.height, {
      fit: "cover",
      position: "center",
    })
    .composite([
      {
        input: overlayBuffer,
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer()
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
  if (!formData) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 })
  }

  const body: PosterRequest = {
    title: String(formData.get("title") || ""),
    subtitle: String(formData.get("subtitle") || ""),
    secondaryText: String(formData.get("secondaryText") || ""),
    creativeBrief: String(formData.get("creativeBrief") || ""),
    mode: formData.get("mode") === "event" ? "event" : "promotion",
    promotionType: String(formData.get("promotionType") || ""),
    promoDate: String(formData.get("promoDate") || ""),
    eventDate: String(formData.get("eventDate") || ""),
    eventText: String(formData.get("eventText") || ""),
    size:
      formData.get("size") === "1536x1024" || formData.get("size") === "1024x1024" || formData.get("size") === "1024x1536"
        ? (formData.get("size") as PosterRequest["size"])
        : "1024x1536",
    quality: formData.get("quality") === "high" || formData.get("quality") === "auto" ? (formData.get("quality") as PosterRequest["quality"]) : "medium",
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
          openaiFormData.append("model", "gpt-image-1.5")
          openaiFormData.append("prompt", buildPrompt(body))
          openaiFormData.append("size", body.size || "1024x1536")
          openaiFormData.append("quality", body.quality || "medium")
          openaiFormData.append("output_format", "png")
          openaiFormData.append("input_fidelity", "high")
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
            model: "gpt-image-1.5",
            prompt: buildPrompt(body),
            size: body.size || "1024x1536",
            quality: body.quality || "medium",
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

    const finalPosterBuffer = await composePosterImage(imageBase64, body)

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${finalPosterBuffer.toString("base64")}`,
      requestId,
      processingMs,
      usedReferenceImage: hasReferenceImage,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    console.error("[posters/openai] request failed", {
      requestId: clientRequestId,
      usedReferenceImage: hasReferenceImage,
      message: errorMessage,
      error,
    })

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

    if (errorMessage.toLowerCase().includes("fetch failed")) {
      return NextResponse.json(
        {
          error: "No se pudo conectar con OpenAI. Revisa la conexion, la clave API y el acceso saliente del servidor.",
          errorCode: "openai_fetch_failed",
          requestId: clientRequestId,
          usedReferenceImage: hasReferenceImage,
          detail: errorMessage,
        },
        { status: 502 },
      )
    }

    if (errorMessage.toLowerCase().includes("sharp") || errorMessage.toLowerCase().includes("input buffer")) {
      return NextResponse.json(
        {
          error: "La imagen fue generada, pero fallo la composicion final del afiche.",
          errorCode: "poster_composition_failed",
          requestId: clientRequestId,
          usedReferenceImage: hasReferenceImage,
          detail: errorMessage,
        },
        { status: 502 },
      )
    }

    return NextResponse.json(
      {
        error: "No se pudo completar la solicitud a OpenAI.",
        errorCode: "openai_network_error",
        requestId: clientRequestId,
        usedReferenceImage: hasReferenceImage,
        detail: errorMessage,
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
