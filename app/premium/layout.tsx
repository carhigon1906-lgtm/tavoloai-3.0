import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Plan Premium | TavoloAI"
const description = "Descubre todas las funciones del Plan Premium para menús digitales y promociones con IA."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/premium" },
  openGraph: {
    title,
    description,
    url: "/premium",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function PremiumLayout({ children }: { children: ReactNode }) {
  return children
}
