import type { Metadata } from "next"
import type { ReactNode } from "react"

type LayoutProps = {
  children: ReactNode
  params: { id: string }
}

export function generateMetadata({ params }: LayoutProps): Metadata {
  const title = "Detalle del plato | TavoloAI"
  const description = "Consulta ingredientes y precio del plato en el menú digital."
  const canonical = `/menu/burgers/${params.id}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default function MenuBurgerDetailLayout({ children }: LayoutProps) {
  return children
}
