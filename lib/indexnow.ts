import { BASE_URL, STATIC_ROUTES } from "@/lib/site"

export const INDEXNOW_KEY = "a0c613ac-7416-491d-95e4-b860d4911cbc"
export const INDEXNOW_KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

export function getDefaultIndexNowUrls() {
  return STATIC_ROUTES.map((path) => `${BASE_URL}${path}`)
}

export async function submitIndexNow(urls: string[]) {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)))

  if (uniqueUrls.length === 0) {
    return { ok: false, status: 400, body: "No URLs to submit." }
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      host: new URL(BASE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: uniqueUrls,
    }),
    cache: "no-store",
  })

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text().catch(() => ""),
  }
}
