import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Crear cuenta | TavoloAI"
const description = "Regístrate en TavoloAI y comienza a crear tu menú digital con IA."

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
