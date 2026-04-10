import type { Metadata } from "next"
import type { ReactNode } from "react"

const title = "Categorie del menu | TavoloAI"
const description = "Sfoglia le categorie del menu digitale e trova i tuoi piatti preferiti."

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






