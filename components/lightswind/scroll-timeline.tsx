// @ts-nocheck
"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

const GRADIENT =
  "linear-gradient(90deg, #491f53 0%, #7e00bf 25%, #312783 50%, #006ae9 75%, #6adbff 90%, #3ea3dc 100%)"

const IOS_SPRING = { type: "spring", stiffness: 92, damping: 18, mass: 0.7 }

export interface TimelineEvent {
  id?: string
  year: string
  title: string
  subtitle?: string
  description: string
  icon?: React.ReactNode
  color?: string
}

export interface ScrollTimelineProps {
  events: TimelineEvent[]
  title?: string
  subtitle?: string
  sideNoteTitle?: string
  sideNote?: string
  sideNote2Title?: string
  sideNote2?: string
  sideNote3Title?: string
  sideNote3?: string
  animationOrder?: "sequential" | "staggered" | "simultaneous"
  cardAlignment?: "alternating" | "left" | "right"
  lineColor?: string
  activeColor?: string
  progressIndicator?: boolean
  cardVariant?: "default" | "elevated" | "outlined" | "filled"
  cardEffect?: "none" | "glow" | "shadow" | "bounce"
  parallaxIntensity?: number
  progressLineWidth?: number
  progressLineCap?: "round" | "square"
  dateFormat?: "text" | "badge"
  className?: string
  revealAnimation?: "fade" | "slide" | "scale" | "flip" | "none"
  connectorStyle?: "dots" | "line" | "dashed"
  perspective?: boolean
  darkMode?: boolean
  smoothScroll?: boolean
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    year: "2023",
    title: "Major Achievement",
    subtitle: "Organization Name",
    description: "Description of the achievement or milestone reached during this time period.",
  },
  {
    year: "2022",
    title: "Important Milestone",
    subtitle: "Organization Name",
    description: "Details about this significant milestone and its impact.",
  },
  {
    year: "2021",
    title: "Key Event",
    subtitle: "Organization Name",
    description: "Information about this key event in the timeline.",
  },
]

