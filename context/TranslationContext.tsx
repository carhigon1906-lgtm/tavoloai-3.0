"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type LanguageCode = "es" | "en" | "it"

type TranslationValue = string | number | TranslationValue[] | { [key: string]: TranslationValue }

type TranslationDictionary = {
  header: {
    languageButton: string
    login: string
    signup: string
    nav: {
      features: string
      demo: string
      howItWorks: string
      pricing: string
      cases: string
      faq: string
    }
    languages: Record<LanguageCode, string>
  }
  floatingCta: {
    label: string
  }
  hero: {
    tagline: string
    title: string
    description: string
    primaryCta: string
    secondaryCta: string
    trial: string
    liveBadge: string
  }
  features: {
    title: string
    items: Array<{
      title: string
      badge: string
      description: string
    }>
    prevLabel: string
    nextLabel: string
    dotAria: string
  }
  howItWorks: {
    title: string
    steps: Array<{
      title: string
      description: string
    }>
    sideNoteTitle: string
    sideNote: string
    sideNote2Title: string
    sideNote2: string
    sideNote3Title: string
    sideNote3: string
  }
  beforeAfter: {
    title: string
    beforeLabel: string
    afterLabel: string
    sliderAria: string
  }
  cases: {
    title: string
    carouselRole: string
    cards: Array<{
      name: string
      result: string
      quote: string
    }>
  }
  pricing: {
    title: string
    subtitle: string
    billingMonthlyLabel: string
    billingYearlyLabel: string
    priceLabel: string
    priceSuffix: string
    features: string[]
    cta: string
    compareTitle: string
    comparePoints: string[]
    freePlan?: {
      title: string
      subtitle: string
      features: string[]
      cta: string
    }
  }
  demo: {
    title: string
    description: string
    tasks: Array<{ id: string; label: string }>
    glutenButton: string
    dishHighlight: string
    shareButton: string
    simulationBadge: string
    qrAlt: string
    progressLabel: string
  }
  faq: {
    title: string
    items: Array<{ question: string; answer: string }>
  }
  finalCta: {
    title: string
    description: string
    cta: string
    badge: string
  }
  sectionActions: {
    infoLabel: string
    hideLabel: string
    primaryCta: string
  }
}

