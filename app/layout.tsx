import "@/styles/globals.css"
import { Inter } from "next/font/google"
import dynamic from "next/dynamic"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

const ClientLayoutWrapper = dynamic(() => import("./ClientLayoutWrapper"))

export const metadata: Metadata = {
  metadataBase: new URL("https://tavoloai.com"),
  title: "TavoloAI - El menú inteligente que vende más",
  description:
    "Actualiza precios, mejora fotos y lanza promos en segundos con IA. El menú digital que trabaja por ti las 24 horas.",
  keywords: ["menú digital", "restaurante", "IA", "inteligencia artificial", "hostelería"],
  openGraph: {
    title: "TavoloAI - El menú inteligente que vende más",
    description: "Actualiza precios, mejora fotos y lanza promos en segundos con IA",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TavoloAI - El menú inteligente que vende más",
    description: "Actualiza precios, mejora fotos y lanza promos en segundos con IA",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/" },
}

export const viewport: Viewport = {
  themeColor: "#007AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#050505] text-slate-100`}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  )
}
