import type { JSX } from "react"
import HomeClient from "./HomeClient"

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TavoloAI",
  url: "https://www.tavoloai.it",
  logo: "https://www.tavoloai.it/logoblanco.png",
  description:
    "Software para restaurantes que permite actualizar precios, mejorar fotos y lanzar promociones con ayuda de inteligencia artificial.",
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
    "Plataforma web para restaurantes y hosteleria con menu digital, mejora de imagenes con IA, promociones y afiches.",
  audience: {
    "@type": "Audience",
    audienceType: "Restaurantes, bares y negocios de hosteleria",
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
              Menu digital para restaurantes con IA, promociones y mejora de imagenes.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              TavoloAI ayuda a restaurantes, bares y negocios de hosteleria a actualizar precios, mejorar fotos de
              platos, publicar menus digitales y lanzar promociones visuales en segundos.
            </p>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              La plataforma esta pensada para negocios que quieren vender mas con una presencia digital clara, menus
              faciles de editar y material promocional generado con asistencia de inteligencia artificial.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white">Que puedes hacer con TavoloAI</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Crear y publicar un menu digital accesible desde movil.</li>
              <li>Actualizar precios y productos sin rehacer cartas impresas.</li>
              <li>Mejorar fotos de platos y bebidas con ayuda de IA.</li>
              <li>Generar afiches y promociones para redes sociales y pantalla.</li>
              <li>Gestionar contenido comercial para locales de hosteleria.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="/register" className="rounded-full bg-[#d6a35d] px-4 py-2 font-medium text-black">
                Crear cuenta
              </a>
              <a href="/menu" className="rounded-full border border-white/10 px-4 py-2 text-white/85">
                Ver menu demo
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