const dictionaries: Record<LanguageCode, TranslationDictionary> = {
  es: {
    header: {
      languageButton: "Idioma",
      login: "Iniciar sesion",
      signup: "Registrarse",
      nav: {
        features: "Funciones",
        demo: "Demo",
        howItWorks: "Pasos",
        pricing: "Plan",
        cases: "Casos",
        faq: "Ayuda",
      },
      languages: {
        es: "Espanol",
        en: "Ingles",
        it: "Italiano",
      },
    },
    floatingCta: {
      label: "Prueba gratis",
    },
    hero: {
      tagline: "Demo en vivo",
      title: "Gestion inteligente para tu carta digital",
      description: "Mas que un MENU QR, inteligencia artificial y presentación moderna para tu restaurante",
      primaryCta: "Empezar gratis",
      secondaryCta: "Ver como funciona",
      trial: "7 dias gratis, sin tarjeta, cancela cuando quieras.",
      liveBadge: "Demo en vivo",
    },
    features: {
      title: "Lo que solo TavoloAI puede hacer",
      items: [
        {
          title: "Crea tu menu QR en minutos",
          badge: "Listo ya",
          description: "Digitaliza tu carta desde fotos o PDF y publica un QR listo para usar.",
        },
        {
          title: "Fotos mejoradas con IA",
          badge: "Mas ventas",
          description: "Sube tus fotos y deja que la IA las haga lucir profesionales en un solo clic.",
        },
        {
          title: "Edicion instantanea",
          badge: "Ahorra tiempo",
          description: "Edita facilmente el menu del dia: cambia precios, orden y fotos en segundos.",
        },
        {
          title: "Promocion en redes",
          badge: "Listo en 5 s",
          description: "Crea contenido listo para Instagram y WhatsApp con las fotos y textos de tu carta.",
        },
        {
          title: "Ocultar platos al instante",
          badge: "Evita errores",
          description: "Actualiza la disponibilidad de platos en tiempo real, sin complicaciones.",
        },
        {
          title: "Filtros inteligentes",
          badge: "Mejor experiencia",
          description: "Opciones sin gluten, veganas y mas con filtros automaticos.",
        },
        {
          title: "Multi idioma automatico",
          badge: "Sin friccion",
          description: "Traduce tu menu al instante a espanol, ingles o italiano.",
        },
      ],
      prevLabel: "Anterior",
      nextLabel: "Siguiente",
      dotAria: "Ir a la diapositiva {{index}}",
    },
    howItWorks: {
      title: "De fotos a ventas en 3 pasos",
      steps: [
        {
          title: "Crea tu menu",
          description: "Sube fotos y precios.",
        },
        {
          title: "Mejora con IA",
          description: "Imagenes y textos optimizados automaticamente.",
        },
        {
          title: "Comparte y mide",
          description: "QR en mesa, banners listos y estadisticas en vivo.",
        },
      ],
      sideNoteTitle: "Tu carta lista en minutos",
      sideNote:
        "Convierte tus platos en un menu digital apetitoso en minutos, sin disenadores ni complicaciones.",
      sideNote2Title: "Haz que todo se vea irresistible",
      sideNote2:
        "La IA pule fotos y descripciones para que cada plato luzca profesional y apetitoso.",
      sideNote3Title: "Lanza, observa y vende mas",
      sideNote3:
        "Comparte tu menu con un clic, reparte QR en mesa y analiza en tiempo real que funciona mejor.",
    },
    beforeAfter: {
      title: "El poder de la IA en tu menu",
      beforeLabel: "Antes",
      afterLabel: "Despues · +23% clics",
      sliderAria: "Comparar antes y despues",
    },
    cases: {
      title: "Restaurantes que ya venden mas",
      carouselRole: "Carrusel de casos de exito",
      cards: [
        {
          name: "Trattoria Roma",
          result: "+18% ventas del plato destacado (2 semanas)",
          quote: "Ahora destacamos el plato del dia y vuela.",
        },
        {
          name: "Bar Costa",
          result: "+40% interacciones en eventos de fin de semana",
          quote: "Los banners para WhatsApp nos salvaron los viernes.",
        },
        {
          name: "La Esquina",
          result: "+22% en pedidos por mesa (1 mes)",
          quote: "La carta actualizada impulso nuestras reservas.",
        },
      ],
    },
    pricing: {
      title: "Un solo plan, todo incluido.",
      subtitle: "Con un plato extra vendido al dia, el plan se paga solo.",
      billingMonthlyLabel: "Plan mensual",
      billingYearlyLabel: "Plan anual",
      priceLabel: "29 €",
      priceSuffix: "/mes",
      features: [
        "Menus ilimitados",
        "IA para fotos y textos",
        "Analiticas en tiempo real",
        "Banners y eventos",
        "Multi idioma automatico",
        "Filtros y PDF imprimible",
        "1 mes gratis",
      ],
      cta: "Obtener premium",
      compareTitle: "TavoloAI vs alternativas",
        comparePoints: [
          "Mas ventas frente a carta en papel o PDF estatico",
          "Cambios en segundos vs disenadores externos",
          "Banners listos para WhatsApp e Instagram",
          "Estadisticas y control en tiempo real",
        ],
        freePlan: {
          title: "FREE - Empieza gratis",
          subtitle: "Digitaliza tu menu en minutos y prueba TavoloAI sin riesgo.",
          features: [
            "1 menu predisenado listo para usar",
            "Hasta 20 platos con fotos",
            "QR dinamico siempre actualizado",
            "Editar y ocultar/mostrar platos al instante",
            "Busqueda basica e IA ligera para textos",
            "Branding TavoloAI visible",
          ],
          cta: "Empezar gratis",
        },
      },
    demo: {
      title: "Vive la experiencia como cliente",
      description: "Escanea el QR o usa la simulacion para probar las acciones clave.",
      tasks: [
        { id: "lang", label: "Cambiar idioma" },
        { id: "gluten", label: "Activar filtro sin gluten" },
        { id: "dish", label: "Destacar plato del dia" },
        { id: "share", label: "Compartir evento en WhatsApp" },
      ],
      glutenButton: "Sin gluten",
      dishHighlight: "Plato del dia: Ravioli al limon",
      shareButton: "Compartir evento en WhatsApp",
      simulationBadge: "Simulacion interactiva",
      qrAlt: "QR para demo interactiva",
      progressLabel: "{{value}}% completado",
    },
    faq: {
      title: "Respuestas rapidas",
      items: [
        { question: "¿Necesito app?", answer: "No, funciona como web app QR sin descargas." },
        { question: "¿Funciona sin internet?", answer: "Si, incluye version PDF imprimible." },
        { question: "¿Puedo cancelar cuando quiera?", answer: "Si, con un clic desde tu panel." },
        { question: "¿Cumple GDPR?", answer: "Sí, los datos están protegidos y alojados en la UE." },
        { question: "¿Necesito fotógrafo?", answer: "No, la IA genera imágenes por ti." },
        { question: "¿Puedo personalizar diseño?", answer: "Sí, puedes cambiar colores, logo y tipografía." },
      ],
    },
    finalCta: {
      title: "Empieza gratis hoy",
      description: "30 dias gratis. Sube tu menu en 2 minutos y pruebalo sin tarjeta.",
      cta: "Probar gratis",
      badge: "Promocion disponible solo este mes",
    },
    sectionActions: {
      infoLabel: "Mas info",
      hideLabel: "Ocultar info",
      primaryCta: "Prueba gratis",
    },
  },
  en: {
    header: {
      languageButton: "Language",
      login: "Log in",
      signup: "Sign up",
      nav: {
        features: "Features",
        demo: "Demo",
        howItWorks: "How-to",
        pricing: "Pricing",
        cases: "Cases",
        faq: "FAQ",
      },
      languages: {
        es: "Spanish",
        en: "English",
        it: "Italian",
      },
    },
    floatingCta: {
      label: "Start free",
    },
    hero: {
      tagline: "Live demo",
      title: "Make your menu smarter than ever.",
      description: "Edit in seconds, enhance photos, and share promotions with AI.",
      primaryCta: "Start for free",
      secondaryCta: "See how it works",
      trial: "7-day free trial, no card, cancel anytime.",
      liveBadge: "Live demo",
    },
    features: {
      title: "What only TavoloAI can do",
      items: [
        {
          title: "Create your QR menu in minutes",
          badge: "Launch fast",
          description: "Import your menu from photos or PDF and publish a ready-to-scan QR instantly.",
        },
        {
          title: "AI-powered photos",
          badge: "More sales",
          description:
            "Upload photos from your phone and make them look professional with AI in one click.",
        },
        {
          title: "Instant editing",
          badge: "Save time",
          description:
            "Update the daily menu in seconds: change prices, order and photos effortlessly.",
        },
        {
          title: "Social promotion",
          badge: "Ready in 5 s",
          description: "Create ads for your restaurant and share them on social media with AI flair.",
        },
        {
          title: "Hide dishes instantly",
          badge: "Avoid mistakes",
          description: "Update dish availability in real time with zero hassle.",
        },
        {
          title: "Smart filters",
          badge: "Better experience",
          description: "Highlight gluten-free, vegan and more with intelligent auto filters.",
        },
        {
          title: "Automatic multi-language",
          badge: "Frictionless",
          description: "Translate your menu instantly into Spanish, English or Italian.",
        },
      ],
      prevLabel: "Previous",
      nextLabel: "Next",
      dotAria: "Go to slide {{index}}",
    },
    howItWorks: {
      title: "From photos to sales in 3 steps",
      steps: [
        {
          title: "Build your menu",
          description: "Upload photos and prices.",
        },
        {
          title: "Improve with AI",
          description: "Automatically optimized images and copy.",
        },
        {
          title: "Share and track",
          description:
            "Table QR, ready-to-use banners and live analytics so you know what works.",
        },
      ],
      sideNoteTitle: "Your menu ready in minutes",
      sideNote:
        "Turn your dishes into an appetizing digital menu in minutes, no designers or complexity.",
      sideNote2Title: "Make every dish irresistible",
      sideNote2:
        "AI polishes photos and descriptions so every dish looks professional and mouth-watering.",
      sideNote3Title: "Launch, learn and sell more",
      sideNote3:
        "Share your menu in one click, put QR on tables and see in real time what performs best.",
    },
    beforeAfter: {
      title: "AI power for your menu",
      beforeLabel: "Before",
      afterLabel: "After · +23% clicks",
      sliderAria: "Compare before and after",
    },
    cases: {
      title: "Restaurants already selling more",
      carouselRole: "Success stories carousel",
      cards: [
        {
          name: "Trattoria Roma",
          result: "+18% featured dish sales (2 weeks)",
          quote: "We highlight the dish of the day and it flies.",
        },
      ],
    },
    pricing: {
      title: "One plan, everything included.",
      subtitle: "Sell just one extra dish per day and the plan pays for itself.",
      billingMonthlyLabel: "Monthly plan",
      billingYearlyLabel: "Annual plan",
      priceLabel: "29 €",
      priceSuffix: "/month",
      features: [
        "Unlimited menus",
        "AI for photos and copy",
        "Real-time analytics",
        "Banners and events",
        "Automatic multi-language",
        "Filters and printable PDF",
        "1 month free",
      ],
      cta: "Start free",
      compareTitle: "TavoloAI vs alternatives",
        comparePoints: [
          "More sales vs paper or static PDF",
          "Edits in seconds vs external designers",
          "Banners ready for WhatsApp/Instagram",
          "Live stats and full control",
        ],
        freePlan: {
          title: "FREE - Start free",
          subtitle: "Digitize your menu in minutes and try TavoloAI with no risk.",
          features: [
            "1 predesigned menu ready to use",
            "Up to 20 dishes with photos",
            "Dynamic QR always up to date",
            "Edit and hide/show dishes instantly",
            "Basic search and light AI for copy",
            "Visible TavoloAI branding",
          ],
          cta: "Start free",
        },
      },
    demo: {
      title: "Experience it as a guest",
      description: "Scan the QR or use the simulation to try the key actions.",
      tasks: [
        { id: "lang", label: "Change language" },
        { id: "gluten", label: "Toggle gluten-free filter" },
        { id: "dish", label: "Highlight dish of the day" },
        { id: "share", label: "Share event on WhatsApp" },
      ],
      glutenButton: "Gluten-free",
      dishHighlight: "Dish of the day: Lemon ravioli",
      shareButton: "Share event on WhatsApp",
      simulationBadge: "Interactive simulation",
      qrAlt: "QR code for interactive demo",
      progressLabel: "{{value}}% complete",
    },
    faq: {
      title: "Quick answers",
      items: [
        { question: "Do I need an app?", answer: "No, it works as a QR web app, no downloads." },
        { question: "Does it work offline?", answer: "Yes, with a printable PDF version." },
      ],
    },
    finalCta: {
      title: "Start free today",
      description: "30 days free. Upload your menu in 2 minutes, no card required.",
      cta: "Start free",
      badge: "Promotion available only this month",
    },
    sectionActions: {
      infoLabel: "More info",
      hideLabel: "Hide info",
      primaryCta: "Try free",
    },
  },
  it: {
    header: {
      languageButton: "Lingua",
      login: "Accedi",
      signup: "Registrati",
      nav: {
        features: "Funzioni",
        demo: "Demo",
        howItWorks: "Passi",
        pricing: "Piano",
        cases: "Casi",
        faq: "Aiuto",
      },
      languages: {
        es: "Spagnolo",
        en: "Inglese",
        it: "Italiano",
      },
    },
    floatingCta: {
      label: "Prova gratis",
    },
    hero: {
      tagline: "Demo live",
      title: "Il tuo menu piu intelligente che mai.",
      description: "Modifica in pochi secondi, migliora le foto e condividi promozioni con l'IA.",
      primaryCta: "Inizia gratis",
      secondaryCta: "Guarda come funziona",
      trial: "7 giorni gratis, nessuna carta, annulla quando vuoi.",
      liveBadge: "Demo live",
    },
    features: {
      title: "Cosa puo fare solo TavoloAI",
      items: [
        {
          title: "Crea il tuo menu QR in pochi minuti",
          badge: "Subito live",
          description: "Digitalizza il menu da foto o PDF e ottieni subito un QR pronto da scansionare.",
        },
        {
          title: "Foto con IA",
          badge: "Piu vendite",
          description:
            "Carica le foto dal telefono e rendile piu professionali con l'Intelligenza Artificiale.",
        },
      ],
      prevLabel: "Precedente",
      nextLabel: "Successivo",
      dotAria: "Vai alla diapositiva {{index}}",
    },
    howItWorks: {
      title: "Dalle foto alle vendite in 3 passaggi",
      steps: [
        {
          title: "Crea il tuo menu",
          description: "Carica foto e prezzi.",
        },
        {
          title: "Migliora con l'IA",
          description: "Immagini e testi ottimizzati automaticamente.",
        },
        {
          title: "Condividi e misura",
          description: "QR sul tavolo, banner pronti e statistiche in tempo reale.",
        },
      ],
      sideNoteTitle: "Il tuo menu pronto in pochi minuti",
      sideNote:
        "Trasforma i tuoi piatti in un menu digitale invitante in pochi minuti, senza designer.",
      sideNote2Title: "Rendi irresistibile ogni piatto",
      sideNote2:
        "L'IA rifinisce foto e descrizioni cosi ogni piatto sembra professionale e invitante.",
      sideNote3Title: "Lancia, osserva e vendi di piu",
      sideNote3:
        "Condividi il menu con un clic, metti i QR sui tavoli e analizza in tempo reale cosa funziona meglio.",
    },
    beforeAfter: {
      title: "La potenza dell'IA nel tuo menu",
      beforeLabel: "Prima",
      afterLabel: "Dopo · +23% clic",
      sliderAria: "Confronta prima e dopo",
    },
    cases: {
      title: "Ristoranti che vendono gia di piu",
      carouselRole: "Carosello di casi di successo",
      cards: [
        {
          name: "Trattoria Roma",
          result: "+18% vendite del piatto di punta (2 settimane)",
          quote: "Il piatto del giorno va a ruba.",
        },
      ],
    },
    pricing: {
      title: "Un solo piano, tutto incluso.",
      subtitle: "Basta un piatto extra venduto al giorno e il piano si ripaga.",
      billingMonthlyLabel: "Piano mensile",
      billingYearlyLabel: "Piano annuale",
      priceLabel: "29 €",
      priceSuffix: "/mese",
      features: [
        "Menu illimitati",
        "IA per foto e testi",
        "Analitiche in tempo reale",
        "Banner ed eventi",
        "Multilingua automatico",
        "Filtri e PDF stampabile",
        "1 mese gratis",
      ],
      cta: "Inizia gratis",
      compareTitle: "TavoloAI vs alternative",
        comparePoints: [
          "Piu vendite rispetto a carta o PDF statico",
          "Modifiche in pochi secondi vs grafici esterni",
          "Banner pronti per WhatsApp/Instagram",
          "Statistiche e controllo in tempo reale",
        ],
        freePlan: {
          title: "FREE - Inizia gratis",
          subtitle: "Digitalizza il tuo menu in pochi minuti e prova TavoloAI senza rischi.",
          features: [
            "1 menu predefinito pronto all'uso",
            "Fino a 20 piatti con foto",
            "QR dinamico sempre aggiornato",
            "Modifica e nascondi/mostra piatti all'istante",
            "Ricerca base e IA leggera per i testi",
            "Branding TavoloAI visibile",
          ],
          cta: "Inizia gratis",
        },
      },
    demo: {
      title: "Vivilo come cliente",
      description: "Scansiona il QR o usa la simulazione per provare le azioni principali.",
      tasks: [
        { id: "lang", label: "Cambiare lingua" },
        { id: "gluten", label: "Attivare filtro senza glutine" },
      ],
      glutenButton: "Senza glutine",
      dishHighlight: "Piatto del giorno: Ravioli al limone",
      shareButton: "Condividi evento su WhatsApp",
      simulationBadge: "Simulazione interattiva",
      qrAlt: "QR per demo interattiva",
      progressLabel: "{{value}}% completato",
    },
    faq: {
      title: "Risposte rapide",
      items: [
        { question: "Serve un'app?", answer: "No, funziona come web app QR senza download." },
      ],
    },
    finalCta: {
      title: "Inizia gratis oggi",
      description: "30 giorni gratis. Carica il tuo menu in 2 minuti e provalo senza carta.",
      cta: "Prova gratis",
      badge: "Promozione disponibile solo questo mese",
    },
    sectionActions: {
      infoLabel: "Piu info",
      hideLabel: "Nascondi info",
      primaryCta: "Prova gratis",
    },
  },
}

