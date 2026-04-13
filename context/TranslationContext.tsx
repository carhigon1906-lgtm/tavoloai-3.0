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

const nativeItalianDictionary: TranslationDictionary = {
  header: {
    languageButton: "Lingua",
    login: "Accedi",
    signup: "Registrati",
    nav: {
      features: "Funzionalità",
      demo: "Demo",
      howItWorks: "Come funziona",
      pricing: "Prezzi",
      cases: "Storie di successo",
      faq: "FAQ",
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
    tagline: "Demo dal vivo",
    title: "Il menu digitale pensato per valorizzare il tuo locale.",
    description: "Aggiorna il menu in pochi secondi, migliora le foto con l'IA e pubblica contenuti promozionali già pronti.",
    primaryCta: "Inizia ora",
    secondaryCta: "Guarda la demo",
    trial: "7 giorni gratis, nessuna carta richiesta, attivazione immediata.",
    liveBadge: "Demo dal vivo",
  },
  features: {
    title: "Uno strumento elegante per gestire menu, immagini e promozioni",
    items: [
      {
        title: "Menu QR pronto in pochi minuti",
        badge: "Subito online",
        description: "Importa il menu da foto o PDF e pubblica un QR curato, pronto da usare in sala.",
      },
      {
        title: "Immagini più curate con l'IA",
        badge: "Più appeal",
        description: "Carica le immagini dal telefono e rendile più coerenti, pulite e invitanti.",
      },
      {
        title: "Aggiornamenti senza attese",
        badge: "Massima rapidità",
        description: "Modifica prezzi, ordine dei piatti e disponibilità in pochi secondi.",
      },
      {
        title: "Promozioni pronte da pubblicare",
        badge: "Subito condivisibili",
        description: "Crea contenuti per Instagram, WhatsApp e schermi interni con testi e visual già pronti.",
      },
      {
        title: "Disponibilità aggiornata in tempo reale",
        badge: "Meno errori",
        description: "Nascondi subito i piatti esauriti e mantieni il menu sempre allineato al servizio.",
      },
      {
        title: "Filtri chiari per ogni esigenza",
        badge: "Esperienza migliore",
        description: "Metti in evidenza opzioni senza glutine, vegetariane o vegane con filtri semplici e immediati.",
      },
      {
        title: "Multilingua senza attriti",
        badge: "Più accessibile",
        description: "Rendi il menu disponibile in italiano, inglese e spagnolo senza riscrivere ogni testo.",
      },
    ],
    prevLabel: "Precedente",
    nextLabel: "Successivo",
    dotAria: "Vai alla slide {{index}}",
  },
  howItWorks: {
    title: "Tutto pronto in 3 passaggi",
    steps: [
      {
        title: "Crea il menu",
        description: "Carica foto, nomi, prezzi e categorie.",
      },
      {
        title: "Migliora con l'IA",
        description: "Testi e immagini vengono rifiniti automaticamente.",
      },
      {
        title: "Condividi e misura",
        description: "Pubblica il QR, lancia le promo e controlla cosa funziona meglio.",
      },
    ],
    sideNoteTitle: "Un menu curato, senza complicazioni",
    sideNote:
      "Trasforma i tuoi piatti in un menu digitale ordinato, moderno e semplice da aggiornare.",
    sideNote2Title: "Foto e testi all'altezza del locale",
    sideNote2:
      "L'IA migliora immagini e descrizioni per dare al menu una presenza più professionale.",
    sideNote3Title: "Pubblica, osserva, affina",
    sideNote3:
      "Condividi il menu con un clic, porta il QR in sala e leggi in tempo reale cosa attira di più.",
  },
  beforeAfter: {
    title: "Il risultato si vede subito",
    beforeLabel: "Prima",
    afterLabel: "Dopo · +23% clic",
    sliderAria: "Confronta prima e dopo",
  },
  cases: {
    title: "Locali che hanno scelto un menu più curato",
    carouselRole: "Carosello di storie di successo",
    cards: [
      {
        name: "Trattoria Roma",
        result: "+18% sulle vendite del piatto in evidenza in 2 settimane",
        quote: "Con un menu più ordinato e il piatto del giorno ben evidenziato, il servizio è più fluido e il risultato si vede.",
      },
      {
        name: "Bar Costa",
        result: "+40% di interazioni sulle promo del weekend",
        quote: "Le promo pronte per WhatsApp ci aiutano a comunicare meglio, soprattutto nei momenti più intensi.",
      },
      {
        name: "La Esquina",
        result: "+22% di ordini medi per tavolo in un mese",
        quote: "Con un menu chiaro e sempre aggiornato, anche il lavoro in sala diventa più lineare.",
      },
    ],
  },
  pricing: {
    title: "Un solo piano, pensato per lavorare bene",
    subtitle: "Tutto incluso, senza vincoli inutili.",
    billingMonthlyLabel: "Piano mensile",
    billingYearlyLabel: "Piano annuale",
    priceLabel: "29 EUR",
    priceSuffix: "/mese",
    features: [
      "Menu illimitati",
      "IA per testi e immagini",
      "Nascondi piatti al volo",
      "Esportazione PDF",
      "Multilingua",
      "Promozioni, poster e banner",
      "Statistiche operative",
      "QR avanzato",
      "Condivisione sui social",
    ],
    cta: "Prova gratis",
    compareTitle: "Perché TavoloAI",
    comparePoints: [
      "Aggiorni menu e prezzi in pochi secondi",
      "Gestisci immagini, promo e QR da un solo pannello",
      "Condividi materiali già pronti su WhatsApp e Instagram",
      "Controlli visite e utilizzo in tempo reale",
    ],
    freePlan: {
      title: "Piano Free",
      subtitle: "Parti gratis e crea il tuo primo menu digitale.",
      features: [
        "1 menu preimpostato",
        "QR base",
        "Modifica semplice dei piatti",
        "Accesso alla dashboard TavoloAI",
      ],
      cta: "Inizia gratis",
    },
  },
  demo: {
    title: "Guarda l'esperienza dal punto di vista del cliente",
    description: "Scansiona il QR oppure usa la simulazione per vedere le azioni principali.",
    tasks: [
      { id: "lang", label: "Cambiare lingua" },
      { id: "gluten", label: "Attivare il filtro senza glutine" },
      { id: "dish", label: "Mettere in evidenza il piatto del giorno" },
      { id: "share", label: "Condividere l'evento su WhatsApp" },
    ],
    glutenButton: "Senza glutine",
    dishHighlight: "Piatto del giorno: Ravioli al limone",
    shareButton: "Condividi l'evento su WhatsApp",
    simulationBadge: "Simulazione interattiva",
    qrAlt: "QR della demo interattiva",
    progressLabel: "{{value}}% completato",
  },
  faq: {
    title: "Le domande più frequenti",
    items: [
      { question: "Serve un'app?", answer: "No. Funziona come web app accessibile via QR, senza download." },
      { question: "Funziona anche offline?", answer: "Sì, puoi contare anche su una versione PDF stampabile." },
      { question: "Posso disdire quando voglio?", answer: "Sì, puoi gestire tutto direttamente dal tuo pannello." },
      { question: "È conforme al GDPR?", answer: "Sì, i dati sono protetti e gestiti nel rispetto della normativa europea." },
      { question: "Mi serve un fotografo?", answer: "No, puoi partire dalle tue foto e migliorarle con l'IA." },
      { question: "Posso personalizzare il design?", answer: "Sì, puoi adattare colori, logo e stile al tuo locale." },
    ],
  },
  finalCta: {
    title: "Porta il tuo menu a un livello più alto",
    description: "Inizia gratis, pubblica il tuo menu digitale e passa al Premium solo quando vuoi.",
    cta: "Inizia ora",
    badge: "Attivazione immediata, nessun vincolo",
  },
  sectionActions: {
    infoLabel: "Altre info",
    hideLabel: "Nascondi info",
    primaryCta: "Prova gratis",
  },
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
        pricing: "Planes",
        cases: "Casos",
        faq: "Ayuda",
      },
      languages: {
        es: "Español",
        en: "Ingles",
        it: "Italiano",
      },
    },
    floatingCta: {
      label: "Empieza Ya",
    },
    hero: {
      tagline: "Demo en vivo",
      title: "Gestion inteligente para tu carta digital",
      description: "Mas que un MENU QR, inteligencia artificial y presentaciÃ³n moderna para tu restaurante",
      primaryCta: "Empezar gratis",
      secondaryCta: "Ver como funciona",
      trial: "7 dias gratis, sin tarjeta, cancela cuando quieras.",
      liveBadge: "Demo en vivo",
    },
    features: {
      title: "Solo TavoloAI puede hacer",
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
      title: "Planes",
      subtitle: "Sin contratos. Cancela cuando quieras.",
      billingMonthlyLabel: "Plan mensual",
      billingYearlyLabel: "Plan anual",
      priceLabel: "29 Ã¢â€šÂ¬",
      priceSuffix: "/mes",
      features: [
        "MenÃºs ilimitados",
        "IA para textos e imÃ¡genes",
        "Ocultar platos",
        "Descarga en PDF",
        "Multiidioma",
        "Promociones y afiches",
        "EstadÃ­sticas",
        "QR avanzado",
        "Comparte en redes",
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
          title: "Plan Free",
          subtitle: "Empieza gratis y crea tu primera carta digital.",
          features: [
            "1 menÃº prediseÃ±ado",
            "QR bÃ¡sico",
            "EdiciÃ³n simple de platos",
            "Acceso al panel TavoloAI",
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
        { question: "Â¿Necesito app?", answer: "No, funciona como web app QR sin descargas." },
        { question: "Â¿Funciona sin internet?", answer: "Si, incluye version PDF imprimible." },
        { question: "Â¿Puedo cancelar cuando quiera?", answer: "Si, con un clic desde tu panel." },
        { question: "Â¿Cumple GDPR?", answer: "SÃ­, los datos estÃ¡n protegidos y alojados en la UE." },
        { question: "Â¿Necesito fotÃ³grafo?", answer: "No, la IA genera imÃ¡genes por ti." },
        { question: "Â¿Puedo personalizar diseÃ±o?", answer: "SÃ­, puedes cambiar colores, logo y tipografÃ­a." },
      ],
    },
    finalCta: {
      title: "Empieza gratis hoy",
      description: "Pasate a Premium cuando quieras",
      cta: "Empieza Ya",
      badge: "Cancela cuando quieras sin contratos",
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
      subtitle: "No contracts. Cancel anytime.",
      billingMonthlyLabel: "Monthly plan",
      billingYearlyLabel: "Annual plan",
      priceLabel: "29 Ã¢â€šÂ¬",
      priceSuffix: "/month",
      features: [
        "Unlimited menus",
        "AI for copy and images",
        "Hide dishes",
        "PDF download",
        "Multi-language",
        "Promotions and posters",
        "Analytics",
        "Advanced QR",
        "Share on social",
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
          title: "Free Plan",
          subtitle: "Start free and build your first digital menu.",
          features: ["1 pre-designed menu", "Basic QR", "Simple dish editing", "Access to the TavoloAI dashboard"],
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
  it: nativeItalianDictionary,
}

type TranslationContextValue = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: string, options?: Record<string, string | number>) => string
  dictionary: TranslationDictionary
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined)

export function TranslationProvider({
  initialLanguage = "it",
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
    const dictionary = language === "it" ? nativeItalianDictionary : dictionaries[language]

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
  { code: "it", label: "Italiano" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
]







