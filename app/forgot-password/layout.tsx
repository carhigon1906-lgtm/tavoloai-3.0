import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Recuperar contraseña | TavoloAI"
const description = "Recupera el acceso a tu cuenta de TavoloAI con un enlace seguro."

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
