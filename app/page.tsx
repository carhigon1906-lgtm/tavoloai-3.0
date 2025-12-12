// @ts-nocheck
"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp } from "@/lib/motion"
import { SUPPORTED_LANGUAGES, type LanguageCode, useTranslation } from "@/context/TranslationContext"
import { GithubIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, Globe } from "lucide-react"

const SectionHero = dynamic(() => import("@/components/sections/Hero"))
const SectionFeatures = dynamic(() => import("@/components/sections/Features"))
const SectionDemo = dynamic(() => import("@/components/sections/Demo"))
const SectionBeforeAfter = dynamic(() => import("@/components/sections/BeforeAfter"))
const SectionHowItWorks = dynamic(() => import("@/components/sections/HowItWorks"))
const SectionPricing = dynamic(() => import("@/components/sections/Pricing"))
const SectionCases = dynamic(() => import("@/components/sections/Cases"))
const SectionFAQ = dynamic(() => import("@/components/sections/FAQ"))
const SectionFinalCTA = dynamic(() => import("@/components/sections/FinalCTA"))

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.995,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      duration: 0.5,
      ease: [0.22, 0.9, 0.3, 1],
    },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 0.9, 0.3, 1],
      staggerChildren: 0.12,
      delayChildren: 0.08,
      when: "beforeChildren",
    },
  },
}

const sharedViewport = { once: true, margin: "-80px", amount: 0.3 }

const showDemoSection = false

const contentSections = [
  { key: "features", Component: SectionFeatures, className: "w-full overflow-visible" },
  { key: "demo", Component: SectionDemo },
  { key: "how-it-works", Component: SectionHowItWorks },
  {
    key: "before-after",
    Component: SectionBeforeAfter,
    className: "w-screen -mx-[calc((100vw-100%)/2)] px-0 overflow-visible",
  },
  { key: "pricing", Component: SectionPricing },
  { key: "cases", Component: SectionCases },
  { key: "faq", Component: SectionFAQ },
  { key: "final-cta", Component: SectionFinalCTA, className: "w-full pt-8 md:pt-12" },
]

const visibleSections = showDemoSection ? contentSections : contentSections.filter(({ key }) => key !== "demo")

