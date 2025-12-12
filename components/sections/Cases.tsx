// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import { useTranslation } from "@/context/TranslationContext"

const Marquee = dynamic(
  () => import("@/components/ui/marquee").then((mod) => mod.Marquee),
  { ssr: false },
)

type ReviewCardProps = {
  img: string
  name: string
  username: string
  body: string
  highlight?: string
}

const FALLBACK_REVIEWS: ReviewCardProps[] = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
]

function toHandle(name: string, index: number) {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
  return `@${normalized || `case${index + 1}`}`
}

const ReviewCard = ({ img, name, username, body, highlight }: ReviewCardProps) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-start text-sm text-slate-100",
        "backdrop-blur-lg transition-colors duration-300 hover:bg-white/10",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="h-8 w-8 rounded-full object-cover" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-white">{name}</figcaption>
          <p className="text-xs font-medium text-slate-300">{username}</p>
        </div>
      </div>
      {highlight ? (
        <span className="mt-3 inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
          {highlight}
        </span>
      ) : null}
      <blockquote className="mt-3 text-[13px] leading-relaxed text-slate-200">&ldquo;{body}&rdquo;</blockquote>
    </figure>
  )
}

export default function SectionCases() {
  const { dictionary, t } = useTranslation()
  const cases = dictionary.cases.cards

  const reviews: ReviewCardProps[] =
    cases.length > 0
      ? cases.map((caseItem, index) => ({
          name: caseItem.name,
          username: toHandle(caseItem.name, index),
          body: caseItem.quote,
          img: `https://avatar.vercel.sh/${encodeURIComponent(caseItem.name)}?colors=2563eb,9333ea`,
          highlight: caseItem.result,
        }))
      : FALLBACK_REVIEWS

  const midpoint = Math.ceil(reviews.length / 2)
  const firstRow = reviews.slice(0, midpoint)
  const secondRow = reviews.slice(midpoint)

  return (
    <section id="cases" className="relative overflow-hidden bg-black py-20 text-slate-100">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex w-full flex-col items-center"
      >
        <motion.h2
          variants={fadeInUp}
          className="mb-8 text-center text-3xl font-semibold text-white text-balance md:text-4xl"
        >
          {t("cases.title")}
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className="relative flex w-full max-w-6xl flex-col gap-8 overflow-hidden px-6"
          aria-roledescription={dictionary.cases.carouselRole}
        >
          <Marquee pauseOnHover className="[--duration:28s]">
            {firstRow.map((review) => (
              <ReviewCard key={`${review.username}-row1`} {...review} />
            ))}
          </Marquee>
          {secondRow.length ? (
            <Marquee reverse pauseOnHover className="[--duration:28s]">
              {secondRow.map((review) => (
                <ReviewCard key={`${review.username}-row2`} {...review} />
              ))}
            </Marquee>
          ) : null}

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-black via-black/60 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
