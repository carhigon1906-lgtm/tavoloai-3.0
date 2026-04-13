import "@/styles/globals.css"
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google"
import dynamic from "next/dynamic"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

const ClientLayoutWrapper = dynamic(() => import("./ClientLayoutWrapper"))
const googleVerification = process.env["GOOGLE_SITE_VERIFICATION"]
const bingVerification = process.env["BING_SITE_VERIFICATION"]

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tavoloai.it"),
  title: "TavoloAI - Il menu intelligente che aiuta a vendere di più",
  description:
    "Aggiorna prezzi, migliora le foto e pubblica promozioni in pochi secondi con l'IA. Il menu digitale che lavora per il tuo locale ogni giorno.",
  keywords: ["menu digitale", "ristorante", "IA", "intelligenza artificiale", "ospitalità"],
  applicationName: "TavoloAI",
  category: "restaurant software",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logoblanco.png",
  },
  openGraph: {
    title: "TavoloAI - Il menu intelligente che aiuta a vendere di più",
    description: "Aggiorna prezzi, migliora le foto e pubblica promozioni in pochi secondi con l'IA",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TavoloAI - Il menu intelligente che aiuta a vendere di più",
    description: "Aggiorna prezzi, migliora le foto e pubblica promozioni in pochi secondi con l'IA",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/" },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
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
    <html lang="it" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#050505] text-slate-100`}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <Analytics />
      </body>
    </html>
  )
}



