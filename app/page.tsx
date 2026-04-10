import type { JSX } from "react"
import HomeClient from "./HomeClient"

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TavoloAI",
  url: "https://www.tavoloai.it",
  logo: "https://www.tavoloai.it/logoblanco.png",
  description:
    "Software per ristoranti che permette di aggiornare i prezzi, migliorare le foto e lanciare promozioni con l'aiuto dell'intelligenza artificiale.",
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TavoloAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://www.tavoloai.it",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  description:
    "Piattaforma web per ristoranti e attivita di hospitality con menu digitale, miglioramento immagini con IA, promozioni e poster.",
  audience: {
    "@type": "Audience",
    audienceType: "Ristoranti, bar e attivita di hospitality",
  },
}

export default function Page(): JSX.Element {
  return (
    <>
      <HomeClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, softwareSchema]),
        }}
      />
    </>
  )
}

