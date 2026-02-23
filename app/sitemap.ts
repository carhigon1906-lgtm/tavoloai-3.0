import type { MetadataRoute } from "next"

const BASE_URL = "https://www.tavoloai.it"

const staticRoutes = [
  "/",
  "/register",
  "/premium",
  "/pago",
  "/forgot-password",
  "/menu",
  "/menu/burgers",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return staticRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }))
}
