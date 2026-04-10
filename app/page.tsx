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

      <section className="border-t border-white/10 bg-[#050505] px-6 py-16 text-slate-200 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d6a35d]">TavoloAI</p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Menu digitale per ristoranti con IA, promozioni e miglioramento immagini.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              TavoloAI aiuta ristoranti, bar e attivita dell'ospitalita ad aggiornare i prezzi, migliorare le foto dei
              piatti, pubblicare menu digitali e lanciare promozioni visive in pochi secondi.
            </p>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              La piattaforma e pensata per i locali che vogliono vendere di piu con una presenza digitale chiara, menu
              facili da aggiornare e materiale promozionale generato con il supporto dell'intelligenza artificiale.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white">Cosa puoi fare con TavoloAI</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Creare e pubblicare un menu digitale accessibile da smartphone.</li>
              <li>Aggiornare prezzi e prodotti senza rifare menu stampati.</li>
              <li>Migliorare foto di piatti e bevande con l'aiuto dell'IA.</li>
              <li>Generare poster e promozioni per social e schermi interni.</li>
              <li>Gestire contenuti commerciali per locali e attivita di hospitality.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="/register" className="rounded-full bg-[#d6a35d] px-4 py-2 font-medium text-black">
                Crea account
              </a>
              <a href="/menu" className="rounded-full border border-white/10 px-4 py-2 text-white/85">
                Vedi menu demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, softwareSchema]),
        }}
      />
    </>
  )
}