export default function Page() {
  const pricingVideoRef = useRef<HTMLVideoElement | null>(null)
  const pricingTriggerRef = useRef<HTMLDivElement | null>(null)
  const langMenuRef = useRef<HTMLDivElement | null>(null)
  const pricingActiveRef = useRef(false)
  const activationDelayRef = useRef<number | null>(null)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [pricingActive, setPricingActive] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { language, setLanguage, dictionary, t } = useTranslation()
  const navLinks = dictionary.header.nav

  const footerColumns = useMemo(
    () => [
      {
        title: "Producto",
        links: [
          { label: navLinks.features, href: "#features" },
          { label: navLinks.demo, href: "#demo" },
          { label: navLinks.howItWorks, href: "#how-it-works" },
          { label: navLinks.pricing, href: "#pricing" },
          { label: navLinks.cases, href: "#cases" },
          { label: navLinks.faq, href: "#faq" },
        ],
      },
      {
        title: "Soluciones",
        links: dictionary.features.items.map((item) => ({
          label: item.title,
          href: "#features",
        })),
      },
      {
        title: "Recursos",
        links: [
          { label: dictionary.demo.title, href: "#demo" },
          { label: dictionary.beforeAfter.title, href: "#before-after" },
          { label: dictionary.cases.title, href: "#cases" },
          { label: dictionary.sectionActions.primaryCta, href: "#final-cta" },
        ],
      },
      {
        title: "Soporte",
        links: [
          { label: dictionary.pricing.title, href: "#pricing" },
          { label: dictionary.faq.title, href: "#faq" },
          { label: dictionary.sectionActions.infoLabel, href: "#faq" },
          { label: "Contacto", href: "#final-cta" },
        ],
      },
    ],
    [
      dictionary.beforeAfter.title,
      dictionary.cases.title,
      dictionary.features.items,
      dictionary.faq.title,
      dictionary.pricing.title,
      dictionary.sectionActions.infoLabel,
      dictionary.sectionActions.primaryCta,
      dictionary.demo.title,
      navLinks,
    ],
  )

  const languageOptions = SUPPORTED_LANGUAGES.map((option) => ({
    ...option,
    label: dictionary.header.languages[option.code],
  }))

  useEffect(() => {
    if (!showLangMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showLangMenu])

  const handleLanguageChange = (code: LanguageCode) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.set("lang", code)
    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname

    setLanguage(code)
    setShowLangMenu(false)
    router.replace(nextUrl, { scroll: false })
  }

  const currentLanguageLabel = dictionary.header.languages[language]

  useEffect(() => {
    const trigger = pricingTriggerRef.current
    if (!trigger) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry?.intersectionRatio ?? 0
        const isHalfVisible = ratio >= 0.5
        const fullyOut = ratio === 0

        if (isHalfVisible) {
          if (activationDelayRef.current === null && !pricingActiveRef.current) {
            activationDelayRef.current = window.setTimeout(() => {
              activationDelayRef.current = null
              if (!pricingActiveRef.current) {
                pricingActiveRef.current = true
                setPricingActive(true)
              }
            }, 400)
          }
        } else {
          if (activationDelayRef.current) {
            window.clearTimeout(activationDelayRef.current)
            activationDelayRef.current = null
          }
        }

        if (fullyOut && pricingActiveRef.current) {
          pricingActiveRef.current = false
          setPricingActive(false)
        }
      },
      { threshold: [0, 0.5], rootMargin: "-10% 0px" },
    )

    observer.observe(trigger)

    return () => {
      observer.disconnect()
      if (activationDelayRef.current) {
        window.clearTimeout(activationDelayRef.current)
        activationDelayRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const video = pricingVideoRef.current
    if (!video) return

    const targetRate = 1.05
    const applyRate = () => {
      video.defaultPlaybackRate = targetRate
      video.playbackRate = targetRate
    }

    if (video.readyState >= 2) {
      applyRate()
      return
    }

    video.addEventListener("loadeddata", applyRate)

    return () => {
      video.removeEventListener("loadeddata", applyRate)
    }
  }, [])

  useEffect(() => {
    const video = pricingVideoRef.current
    if (!video) return

    if (pricingActive) {
      video.currentTime = 0
      video.play().catch(() => {
        /* Ignore play errors (e.g. autoplay policies) */
      })
    } else {
      video.pause()
    }
  }, [pricingActive])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-full overflow-hidden bg-black text-slate-100 flex flex-col"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-24 px-4 pt-16 pb-0 sm:px-6 lg:px-8">
        <motion.section variants={sectionVariants} className="w-full">
          <SectionHero />
        </motion.section>

        {visibleSections.map(({ key, Component, className }) => (
          <Fragment key={key}>
            <motion.section
              variants={sectionVariants}
              viewport={sharedViewport}
              initial="hidden"
              whileInView="visible"
              className={className ?? "w-full"}
            >
              <Component />
            </motion.section>

            {key === "pricing" && (
              <motion.section
                variants={sectionVariants}
                viewport={sharedViewport}
                initial="hidden"
                whileInView="visible"
                className="w-screen px-0 mt-4 mb-4 -mx-[calc((100vw-100%)/2)]"
              >
                <div
                  ref={pricingTriggerRef}
                  className="relative left-1/2 flex w-screen -translate-x-1/2 justify-center overflow-visible pt-3 pb-3"
                  style={{ backgroundColor: "#000000", margin: "0" }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[-8%] z-10"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 64%, rgba(0,0,0,1) 88%)",
                      filter: "blur(70px)",
                    }}
                  />
                  <video
                    ref={pricingVideoRef}
                    playsInline
                    muted
                    preload="metadata"
                    className="relative z-10 w-full max-w-[min(640px,90vw)] origin-center object-cover transition duration-700 ease-hero-bg translate-x-4 sm:translate-x-6"
                    style={{
                      opacity: pricingActive ? 1 : 0,
                      transform: `translateY(${pricingActive ? "-16px" : "-4px"}) scale(${pricingActive ? 1 : 0.9})`,
                      filter: "brightness(1.18) saturate(1.24)",
                      maskImage:
                        "radial-gradient(circle at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 90%), linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage:
                        "radial-gradient(circle at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 90%), linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
                      maskComposite: "intersect",
                      WebkitMaskComposite: "source-in",
                      boxShadow:
                        "inset 0 0 260px 110px rgba(0,0,0,0.9), inset 0 0 160px 60px rgba(0,0,0,0.85), inset 0 0 160px -40px rgba(255,255,255,0.65)",
                      willChange: "opacity, transform, filter",
                    }}
                    src="/videoqr.mp4"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-30"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.9) 100%)",
                      filter: "blur(220px)",
                      maskImage:
                        "radial-gradient(circle at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0.04) 80%, rgba(0,0,0,0) 100%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-30"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,1) 100%)",
                      filter: "blur(140px)",
                      maskImage:
                        "linear-gradient(90deg, rgba(0,0,0,0) 6%, rgba(0,0,0,1) 36%, rgba(0,0,0,1) 64%, rgba(0,0,0,0) 94%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-30"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,1) 100%)",
                      filter: "blur(140px)",
                      maskImage:
                        "linear-gradient(180deg, rgba(0,0,0,0) 6%, rgba(0,0,0,1) 34%, rgba(0,0,0,1) 66%, rgba(0,0,0,0) 94%)",
                    }}
                  />
                  <div
                    className="absolute inset-x-0 top-0 z-40 flex flex-col items-center gap-4 px-4 text-center text-white sm:gap-5"
                    style={{ opacity: 1, transform: "translateY(-4px)" }}
                  >
                    <h3 className="text-[46px] font-black leading-[1.05] tracking-tight sm:text-[58px] lg:text-[68px]">
                      La tecnología
                      <br />
                      en tu mano.
                    </h3>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <button className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-white/90">
                        Start for free
                      </button>
                      <button className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-black/50 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-neutral-800">
                        Start with AI
                      </button>
                    </div>
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-35 bg-black transition-all duration-500 ease-out"
                    style={{ opacity: pricingActive ? 0 : 1 }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[-10%] z-20"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(0,0,0,0) 34%, rgba(0,0,0,0.8) 62%, rgba(0,0,0,1) 82%)",
                      filter: "blur(90px)",
                    }}
                  />
                </div>
              </motion.section>
            )}
          </Fragment>
        ))}
      </div>

      <motion.footer
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.4 }}
        initial="hidden"
        whileInView="visible"
        className="relative mt-24 w-full border-t border-white/10 bg-black px-6 py-16 text-sm text-slate-300 sm:px-10"
      >
        <div className="relative z-10 flex w-full flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="flex w-full flex-col gap-6 lg:max-w-sm">
            <div className="flex items-center gap-3">
              <Image src="/logorojo.png" alt="TavoloAI" width={150} height={150} className="h-12 w-12 object-contain" />
              <div>
                <p className="text-base font-semibold text-white">TavoloAI</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Menu Intelligence</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{dictionary.hero.description}</p>
            <div className="relative w-fit" ref={langMenuRef}>
              <motion.button
                type="button"
                aria-label={t("header.languageButton")}
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[12px] font-medium text-slate-200 shadow-sm transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                <Globe className="h-4 w-4" />
                <span>{currentLanguageLabel}</span>
              </motion.button>

              {showLangMenu && (
                <motion.ul
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-0 bottom-full mb-2 w-40 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl shadow-lg shadow-black/40 z-20"
                >
                  {languageOptions.map((option) => (
                    <motion.li
                      key={option.code}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer px-3.5 py-1.5 text-[12px] font-medium text-slate-200 transition-colors ${
                        option.code === language ? "text-white" : ""
                      }`}
                      onClick={() => handleLanguageChange(option.code)}
                    >
                      {option.label}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
          </div>

          <div className="grid w-full flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">{column.title}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <a href={link.href} className="transition-colors duration-150 hover:text-white">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-12 flex w-full flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} TavoloAI. {dictionary.finalCta.badge}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://twitter.com" aria-label="X" className="transition-colors hover:text-white">
                <span className="text-base font-semibold">??</span>
              </a>
              <a href="https://youtube.com" aria-label="YouTube" className="transition-colors hover:text-white">
                <YoutubeIcon className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="transition-colors hover:text-white">
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a href="https://github.com" aria-label="GitHub" className="transition-colors hover:text-white">
                <GithubIcon className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="transition-colors hover:text-white">
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="transition-colors duration-150 hover:text-white">
                Términos de uso
              </a>
              <a href="#" className="transition-colors duration-150 hover:text-white">
                Política de privacidad
              </a>
              <a href="#final-cta" className="transition-colors duration-150 hover:text-white">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  )
}
