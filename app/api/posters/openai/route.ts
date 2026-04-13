import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import sharp from "sharp"
import { getPlanFromMetadata, UPGRADE_URL } from "@/lib/accountPlan"
import { consumePosterGeneration, getPosterUsageForUser } from "@/lib/posterUsage"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const OPENAI_IMAGE_TIMEOUT_MS = 75_000
const ALLOWED_REFERENCE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])

// ─── Tipos ───────────────────────────────────────────────────────────────────

const VALID_PROMOTION_TYPES = ["plato", "bebida", "menu", "general"] as const
type PromotionType = (typeof VALID_PROMOTION_TYPES)[number]
const VALID_VISUAL_STYLES = ["elegante", "comercial", "nocturno", "premium"] as const
type VisualStyleChoice = (typeof VALID_VISUAL_STYLES)[number]

function isValidPromotionType(v: unknown): v is PromotionType {
  return VALID_PROMOTION_TYPES.includes(v as PromotionType)
}

function isValidVisualStyle(v: unknown): v is VisualStyleChoice {
  return VALID_VISUAL_STYLES.includes(v as VisualStyleChoice)
}

type PosterRequest = {
  title?: string
  subtitle?: string
  metaText?: string
  secondaryText?: string
  footerText?: string
  creativeBrief?: string
  visualStyle?: VisualStyleChoice
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

type PosterVisualStyleOverride = Partial<PosterVisualStyle>
type OverlayPresentation = {
  sidePaddingRatio: number
  topPaddingRatio: number
  bottomPaddingRatio: number
  eyebrowScale: number
  metaScale: number
  titleScale: number
  bodyScale: number
  titleMaxCharsPortrait: number
  titleMaxCharsLandscape: number
  subtitleMaxCharsPortrait: number
  subtitleMaxCharsLandscape: number
  footerMaxCharsPortrait: number
  footerMaxCharsLandscape: number
  titleAlign: "start" | "middle"
  contentWidthRatio: number
  dividerWidthRatio: number
  dividerStroke: number
  badgeStyle: "pill" | "square" | "outline"
  badgeCornerRatio: number
}

type CropPosition = "centre" | "top" | "right" | "right top" | "right centre" | "attention"

// ─── Clasificación de errores ─────────────────────────────────────────────────

function classifyOpenAiError(args: {
  status: number
  message?: string
  code?: string
  type?: string
  hasReferenceImage: boolean
}) {
  const message = (args.message || "").toLowerCase()
  const code = (args.code || "").toLowerCase()

  if (args.status === 429 || code.includes("rate_limit")) {
    return "OpenAI rechazó la solicitud por límite de uso. Espera un momento e intenta de nuevo."
  }

  if (code.includes("insufficient_quota") || message.includes("billing")) {
    return "La cuenta de OpenAI no tiene créditos disponibles o alcanzó su límite de facturación."
  }

  if (
    code.includes("invalid_image") ||
    (args.type || "").includes("invalid_request_error") ||
    message.includes("image") ||
    message.includes("mask")
  ) {
    return args.hasReferenceImage
      ? "La imagen de referencia no es válida para OpenAI. Prueba con un PNG con transparencia, JPG o WEBP más liviano."
      : "OpenAI rechazó la solicitud de imagen por un parámetro inválido."
  }

  if (args.status >= 500) {
    return "OpenAI tuvo un problema interno al generar el afiche. Intenta nuevamente."
  }

  return "No se pudo generar la imagen con OpenAI."
}

// ─── Presets visuales ─────────────────────────────────────────────────────────

const PROMOTION_PRESETS: Record<PromotionType, string[]> = {
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

const VISUAL_STYLES: Record<PromotionType | "event", PosterVisualStyle> = {
  plato: {
    accent: "#f59e0b",
    accentSoftOpacity: 0.24,
    badgeFill: "rgba(34,18,8,0.52)",
    shadeTopOpacity: 0.08,
    shadeMidOpacity: 0.18,
    shadeBottomOpacity: 0.92,
    metaFallback: "SELECCIÓN DEL CHEF",
    footerText: "Fotografía gastronómica premium y acabado editorial",
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
    footerText: "Brillo nocturno, contraste alto y energía premium",
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
    footerText: "Dirección de arte editorial con jerarquía de campaña",
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
    footerText: "Comunicación comercial refinada para restaurante",
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
    footerText: "Experiencia gastronómica, ambientación y energía en vivo",
    titleYOffsetRatio: 0.36,
    glowX: 0.18,
    glowY: 0.14,
    glowScaleX: 0.84,
    glowScaleY: 0.54,
  },
}

const VISUAL_STYLE_OVERLAY_OVERRIDES: Record<VisualStyleChoice, PosterVisualStyleOverride> = {
  elegante: {
    accent: "#f6c88f",
    accentSoftOpacity: 0.16,
    badgeFill: "rgba(58,42,26,0.34)",
    shadeTopOpacity: 0.04,
    shadeMidOpacity: 0.12,
    shadeBottomOpacity: 0.88,
    titleYOffsetRatio: 0.33,
    glowX: 0.3,
    glowY: 0.18,
    glowScaleX: 0.68,
    glowScaleY: 0.34,
  },
  comercial: {
    accent: "#34d399",
    accentSoftOpacity: 0.24,
    badgeFill: "rgba(10,24,21,0.5)",
    shadeTopOpacity: 0.08,
    shadeMidOpacity: 0.18,
    shadeBottomOpacity: 0.92,
    titleYOffsetRatio: 0.41,
    glowX: 0.22,
    glowY: 0.18,
    glowScaleX: 0.82,
    glowScaleY: 0.52,
  },
  nocturno: {
    accent: "#38bdf8",
    accentSoftOpacity: 0.32,
    badgeFill: "rgba(9,15,36,0.62)",
    shadeTopOpacity: 0.14,
    shadeMidOpacity: 0.26,
    shadeBottomOpacity: 0.94,
    titleYOffsetRatio: 0.38,
    glowX: 0.76,
    glowY: 0.14,
    glowScaleX: 0.88,
    glowScaleY: 0.58,
  },
  premium: {
    accent: "#d4af37",
    accentSoftOpacity: 0.22,
    badgeFill: "rgba(38,29,11,0.56)",
    shadeTopOpacity: 0.06,
    shadeMidOpacity: 0.17,
    shadeBottomOpacity: 0.93,
    titleYOffsetRatio: 0.35,
    glowX: 0.5,
    glowY: 0.13,
    glowScaleX: 0.96,
    glowScaleY: 0.42,
  },
}

const VISUAL_STYLE_PRESENTATION: Record<VisualStyleChoice, OverlayPresentation> = {
  elegante: {
    sidePaddingRatio: 0.1,
    topPaddingRatio: 0.075,
    bottomPaddingRatio: 0.09,
    eyebrowScale: 0.92,
    metaScale: 0.92,
    titleScale: 0.9,
    bodyScale: 0.94,
    titleMaxCharsPortrait: 14,
    titleMaxCharsLandscape: 20,
    subtitleMaxCharsPortrait: 28,
    subtitleMaxCharsLandscape: 42,
    footerMaxCharsPortrait: 30,
    footerMaxCharsLandscape: 44,
    titleAlign: "start",
    contentWidthRatio: 0.54,
    dividerWidthRatio: 0.16,
    dividerStroke: 3,
    badgeStyle: "outline",
    badgeCornerRatio: 0.22,
  },
  comercial: {
    sidePaddingRatio: 0.08,
    topPaddingRatio: 0.07,
    bottomPaddingRatio: 0.08,
    eyebrowScale: 1,
    metaScale: 1,
    titleScale: 1,
    bodyScale: 1,
    titleMaxCharsPortrait: 16,
    titleMaxCharsLandscape: 22,
    subtitleMaxCharsPortrait: 32,
    subtitleMaxCharsLandscape: 48,
    footerMaxCharsPortrait: 34,
    footerMaxCharsLandscape: 54,
    titleAlign: "start",
    contentWidthRatio: 0.6,
    dividerWidthRatio: 0.26,
    dividerStroke: 5,
    badgeStyle: "pill",
    badgeCornerRatio: 0.5,
  },
  nocturno: {
    sidePaddingRatio: 0.085,
    topPaddingRatio: 0.06,
    bottomPaddingRatio: 0.085,
    eyebrowScale: 1.02,
    metaScale: 1.04,
    titleScale: 1.06,
    bodyScale: 0.98,
    titleMaxCharsPortrait: 15,
    titleMaxCharsLandscape: 21,
    subtitleMaxCharsPortrait: 30,
    subtitleMaxCharsLandscape: 44,
    footerMaxCharsPortrait: 32,
    footerMaxCharsLandscape: 46,
    titleAlign: "start",
    contentWidthRatio: 0.58,
    dividerWidthRatio: 0.22,
    dividerStroke: 6,
    badgeStyle: "square",
    badgeCornerRatio: 0.16,
  },
  premium: {
    sidePaddingRatio: 0.09,
    topPaddingRatio: 0.065,
    bottomPaddingRatio: 0.09,
    eyebrowScale: 0.98,
    metaScale: 1,
    titleScale: 1.08,
    bodyScale: 0.96,
    titleMaxCharsPortrait: 14,
    titleMaxCharsLandscape: 20,
    subtitleMaxCharsPortrait: 28,
    subtitleMaxCharsLandscape: 40,
    footerMaxCharsPortrait: 30,
    footerMaxCharsLandscape: 42,
    titleAlign: "middle",
    contentWidthRatio: 0.7,
    dividerWidthRatio: 0.32,
    dividerStroke: 4,
    badgeStyle: "outline",
    badgeCornerRatio: 0.28,
  },
}

const STYLE_ART_DIRECTION: Record<PromotionType | "event", string[]> = {
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

type PromptStyleLayer = {
  styleIdentity: string[]
  commercialIntent: string[]
  negativeConstraints: string[]
}

const VISUAL_STYLE_LAYERS: Record<VisualStyleChoice, PromptStyleLayer> = {
  elegante: {
    styleIdentity: [
      "palette direction: warm ivory, soft charcoal, muted champagne, restrained warm neutrals",
      "lighting direction: soft diffused side light with delicate highlight rolloff and low glare",
      "background direction: calm editorial setting with controlled depth and generous quiet negative space",
      "materials direction: matte ceramics, linen, brushed stone, subtle glass, understated luxury finishes",
      "framing direction: minimal composition, balanced asymmetry, refined breathing room, elegant crop discipline",
    ],
    commercialIntent: [
      "commercial intent: quiet luxury editorial campaign for fine dining and premium hospitality",
      "prioritize sophistication, restraint, timelessness, and polished refinement over obvious sales energy",
      "the scene should feel curated by an art director for a premium restaurant brand rather than a discount promotion",
    ],
    negativeConstraints: [
      "avoid loud saturated color, aggressive call-to-action energy, exaggerated contrast, and flashy props",
      "avoid nightclub glow, neon-heavy treatment, chaotic styling, and mass-market promo aesthetics",
      "avoid cluttered tables, excessive garnish, cheap decorative elements, and noisy backgrounds",
    ],
  },
  comercial: {
    styleIdentity: [
      "palette direction: brighter appetizing hues, warm highlights, cleaner separation between subject and background",
      "lighting direction: crisp commercial lighting with stronger front-side definition and energetic contrast",
      "background direction: simplified ad-ready setting with clearer focal hierarchy and immediate readability",
      "materials direction: polished surfaces, appetizing texture clarity, cleaner reflections, sharper product definition",
      "framing direction: bold hero framing, direct composition, strong center of interest, optimized for fast social impact",
    ],
    commercialIntent: [
      "commercial intent: high-conversion restaurant advertising made to sell quickly and read instantly",
      "prioritize appetite appeal, immediacy, clarity, and campaign usability over subtle editorial nuance",
      "the image should feel like a premium but accessible paid ad designed for promotion performance",
    ],
    negativeConstraints: [
      "avoid subdued luxury minimalism that weakens readability or urgency",
      "avoid overly dark scenes, overly artistic framing, and atmospheric ambiguity that reduces conversion clarity",
      "avoid weak contrast, tiny subjects, and empty compositions with no immediate focal punch",
    ],
  },
  nocturno: {
    styleIdentity: [
      "palette direction: black, blue-black, deep burgundy, petrol tones, selective electric accents",
      "lighting direction: dramatic rim light, glossy specular edges, deep shadow pockets, selective ambient glow",
      "background direction: after-dark hospitality atmosphere with cinematic depth and premium nightlife mood",
      "materials direction: reflective glass, lacquered surfaces, subtle haze, metallic highlights, sensual textures",
      "framing direction: moody cinematic crop, stronger shadow dominance, immersive depth, memorable silhouette separation",
    ],
    commercialIntent: [
      "commercial intent: upscale nightlife and after-dark hospitality campaign with seductive premium energy",
      "prioritize mood, memorability, tension, and atmosphere while preserving clear hierarchy for poster use",
      "the result should feel like a premium bar, cocktail, or evening venue campaign rather than daytime restaurant advertising",
    ],
    negativeConstraints: [
      "avoid bright daylight treatment, pastel palette, flat catalog lighting, and family-friendly promo tone",
      "avoid amateur club clichés, chaotic crowds, oversaturated neon overload, and cheap party aesthetics",
      "avoid muddy shadows, unreadable focal subjects, and random background clutter competing with the hero",
    ],
  },
  premium: {
    styleIdentity: [
      "palette direction: rich dark neutrals, sculpted highlights, selective jewel-toned accents, elevated contrast",
      "lighting direction: sculpted cinematic lighting with high production polish and intentional luxury falloff",
      "background direction: prestigious brand world with controlled depth, dramatic atmosphere, and elite campaign presence",
      "materials direction: premium glass, stone, metal, lacquer, elevated food or beverage textures, expensive tactile detail",
      "framing direction: art-directed composition with sharper editorial decisions, aspirational balance, and luxury campaign authority",
    ],
    commercialIntent: [
      "commercial intent: top-tier hospitality brand campaign with exclusive, aspirational, high-production-value impact",
      "prioritize prestige, desirability, and elite brand perception over mass-market accessibility",
      "the image should look expensive enough for a flagship launch, luxury menu drop, or signature venue campaign",
    ],
    negativeConstraints: [
      "avoid discount-promo energy, generic stock-photo framing, and simple catalog lighting",
      "avoid cheerful low-end commercial styling, obvious social media gimmicks, and cluttered ad tropes",
      "avoid casual props, weak material rendering, and anything that reduces the sense of exclusivity",
    ],
  },
}

// ─── Helpers de tipo y dimensión ──────────────────────────────────────────────

function inferPromotionTypeFromText(title?: string, description?: string) {
  const content = `${title || ""} ${description || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  if (/(coctel|cocktail|vino|cerveza|beer|cafe|coffee|trago|drink|whisky|ron|gin|spritz|mojito|margarita)/.test(content)) {
    return "bebida" as const
  }
  if (/(menu|carta|degustacion|seleccion|entrada y plato|varios platos)/.test(content)) {
    return "menu" as const
  }
  if (/(pizza|burger|hamburguesa|pasta|risotto|sushi|postre|steak|carne|pollo|salmon|plato)/.test(content)) {
    return "plato" as const
  }
  return "general" as const
}

function resolvePromotionType(body: PosterRequest): PromotionType {
  if (isValidPromotionType(body.promotionType)) {
    return body.promotionType
  }

  return inferPromotionTypeFromText(body.title, body.secondaryText || body.subtitle)
}

function getVisualStyle(body: PosterRequest): PosterVisualStyle {
  const baseStyle = body.mode === "event" ? VISUAL_STYLES["event"] : VISUAL_STYLES[resolvePromotionType(body)]
  return {
    ...baseStyle,
    ...VISUAL_STYLE_OVERLAY_OVERRIDES[resolveVisualStyle(body)],
  }
}

function resolveVisualStyle(body: PosterRequest): VisualStyleChoice {
  return isValidVisualStyle(body.visualStyle) ? body.visualStyle : "comercial"
}

function getStyleDirection(body: PosterRequest): string[] {
  if (body.mode === "event") return STYLE_ART_DIRECTION["event"]
  return STYLE_ART_DIRECTION[resolvePromotionType(body)]
}

function getVisualStylePromptLayer(body: PosterRequest): PromptStyleLayer {
  return VISUAL_STYLE_LAYERS[resolveVisualStyle(body)]
}

function getOverlayPresentation(body: PosterRequest): OverlayPresentation {
  return VISUAL_STYLE_PRESENTATION[resolveVisualStyle(body)]
}

function getDimensions(size?: PosterRequest["size"]): PosterDimensions {
  if (size === "1536x1024") return { width: 1536, height: 1024 }
  if (size === "1024x1024") return { width: 1024, height: 1024 }
  return { width: 1024, height: 1536 }
}

// ─── Helpers de texto ─────────────────────────────────────────────────────────

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Divide un texto en líneas respetando palabras completas.
 * Corregido: usa índice de palabras para detectar truncamiento correctamente.
 */
function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return [""]

  const lines: string[] = []
  let wordIndex = 0

  while (wordIndex < words.length && lines.length < maxLines) {
    let line = words[wordIndex]!
    wordIndex++

    while (wordIndex < words.length) {
      const candidate = `${line} ${words[wordIndex]}`
      if (candidate.length > maxCharsPerLine) break
      line = candidate
      wordIndex++
    }

    lines.push(line)
  }

  // Si quedan palabras sin renderizar, truncar la última línea
  if (wordIndex < words.length && lines.length > 0) {
    const last = lines[lines.length - 1]!
    lines[lines.length - 1] = last.replace(/\.{3}$/, "").trimEnd() + "..."
  }

  return lines
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

// ─── Copy del poster ──────────────────────────────────────────────────────────

function getPromotionSupportLine(promotionType?: string) {
  switch (promotionType) {
    case "plato": return "Selección gastronómica con presentación premium"
    case "bebida": return "Bebida protagonista con look nocturno y acabado premium"
    case "menu":  return "Curaduría especial con enfoque editorial para compartir"
    default:      return "Campaña comercial con imagen refinada para restaurante"
  }
}

function getPromotionMetaFallback(promotionType?: string) {
  switch (promotionType) {
    case "plato":  return "PLATO DESTACADO"
    case "bebida": return "BARRA DESTACADA"
    case "menu":   return "MENÚ CURADO"
    default:       return "PROMOCIÓN ESPECIAL"
  }
}

function getPromotionFooterLine(promotionType?: string, promoDate?: string) {
  const d = (promoDate || "").trim()
  switch (promotionType) {
    case "plato":
      return d ? `Ideal para comunicar una propuesta especial ${d.toLowerCase()}` : "Ideal para comunicar una propuesta gastronómica especial"
    case "bebida":
      return d ? `Perfecto para impulsar la barra ${d.toLowerCase()}` : "Perfecto para impulsar la barra con una estética nocturna premium"
    case "menu":
      return d ? `Pensado para destacar el menú ${d.toLowerCase()}` : "Pensado para destacar una selección curada del menú"
    default:
      return d ? `Campaña visual lista para activar ${d.toLowerCase()}` : "Campaña visual lista para comunicar una promoción destacada"
  }
}

function getEventMetaFallback(eventDate?: string) {
  const d = (eventDate || "").trim()
  return d ? d.toUpperCase() : "NOCHE ESPECIAL"
}

function getEventSupportLine(eventText?: string) {
  return (eventText || "").trim() || "Experiencia en vivo con atmósfera premium y convocatoria clara"
}

function getEventFooterLine(eventDate?: string) {
  const d = (eventDate || "").trim()
  return d
    ? `Comunicación lista para promover asistencia ${d.toLowerCase()}`
    : "Comunicación lista para promover una noche especial en el local"
}

function dedupeSupportCopy({ title, meta, subtitle, fallback }: {
  title: string; meta: string; subtitle: string; fallback: string
}) {
  const nTitle    = normalizeCopy(title)
  const nMeta     = normalizeCopy(meta)
  const nSubtitle = normalizeCopy(subtitle)

  if (!nSubtitle) return fallback

  if (
    (nTitle && nSubtitle.includes(nTitle)) ||
    (nMeta  && nSubtitle.includes(nMeta))  ||
    nSubtitle === nTitle ||
    nSubtitle === nMeta
  ) {
    return fallback
  }

  return subtitle
}

function buildPosterCopy(body: PosterRequest) {
  const title = body.title?.trim() || (body.mode === "event" ? "Evento especial" : "Promoción especial")

  if (body.mode === "event") {
    const metaLabel = body.metaText?.trim() || getEventMetaFallback(body.eventDate)
    const subtitle = body.secondaryText?.trim() || dedupeSupportCopy({
      title,
      meta:     body.eventDate?.trim() || "",
      subtitle: body.eventText?.trim() || body.subtitle?.trim() || "",
      fallback: getEventSupportLine(body.eventText),
    })
    return {
      title,
      metaLabel,
      subtitle,
      footer: body.footerText?.trim() || getEventFooterLine(body.eventDate),
    }
  }

  const metaLabel = body.metaText?.trim() || body.promoDate?.trim() || getPromotionMetaFallback(body.promotionType)
  const subtitle = body.secondaryText?.trim() || dedupeSupportCopy({
    title,
    meta:     body.promoDate?.trim() || "",
    subtitle: body.subtitle?.trim() || "",
    fallback: getPromotionSupportLine(body.promotionType),
  })

  return {
    title,
    metaLabel,
    subtitle,
    footer: body.footerText?.trim() || getPromotionFooterLine(body.promotionType, body.promoDate),
  }
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(body: PosterRequest): string {
  const cleanTitle        = body.title?.trim()        || "Promoción gourmet"
  const cleanSubtitle     = body.subtitle?.trim()     || "Afiche publicitario para restaurante"
  const cleanBrief        = "premium commercial art direction, polished composition, restaurant marketing focus"
  const typeLabel         = body.promotionType?.trim()|| "especialidad de la casa"
  const promoTiming       = body.promoDate?.trim()    || "disponible por tiempo limitado"
  const cleanEventDate    = body.eventDate?.trim()    || "próximamente"
  const cleanEventText    = body.eventText?.trim()    || "evento especial en el local"

  const promoType     = resolvePromotionType(body)
  const promotionPreset = PROMOTION_PRESETS[promoType]
  const styleDirection  = getStyleDirection(body)
  const visualStyleLayer = getVisualStylePromptLayer(body)
  const visualStyleName = resolveVisualStyle(body)

  const concept = body.mode === "event"
    ? [
        ...EVENT_PRESET,
        `featured event theme: ${cleanTitle}`,
        `event atmosphere reference: ${cleanEventText}`,
        `secondary context: ${cleanSubtitle}`,
        `schedule context: ${cleanEventDate}`,
        `additional creative direction: ${cleanBrief}`,
        ...styleDirection,
        "people enjoying the venue, ambient lighting, stylish interior, live entertainment mood, clear hierarchy",
      ]
    : [
        ...promotionPreset,
        `promotion theme: ${cleanTitle}`,
        `promotion type: ${typeLabel}`,
        `promotion timing context: ${promoTiming}`,
        `secondary context: ${cleanSubtitle}`,
        `additional creative direction: ${cleanBrief}`,
        ...styleDirection,
        "hero food or drink photography, appetizing presentation, warm cinematic lighting, premium branding, clear focal point",
      ]

  const layoutInstruction = body.size === "1536x1024"
    ? "Use a horizontal advertising layout with the focal subject offset to one side and clean negative space for editorial text overlay."
    : body.size === "1024x1024"
      ? "Use a square campaign layout with a balanced composition and a clear safe zone for copy overlay."
      : "Use a vertical poster layout optimized for restaurant advertising, mobile stories, and printed flyers with a strong subject and generous negative space for copy overlay."

  // Prompt estructurado en secciones para mejor comprensión por OpenAI
  const sections = [
    `[CONCEPT] ${concept.join(". ")}.`,
    `[STYLE_IDENTITY] selected visual style: ${visualStyleName}. ${visualStyleLayer.styleIdentity.join(". ")}.`,
    `[COMMERCIAL_INTENT] ${visualStyleLayer.commercialIntent.join(". ")}.`,
    `[LAYOUT] ${layoutInstruction}`,
    "[QUALITY] Design a polished commercial poster background for a restaurant brand. The image must look like a final advertising background approved by an art director, with deliberate framing, premium lighting, realistic material rendering, and strong visual hierarchy. Keep one clear focal subject or a tightly curated focal grouping. Preserve clean negative space for later copy overlay.",
    `[NEGATIVE_CONSTRAINTS] ${visualStyleLayer.negativeConstraints.join(". ")}.`,
    "[CONSTRAINTS] Do not render any text, letters, typography, logos, price tags, UI, watermark, badge, or signage. Do not invent extra hero objects, do not create clutter, and do not fill the frame with unnecessary props. Avoid cluttered composition, distorted anatomy, extra fingers, low quality rendering, random objects, cheap stock-photo aesthetics, and busy unreadable details. The result must feel premium, realistic, campaign-ready, and visually distinct for the selected style.",
  ]

  return sections.join("\n\n")
}

// ─── Overlay SVG ──────────────────────────────────────────────────────────────

function buildPosterOverlay(body: PosterRequest, dimensions: PosterDimensions): string {
  const { width, height } = dimensions
  const isLandscape = width > height
  const style = getVisualStyle(body)
  const presentation = getOverlayPresentation(body)

  const sidePadding       = Math.round(width * presentation.sidePaddingRatio)
  const topPadding        = Math.round(height * presentation.topPaddingRatio)
  const bottomPadding     = Math.round(height * presentation.bottomPaddingRatio)
  const eyebrowFontSize   = Math.round(width * 0.028 * presentation.eyebrowScale)
  const metaFontSize      = Math.round(width * 0.034 * presentation.metaScale)
  const titleFontSize     = Math.round((isLandscape ? width : height) * (isLandscape ? 0.055 : 0.05) * presentation.titleScale)
  const bodyFontSize      = Math.round(width * 0.03 * presentation.bodyScale)
  const titleMaxChars     = isLandscape ? presentation.titleMaxCharsLandscape : presentation.titleMaxCharsPortrait
  const subtitleMaxChars  = isLandscape ? presentation.subtitleMaxCharsLandscape : presentation.subtitleMaxCharsPortrait
  const footerMaxChars    = isLandscape ? presentation.footerMaxCharsLandscape : presentation.footerMaxCharsPortrait

  const copy      = buildPosterCopy(body)
  const modeLabel = body.mode === "event" ? "EVENTO" : "PROMOCIÓN"
  const accent    = style.accent
  const { title, subtitle, footer, metaLabel } = copy
  const contentWidth = Math.round(width * presentation.contentWidthRatio)
  const titleX = presentation.titleAlign === "middle" ? Math.round(width / 2) : sidePadding
  const textAnchor = presentation.titleAlign === "middle" ? "middle" : "start"
  const badgeHeight= Math.round(height * 0.058)
  const badgeWidth = Math.max(Math.round(width * 0.2), modeLabel.length * eyebrowFontSize + 80)
  const badgeY     = topPadding
  const badgeX =
    presentation.titleAlign === "middle"
      ? Math.round((width - badgeWidth) / 2)
      : sidePadding
  const badgeRadius =
    presentation.badgeStyle === "pill"
      ? Math.round(badgeHeight / 2)
      : Math.round(badgeHeight * presentation.badgeCornerRatio)

  const titleLines    = wrapText(title,    titleMaxChars,    isLandscape ? 3 : 4)
  const subtitleLines = wrapText(subtitle, subtitleMaxChars, 3)
  const footerLines   = wrapText(footer || style.footerText, footerMaxChars, 2)

  const titleLineHeight   = Math.round(titleFontSize * 1.04)
  const bodyLineHeight    = Math.round(bodyFontSize  * 1.35)
  const footerLineHeight  = Math.round(metaFontSize  * 1.3)
  const titleBlockHeight  = titleLines.length    * titleLineHeight
  const subtitleBlockHeight = subtitleLines.length * bodyLineHeight
  const footerBlockHeight = footerLines.length   * footerLineHeight

  const footerY    = height - bottomPadding
  const subtitleY  = footerY - footerBlockHeight - Math.round(height * 0.035)
  const titleY     = subtitleY - subtitleBlockHeight - Math.round(height * 0.05)
  const safeTitleY = Math.max(titleY, Math.round(height * style.titleYOffsetRatio))
  const metaY      = safeTitleY - Math.round(height * 0.055)

  const renderLines = (lines: string[], x: number, y: number, lineHeight: number) =>
    lines
      .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
      .join("")

  const badgeFill =
    presentation.badgeStyle === "outline"
      ? "rgba(255,255,255,0.04)"
      : style.badgeFill
  const badgeStroke = presentation.badgeStyle === "square" ? accent : "url(#glassLine)"
  const dividerStartX = presentation.titleAlign === "middle" ? Math.round((width - width * presentation.dividerWidthRatio) / 2) : sidePadding
  const dividerEndX = presentation.titleAlign === "middle"
    ? Math.round((width + width * presentation.dividerWidthRatio) / 2)
    : Math.min(width - sidePadding, sidePadding + width * presentation.dividerWidthRatio)
  const metaX = presentation.titleAlign === "middle" ? Math.round(width / 2) : sidePadding
  const footerX = presentation.titleAlign === "middle" ? Math.round(width / 2) : sidePadding
  const subtitleTextY = safeTitleY + titleBlockHeight + Math.round(height * 0.03)

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="posterShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#040A14" stop-opacity="${style.shadeTopOpacity}" />
      <stop offset="55%"  stop-color="#040A14" stop-opacity="${style.shadeMidOpacity}" />
      <stop offset="100%" stop-color="#040A14" stop-opacity="${style.shadeBottomOpacity}" />
    </linearGradient>
    <radialGradient id="posterGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(${width * style.glowX} ${height * style.glowY}) rotate(37) scale(${width * style.glowScaleX} ${height * style.glowScaleY})">
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

  <rect x="${badgeX}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}"
    rx="${badgeRadius}" fill="${badgeFill}" stroke="${badgeStroke}" stroke-width="${presentation.badgeStyle === "square" ? 1.5 : 1}" />
  <circle cx="${badgeX + 28}" cy="${badgeY + badgeHeight / 2}" r="7" fill="${accent}" />
  <text x="${badgeX + 48}" y="${badgeY + badgeHeight / 2 + eyebrowFontSize * 0.36}"
    fill="#F8FAFC" font-size="${eyebrowFontSize}" font-family="Arial, Helvetica, sans-serif"
    font-weight="700" letter-spacing="2.6">${escapeXml(modeLabel)}</text>

  <text x="${metaX}" y="${Math.max(metaY, badgeY + badgeHeight + Math.round(height * 0.08))}"
    fill="${accent}" font-size="${metaFontSize}" font-family="Arial, Helvetica, sans-serif"
    font-weight="700" letter-spacing="2.2" text-anchor="${textAnchor}">${escapeXml((metaLabel || style.metaFallback).toUpperCase())}</text>

  <text x="${titleX}" y="${safeTitleY}"
    fill="#FFFFFF" font-size="${titleFontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="800" text-anchor="${textAnchor}">
    ${renderLines(titleLines, titleX, safeTitleY, titleLineHeight)}
  </text>

  <foreignObject x="${presentation.titleAlign === "middle" ? Math.round((width - contentWidth) / 2) : sidePadding}" y="${subtitleTextY - bodyFontSize}" width="${contentWidth}" height="${Math.round(bodyLineHeight * 4)}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color: rgba(241,245,249,0.92); font-family: Arial, Helvetica, sans-serif; font-size: ${bodyFontSize}px; font-weight: 500; line-height: ${bodyLineHeight}px; text-align: ${presentation.titleAlign === "middle" ? "center" : "left"};">
      ${escapeXml(subtitleLines.join(" "))}
    </div>
  </foreignObject>

  <line
    x1="${dividerStartX}" y1="${subtitleY - Math.round(height * 0.025)}"
    x2="${dividerEndX}" y2="${subtitleY - Math.round(height * 0.025)}"
    stroke="${accent}" stroke-width="${presentation.dividerStroke}" stroke-linecap="round" />

  <text x="${footerX}" y="${footerY - footerBlockHeight + footerLineHeight * 0.1}"
    fill="rgba(226,232,240,0.78)" font-size="${metaFontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="600" text-anchor="${textAnchor}">
    ${renderLines(footerLines, footerX, footerY - footerBlockHeight + footerLineHeight * 0.1, footerLineHeight)}
  </text>
</svg>`.trim()
}

// ─── Crop ─────────────────────────────────────────────────────────────────────

function getCropPosition(body: PosterRequest): CropPosition {
  const isEvent     = body.mode === "event"
  const isLandscape = body.size === "1536x1024"
  const isSquare    = body.size === "1024x1024"

  if (isEvent) {
    return isLandscape ? "right" : "right top"
  }

  switch (body.promotionType) {
    case "bebida": return isLandscape ? "right" : "right top"
    case "plato":  return isLandscape ? "right centre" : "right top"
    case "menu":   return isLandscape ? "attention" : isSquare ? "centre" : "top"
    default:       return isLandscape ? "right" : isSquare ? "attention" : "right top"
  }
}

// ─── Composición final ────────────────────────────────────────────────────────

async function composePosterImage(base64Image: string, body: PosterRequest): Promise<Buffer> {
  const dimensions  = getDimensions(body.size)
  const baseBuffer  = Buffer.from(base64Image, "base64")
  const overlayBuffer = Buffer.from(buildPosterOverlay(body, dimensions))
  const cropPosition  = getCropPosition(body)

  if (!baseBuffer.length) {
    throw new Error("OpenAI returned empty image bytes.")
  }

  // Comprimir el PNG de salida para reducir el tamaño de la respuesta
  return sharp(baseBuffer)
    .resize(dimensions.width, dimensions.height, {
      fit: "cover",
      position: cropPosition,
    })
    .composite([{ input: overlayBuffer, top: 0, left: 0 }])
    .png({ compressionLevel: 8, effort: 10 })
    .toBuffer()
}

// ─── Validación de imagen de referencia ──────────────────────────────────────

async function validateReferenceImage(file: File): Promise<string | null> {
  const buffer = Buffer.from(await file.arrayBuffer())

  if (!buffer.length) {
    return "La imagen de referencia esta vacia. Sube un PNG, JPG o WEBP valido."
  }

  try {
    const meta = await sharp(buffer).metadata()

    // Para PNG, verificar que tiene canal alfa (requerido por images/edits de OpenAI)
    if (file.type === "image/png" && meta.channels !== 4) {
      return "El PNG de referencia debe tener canal alfa (transparencia). Exporta el PNG con fondo transparente o usa JPG/WEBP."
    }

    // Verificar tamaño razonable (máx 20MB para no agotar memoria serverless)
    if (file.size > 20 * 1024 * 1024) {
      return "La imagen de referencia supera 20 MB. Usa una imagen más liviana."
    }

    return null // válida
  } catch {
    return "No se pudo leer la imagen de referencia. Verifica que el archivo no esté corrupto."
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function POST(request: Request) {
  const apiKey = process.env["OPENAI_API_KEY"]
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY no configurado." }, { status: 500 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin no configurado." }, { status: 500 })
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
  if (!bearer) {
    return NextResponse.json({ error: "No autenticado.", errorCode: "not_authenticated" }, { status: 401 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(bearer)

  if (userError || !user) {
    return NextResponse.json({ error: "Sesion invalida.", errorCode: "invalid_session" }, { status: 401 })
  }

  const plan = getPlanFromMetadata(user.user_metadata as Record<string, unknown> | undefined)

  let posterUsage
  try {
    posterUsage = await getPosterUsageForUser(user.id, plan)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo validar el limite del plan.",
        errorCode: "plan_usage_unavailable",
      },
      { status: 500 },
    )
  }

  if (posterUsage.hasReachedLimit) {
    return NextResponse.json(
      {
        error: `Tu cuenta Free alcanzo el limite de posters de ${posterUsage.limit} ${posterUsage.usageWindowLabel}. Pasate a Premium para seguir generando sin corte.`,
        errorCode: "free_plan_limit_reached",
        upgradeUrl: UPGRADE_URL,
        account: {
          plan,
          posterUsage,
        },
      },
      { status: 403 },
    )
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  const body: PosterRequest = {
    title:         String(formData.get("title")         || ""),
    subtitle:      String(formData.get("subtitle")      || ""),
    metaText:      String(formData.get("metaText")      || ""),
    secondaryText: String(formData.get("secondaryText") || ""),
    footerText:    String(formData.get("footerText")    || ""),
    visualStyle:   isValidVisualStyle(formData.get("visualStyle")) ? (formData.get("visualStyle") as VisualStyleChoice) : "comercial",
    mode:          formData.get("mode") === "event" ? "event" : "promotion",
    promotionType: String(formData.get("promotionType") || ""),
    promoDate:     String(formData.get("promoDate")     || ""),
    eventDate:     String(formData.get("eventDate")     || ""),
    eventText:     String(formData.get("eventText")     || ""),
    size:
      formData.get("size") === "1536x1024" || formData.get("size") === "1024x1024" || formData.get("size") === "1024x1536"
        ? (formData.get("size") as PosterRequest["size"])
        : "1024x1536",
    quality:
      formData.get("quality") === "high" || formData.get("quality") === "auto"
        ? (formData.get("quality") as PosterRequest["quality"])
        : "medium",
  }

  if (!body.title || !body.subtitle) {
    return NextResponse.json({ error: "Título o descripción inválidos." }, { status: 400 })
  }

  const referenceImage    = formData.get("referenceImage")

  if (referenceImage instanceof File && referenceImage.size <= 0) {
    return NextResponse.json(
      { error: "La imagen de referencia esta vacia.", errorCode: "empty_reference_image" },
      { status: 400 },
    )
  }

  const hasReferenceImage = referenceImage instanceof File && referenceImage.size > 0

  if (hasReferenceImage) {
    if (!ALLOWED_REFERENCE_IMAGE_TYPES.has(referenceImage.type)) {
      return NextResponse.json(
        { error: "La imagen de referencia debe ser PNG, JPG o WEBP.", errorCode: "invalid_reference_image_type" },
        { status: 400 },
      )
    }

    // Validar contenido real del archivo (no solo el MIME type declarado)
    const validationError = await validateReferenceImage(referenceImage)
    if (validationError) {
      return NextResponse.json(
        { error: validationError, errorCode: "invalid_reference_image_content" },
        { status: 400 },
      )
    }
  }

  const clientRequestId = randomUUID()
  const controller      = new AbortController()
  const timeout         = setTimeout(() => controller.abort(), OPENAI_IMAGE_TIMEOUT_MS)

  try {
    const prompt = buildPrompt(body)

    const response = hasReferenceImage
      ? await (async () => {
          const openaiFormData = new FormData()
          openaiFormData.append("model",          "gpt-image-1")
          openaiFormData.append("prompt",         prompt)
          openaiFormData.append("size",           body.size    || "1024x1536")
          openaiFormData.append("quality",        body.quality || "medium")
          openaiFormData.append("output_format",  "png")
          openaiFormData.append("input_fidelity", "high")
          openaiFormData.append("image",          referenceImage)

          return fetch("https://api.openai.com/v1/images/edits", {
            method:  "POST",
            headers: {
              Authorization:        `Bearer ${apiKey}`,
              "X-Client-Request-Id": clientRequestId,
            },
            body:    openaiFormData,
            cache:   "no-store",
            signal:  controller.signal,
          })
        })()
      : await fetch("https://api.openai.com/v1/images/generations", {
          method:  "POST",
          headers: {
            Authorization:        `Bearer ${apiKey}`,
            "Content-Type":       "application/json",
            "X-Client-Request-Id": clientRequestId,
          },
          body: JSON.stringify({
            model:         "gpt-image-1",
            prompt,
            size:          body.size    || "1024x1536",
            quality:       body.quality || "medium",
            output_format: "png",
          }),
          cache:  "no-store",
          signal: controller.signal,
        })

    const requestId    = response.headers.get("x-request-id")     || undefined
    const processingMs = response.headers.get("openai-processing-ms") || undefined
    const payload      = (await response.json().catch(() => null)) as (OpenAiSuccessPayload & OpenAiErrorPayload) | null

    if (!response.ok) {
      return NextResponse.json(
        {
          error: classifyOpenAiError({
            status:          response.status,
            message:         payload?.error?.message,
            code:            payload?.error?.code,
            type:            payload?.error?.type,
            hasReferenceImage,
          }),
          errorCode:         payload?.error?.code || payload?.error?.type || "openai_request_failed",
          requestId,
          processingMs,
          usedReferenceImage: hasReferenceImage,
          providerMessage:   payload?.error?.message,
        },
        { status: response.status },
      )
    }

    const imageBase64 = payload?.data?.[0]?.b64_json?.trim()
    if (!imageBase64) {
      return NextResponse.json(
        {
          error:      "OpenAI no devolvió una imagen válida.",
          errorCode:  "missing_image_data",
          requestId,
          processingMs,
          usedReferenceImage: hasReferenceImage,
        },
        { status: 502 },
      )
    }

    const finalPosterBuffer = await composePosterImage(imageBase64, body)

    if (!finalPosterBuffer.length) {
      return NextResponse.json(
        {
          error:      "La imagen final del poster quedo vacia.",
          errorCode:  "empty_poster_image",
          requestId,
          processingMs,
          usedReferenceImage: hasReferenceImage,
        },
        { status: 502 },
      )
    }

    const updatedPosterUsage = await consumePosterGeneration(user.id, plan)

    return NextResponse.json({
      imageUrl:           `data:image/png;base64,${finalPosterBuffer.toString("base64")}`,
      requestId,
      processingMs,
      usedReferenceImage: hasReferenceImage,
      account: {
        plan,
        posterUsage: updatedPosterUsage,
      },
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)

    // Log seguro: nunca incluir headers ni el objeto error completo
    console.error("[posters/openai] request failed", {
      requestId:         clientRequestId,
      usedReferenceImage: hasReferenceImage,
      message:           errorMessage,
      name:              error instanceof Error ? error.name : "unknown",
    })

    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          error:      "OpenAI demoró demasiado en responder. Prueba con una imagen de referencia más liviana o genera el afiche sin imagen.",
          errorCode:  "openai_timeout",
          requestId:  clientRequestId,
          usedReferenceImage: hasReferenceImage,
        },
        { status: 504 },
      )
    }

    if (errorMessage.toLowerCase().includes("fetch failed")) {
      return NextResponse.json(
        {
          error:      "No se pudo conectar con OpenAI. Revisa la conexión, la clave API y el acceso saliente del servidor.",
          errorCode:  "openai_fetch_failed",
          requestId:  clientRequestId,
          usedReferenceImage: hasReferenceImage,
          detail:     errorMessage,
        },
        { status: 502 },
      )
    }

    if (errorMessage.toLowerCase().includes("sharp") || errorMessage.toLowerCase().includes("input buffer")) {
      return NextResponse.json(
        {
          error:      "La imagen fue generada, pero falló la composición final del afiche.",
          errorCode:  "poster_composition_failed",
          requestId:  clientRequestId,
          usedReferenceImage: hasReferenceImage,
          detail:     errorMessage,
        },
        { status: 502 },
      )
    }

    return NextResponse.json(
      {
        error:      "No se pudo completar la solicitud a OpenAI.",
        errorCode:  "openai_network_error",
        requestId:  clientRequestId,
        usedReferenceImage: hasReferenceImage,
        detail:     errorMessage,
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
