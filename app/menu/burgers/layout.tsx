import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Categorías del menú | TavoloAI"
const description = "Navega por las categorías del menú digital y encuentra tus platos favoritos."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/menu/burgers" },
  openGraph: {
    title,
    description,
    url: "/menu/burgers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function MenuBurgersLayout({ children }: { children: ReactNode }) {
  return children
}