export function ScrollTimeline({
  events = DEFAULT_EVENTS,
  title = "Timeline",
  subtitle,
  sideNoteTitle,
  sideNote,
  sideNote2Title,
  sideNote2,
  sideNote3Title,
  sideNote3,
  animationOrder = "sequential",
  cardAlignment = "alternating",
  lineColor = "bg-primary/30",
  activeColor = "border-primary",
  progressIndicator = true,
  cardVariant = "default",
  cardEffect = "none",
  parallaxIntensity = 0.2,
  progressLineWidth = 2,
  progressLineCap = "round",
  dateFormat = "badge",
  revealAnimation = "fade",
  className = "",
  connectorStyle = "line",
  perspective = false,
  darkMode = false,
  smoothScroll = true,
}: ScrollTimelineProps) {
  // 👇 importante: HTMLElement, con non-null assertion
  const scrollRef = useRef<HTMLElement>(null!)
  const [activeIndex, setActiveIndex] = useState(-1)
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([])

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"])

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => {
      const newIndex = Math.floor(v * events.length)
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < events.length) {
        setActiveIndex(newIndex)
      }
    })
    return () => unsubscribe()
  }, [scrollYProgress, events.length, activeIndex])

  const getCardVariants = (index: number) => {
    const baseDelay =
      animationOrder === "simultaneous"
        ? 0
        : animationOrder === "staggered"
          ? index * 0.2
          : index * 0.3

    const initialStates = {
      fade: { opacity: 0, y: 20 },
      slide: {
        x:
          cardAlignment === "left"
            ? -100
            : cardAlignment === "right"
              ? 100
              : index % 2 === 0
                ? -100
                : 100,
        opacity: 0,
      },
      scale: { scale: 0.8, opacity: 0 },
      flip: { rotateY: 90, opacity: 0 },
      none: { opacity: 1 },
    } as const

    return {
      initial: initialStates[revealAnimation],
      whileInView: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateY: 0,
        transition: {
          duration: 0.7,
          delay: baseDelay,
          ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
        },
      },
      viewport: { once: false, margin: "-100px" },
    }
  }

  const getConnectorClasses = () => {
    const baseClasses = cn(
      "absolute top-0 transform",
      "left-6 sm:left-8 lg:left-1/2",
      "lg:-translate-x-1/2",
      lineColor,
    )
    const widthStyle = `w-[${progressLineWidth}px]`
    switch (connectorStyle) {
      case "dots":
        return cn(baseClasses, "w-1 rounded-full")
      case "dashed":
        return cn(
          baseClasses,
          widthStyle,
          "[mask-image:linear-gradient(to_bottom,black_33%,transparent_33%,transparent_66%,black_66%)] [mask-size:1px_12px]",
        )
      case "line":
      default:
        return cn(baseClasses, widthStyle)
    }
  }

  const getCardClasses = (index: number) => {
    const baseClasses = "relative z-30 rounded-3xl transition-all duration-300"
    const alignmentClassesDesktop =
      cardAlignment === "alternating"
        ? index % 2 === 0
          ? "lg:mr-[calc(50%+20px)]"
          : "lg:ml-[calc(50%+20px)]"
        : cardAlignment === "left"
          ? "lg:mr-auto lg:ml-0"
          : "lg:ml-auto lg:mr-0"
    const perspectiveClass = perspective ? "transform transition-transform hover:rotate-y-1 hover:rotate-x-1" : ""

    return cn(baseClasses, alignmentClassesDesktop, "w-full lg:w-[calc(50%-40px)]", perspectiveClass)
  }

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        darkMode ? "bg-background text-foreground" : "",
        className,
      )}
    >
      <div className="text-center py-16 px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
      </div>

        <div className="relative max-w-6xl mx-auto px-4 pb-24">
          <div className="relative mx-auto">
            <div className={cn(getConnectorClasses(), "h-full absolute top-0 z-10")} />

          {progressIndicator && (
            <>
              <motion.div
                className="absolute top-0 z-10 left-6 sm:left-8 lg:left-1/2 transform lg:-translate-x-1/2"
                style={{
                  height: progressHeight,
                  width: progressLineWidth,
                  borderRadius: progressLineCap === "round" ? "9999px" : "0px",
                  background: "linear-gradient(to bottom, #22d3ee, #6366f1, #a855f7)",
                  boxShadow: `
                    0 0 15px rgba(99,102,241,0.5),
                    0 0 25px rgba(168,85,247,0.3)
                  `,
                }}
              />
              <motion.div
                className="absolute z-20 left-6 sm:left-8 lg:left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: progressHeight,
                }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(99,102,241,0.5) 40%, rgba(34,211,238,0) 70%)",
                    boxShadow: `
                      0 0 15px 4px rgba(168, 85, 247, 0.6),
                      0 0 25px 8px rgba(99, 102, 241, 0.4),
                      0 0 40px 15px rgba(34, 211, 238, 0.2)
                    `,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </>
          )}

          <div className="relative z-20">
            {events.map((event, index) => {
              const yOffset = useTransform(
                smoothProgress,
                [0, 1],
                [parallaxIntensity * 100, -parallaxIntensity * 100],
              )

              return (
                <div
                  key={event.id || index}
                  ref={(el) => {
                    timelineRefs.current[index] = el
                  }}
                  className={cn(
                    "relative flex w-full items-start mb-16 sm:mb-20 py-4 pl-10 pr-4 sm:pl-14",
                    "flex-col lg:flex-row",
                    cardAlignment === "alternating"
                      ? index % 2 === 0
                        ? "lg:justify-start"
                        : "lg:flex-row-reverse lg:justify-start"
                      : cardAlignment === "left"
                        ? "lg:justify-start"
                        : "lg:flex-row-reverse lg:justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30",
                      "left-6 sm:left-8 lg:left-1/2",
                    )}
                  >
                    <motion.div
                      className={cn(
                        "w-6 h-6 rounded-full border-4 bg-background flex items-center justify-center",
                        index <= activeIndex ? activeColor : "border bg-card",
                      )}
                      animate={
                        index <= activeIndex
                          ? {
                              scale: [1, 1.3, 1],
                              boxShadow: [
                                "0 0 0px rgba(99,102,241,0)",
                                "0 0 12px rgba(99,102,241,0.6)",
                                "0 0 0px rgba(99,102,241,0)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut",
                      }}
                    />
                  </div>

                  <motion.div
                    className={cn(getCardClasses(index), "mt-12 lg:mt-0")}
                    variants={getCardVariants(index)}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: false, margin: "-100px" }}
                    whileHover={{
                      y: -8,
                      scale: 1.02,
                      transition: IOS_SPRING,
                    }}
                    style={parallaxIntensity > 0 ? { y: yOffset } : undefined}
                  >
                    <div className="relative w-full rounded-3xl p-[1px]" style={{ background: GRADIENT }}>
                      <article
                        className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-neutral-900/80 p-8 text-left lg:text-center backdrop-blur-md"
                        aria-label={`${event.year}: ${event.title}`}
                        style={{
                          boxShadow: "0 35px 70px rgba(0,0,0,0.45)",
                        }}
                      >
                        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                        <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                        <div className="relative z-10 space-y-3">
                          <div className="mb-1 text-6xl font-black bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                            {event.year}
                          </div>

                          <h3 className="text-xl font-semibold text-white transition-transform duration-200 group-hover:scale-[1.02]">
                            {event.title}
                          </h3>

                          {event.subtitle && (
                            <p className="text-sm font-medium text-slate-300/80 transition-transform duration-200 group-hover:scale-[1.01]">
                              {event.subtitle}
                            </p>
                          )}

                          <p className="text-pretty leading-relaxed text-slate-300 transition-transform duration-200 group-hover:scale-[1.01]">
                            {event.description}
                          </p>
                        </div>
                      </article>
                    </div>
                  </motion.div>

                  {index === 0 && sideNote && (
                    <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-300 shadow-[0_20px_45px_rgba(0,0,0,0.35)] lg:hidden">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {sideNoteTitle}
                      </p>
                      <p className="leading-relaxed">{sideNote}</p>
                    </div>
                  )}

                  {index === 1 && sideNote2 && (
                    <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-300 shadow-[0_20px_45px_rgba(0,0,0,0.35)] lg:hidden">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {sideNote2Title}
                      </p>
                      <p className="leading-relaxed">{sideNote2}</p>
                    </div>
                  )}

                  {index === 2 && sideNote3 && (
                    <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-300 shadow-[0_20px_45px_rgba(0,0,0,0.35)] lg:hidden">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {sideNote3Title}
                      </p>
                      <p className="leading-relaxed">{sideNote3}</p>
                    </div>
                  )}

                  {index === 0 && sideNote && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] px-8 lg:flex items-center">
                      <div>
                        <h3 className="mb-2 text-left text-base md:text-lg font-semibold uppercase tracking-[0.22em] text-slate-400 whitespace-nowrap">
                          {sideNoteTitle}
                        </h3>
                        <p className="text-left text-base leading-relaxed text-slate-300">{sideNote}</p>
                      </div>
                    </div>
                  )}

                  {index === 1 && sideNote2 && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] px-8 lg:flex items-center justify-end">
                      <div>
                        <h3 className="mb-2 text-right text-base md:text-lg font-semibold uppercase tracking-[0.22em] text-slate-400 whitespace-nowrap">
                          {sideNote2Title}
                        </h3>
                        <p className="text-right text-base leading-relaxed text-slate-300">{sideNote2}</p>
                      </div>
                    </div>
                  )}

                  {index === 2 && sideNote3 && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] px-8 lg:flex items-center">
                      <div>
                        <h3 className="mb-2 text-left text-base md:text-lg font-semibold uppercase tracking-[0.22em] text-slate-400 whitespace-nowrap">
                          {sideNote3Title}
                        </h3>
                        <p className="text-left text-base leading-relaxed text-slate-300">{sideNote3}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