type TranslationContextValue = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: string, options?: Record<string, string | number>) => string
  dictionary: TranslationDictionary
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined)

export function TranslationProvider({
  initialLanguage = "es",
  children,
}: {
  initialLanguage?: LanguageCode
  children: ReactNode
}) {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage)

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguage(initialLanguage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLanguage])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language
    }
  }, [language])

  const value = useMemo<TranslationContextValue>(() => {
    const dictionary = dictionaries[language]

    const resolvePath = (obj: TranslationValue, path: string[]): TranslationValue | undefined => {
      return path.reduce<TranslationValue | undefined>((acc, key) => {
        if (acc && typeof acc === "object" && !Array.isArray(acc)) {
          return (acc as Record<string, TranslationValue>)[key]
        }
        return undefined
      }, obj)
    }

    const interpolate = (template: string, options?: Record<string, string | number>) => {
      if (!options) return template
      return template.replace(/{{(.*?)}}/g, (_, key) => String(options[key.trim()] ?? ""))
    }

    const t = (key: string, options?: Record<string, string | number>) => {
      const value = resolvePath(dictionary as TranslationValue, key.split("."))
      if (typeof value === "string") {
        return interpolate(value, options)
      }
      return key
    }

    return {
      language,
      setLanguage,
      t,
      dictionary,
    }
  }, [language])

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

export const SUPPORTED_LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: "es", label: "Espanol" },
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
]

