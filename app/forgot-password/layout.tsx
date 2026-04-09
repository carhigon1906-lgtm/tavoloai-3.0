import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Recupera la password | TavoloAI"
const description = "Recupera l'accesso al tuo account TavoloAI tramite un link sicuro."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/forgot-password" },
  openGraph: {
    title,
    description,
    url: "/forgot-password",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children
}
