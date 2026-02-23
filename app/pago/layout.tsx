import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Pago | TavoloAI"
const description = "Configura tu plan y completa el pago de TavoloAI de forma segura."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pago" },
  openGraph: {
    title,
    description,
    url: "/pago",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function PagoLayout({ children }: { children: ReactNode }) {
  return children
}
