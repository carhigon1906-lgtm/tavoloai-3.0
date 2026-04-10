import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Menu digitale | TavoloAI"
const description = "Esplora il menu digitale del tuo ristorante con categorie, foto e prezzi."

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






