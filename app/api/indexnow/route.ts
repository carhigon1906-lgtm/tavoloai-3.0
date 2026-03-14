import { NextResponse } from "next/server"
import { getDefaultIndexNowUrls, submitIndexNow } from "@/lib/indexnow"

export const runtime = "nodejs"

function isAuthorized(request: Request) {
  const secret = process.env["INDEXNOW_NOTIFY_TOKEN"]
  if (!secret) {
    return process.env["NODE_ENV"] !== "production"
  }

  const url = new URL(request.url)
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const querySecret = url.searchParams.get("secret") || ""

  return bearer === secret || querySecret === secret
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await submitIndexNow(getDefaultIndexNowUrls())
  return NextResponse.json(result, { status: result.ok ? 200 : result.status || 502 })
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { urls?: string[] } | null
  const urls = Array.isArray(body?.urls) ? body!.urls : []

  const result = await submitIndexNow(urls)
  return NextResponse.json(result, { status: result.ok ? 200 : result.status || 502 })
}
