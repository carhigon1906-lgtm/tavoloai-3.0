import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Menú digital | TavoloAI"
const description = "Explora el menú digital de tu restaurante con categorías, fotos y precios."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/menu" },
  openGraph: {
    title,
    description,
    url: "/menu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function MenuLayout({ children }: { children: ReactNode }) {
  return children
}
