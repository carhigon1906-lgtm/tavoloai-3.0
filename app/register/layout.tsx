import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Crea un account | TavoloAI"
const description = "Registrati su TavoloAI e inizia a creare il tuo menu digitale con l'IA."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/register" },
  openGraph: {
    title,
    description,
    url: "/register",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children
}
