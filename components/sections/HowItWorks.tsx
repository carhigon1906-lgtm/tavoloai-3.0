// @ts-nocheck
"use client"

import dynamic from "next/dynamic"
import type { TimelineEvent } from "@/components/lightswind/scroll-timeline"
import { useTranslation } from "@/context/TranslationContext"

const ScrollTimeline = dynamic(
  () => import("@/components/lightswind/scroll-timeline").then((mod) => mod.ScrollTimeline),
  { ssr: false },
)

export default function SectionHowItWorks() {
  const { language, dictionary, t } = useTranslation()
  const steps = dictionary.howItWorks.steps
  const sideNote = dictionary.howItWorks.sideNote
  const sideNoteTitle = dictionary.howItWorks.sideNoteTitle

  const events: TimelineEvent[] = steps.map((step, index) => ({
    id: `step-${index + 1}`,
    year: String(index + 1),
    title: step.title,
    description: step.description,
  }))

  const defaultSideNote2Title =
    language === "es"
      ? "Haz que todo se vea irresistible"
      : language === "en"
        ? "Make every dish irresistible"
        : "Rendi irresistibile ogni piatto"

  const defaultSideNote2 =
    language === "es"
      ? "La IA pule fotos y descripciones para que cada plato luzca profesional y apetitoso."
      : language === "en"
        ? "AI polishes photos and descriptions so every dish looks professional and mouth‑watering."
        : "L'IA rifinisce foto e descrizioni così ogni piatto sembra professionale e invitante."

  const sideNote2 = dictionary.howItWorks.sideNote2 || defaultSideNote2
  const sideNote2Title = dictionary.howItWorks.sideNote2Title || defaultSideNote2Title

  const defaultSideNote3Title =
    language === "es"
      ? "Lanza, observa y vende más"
      : language === "en"
        ? "Launch, learn and sell more"
        : "Lancia, osserva e vendi di più"

  const defaultSideNote3 =
    language === "es"
      ? "Comparte tu menú con un clic, reparte QR en mesa y analiza en tiempo real qué funciona mejor."
      : language === "en"
        ? "Share your menu in one click, place QR codes on tables and see in real time what performs best."
        : "Condividi il menù con un clic, metti i QR sui tavoli e analizza in tempo reale cosa funziona meglio."

  const sideNote3 = dictionary.howItWorks.sideNote3 || defaultSideNote3
  const sideNote3Title = dictionary.howItWorks.sideNote3Title || defaultSideNote3Title

  return (
    <section id="how-it-works" className="relative bg-black text-slate-100">
      <ScrollTimeline
        events={events}
        title={t("howItWorks.title")}
        sideNoteTitle={sideNoteTitle}
        sideNote={sideNote}
        sideNote2Title={sideNote2Title}
        sideNote2={sideNote2}
        sideNote3Title={sideNote3Title}
        sideNote3={sideNote3}
        cardAlignment="alternating"
        cardVariant="elevated"
        cardEffect="shadow"
        parallaxIntensity={0.2}
        progressIndicator
        className="py-20"
      />
    </section>
  )
}
