// @ts-nocheck
"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "@/context/TranslationContext"

export default function SectionHero() {
  const { dictionary } = useTranslation()
  const hero = dictionary.hero
  const [showIntro, setShowIntro] = useState(true)
  const originalOverflowRef = useRef<string | null>(null)
  const introFallbackRef = useRef<number | null>(null)
  const introVideoRef = useRef<HTMLVideoElement | null>(null)
  const heroBgVideoRefs = [useRef<HTMLVideoElement | null>(null), useRef<HTMLVideoElement | null>(null)] as const
  const heroBgDurationRef = useRef<number | null>(null)
  const heroBgTimerRef = useRef<number | null>(null)
  const [activeHeroBgVideo, setActiveHeroBgVideo] = useState<0 | 1>(0)
  const [heroBgReady, setHeroBgReady] = useState(false)
  const HERO_BG_PLAYBACK_RATE = 0.6
  const HERO_BG_CROSSFADE_MS = 2000
  const HERO_BG_FADE_DURATION = 2200

  useEffect(() => {
    if (!showIntro) return
    introFallbackRef.current = window.setTimeout(() => {
      setShowIntro(false)
      introFallbackRef.current = null
    }, 3800)
    return () => {
      if (introFallbackRef.current) {
        window.clearTimeout(introFallbackRef.current)
        introFallbackRef.current = null
      }
    }
  }, [showIntro])

  const handleIntroFinish = () => {
    if (!showIntro) return
    if (introFallbackRef.current) {
      window.clearTimeout(introFallbackRef.current)
      introFallbackRef.current = null
    }
    setShowIntro(false)
  }

  useEffect(() => {
    if (!showIntro) return
    const video = introVideoRef.current
    if (!video) return

    const resetAndPlay = () => {
      try {
        video.pause()
        video.currentTime = 0
      } catch {
        /* ignore seek errors */
      }
      video.play().catch(() => {
        /* autoplay guard */
      })
    }

    if (video.readyState >= 2) {
      resetAndPlay()
    } else {
      const handleLoaded = () => {
        resetAndPlay()
        video.removeEventListener("loadeddata", handleLoaded)
      }
      video.addEventListener("loadeddata", handleLoaded)
      return () => video.removeEventListener("loadeddata", handleLoaded)
    }
  }, [showIntro])

  useEffect(() => {
    const cleanups = heroBgVideoRefs.map((ref) => {
      const video = ref.current
      if (!video) return undefined

      const applyRate = () => {
        video.defaultPlaybackRate = HERO_BG_PLAYBACK_RATE
        video.playbackRate = HERO_BG_PLAYBACK_RATE
      }

      applyRate()
      video.addEventListener("loadeddata", applyRate)
      video.addEventListener("ratechange", applyRate)

      return () => {
        video.removeEventListener("loadeddata", applyRate)
        video.removeEventListener("ratechange", applyRate)
      }
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup())
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const cleanups = heroBgVideoRefs.map((ref) => {
      const video = ref.current
      if (!video) return undefined

      const updateDuration = () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          heroBgDurationRef.current = video.duration / HERO_BG_PLAYBACK_RATE
          if (mounted) {
            setHeroBgReady(true)
          }
        }
      }

      video.addEventListener("loadedmetadata", updateDuration)
      if (video.readyState >= 1) {
        updateDuration()
      }

      return () => video.removeEventListener("loadedmetadata", updateDuration)
    })

    return () => {
      mounted = false
      cleanups.forEach((cleanup) => cleanup && cleanup())
    }
  }, [])

  useEffect(() => {
    if (!heroBgReady) return

    const currentIndex = activeHeroBgVideo
    const video = heroBgVideoRefs[currentIndex].current
    if (!video) return

    const playVideo = () => {
      try {
        video.currentTime = 0
      } catch {
        /* ignore seek issues */
      }
      video.play().catch(() => {
        /* autoplay guard */
      })
    }

    playVideo()

    const playbackDuration = heroBgDurationRef.current
    if (!playbackDuration) return

    const switchDelay = Math.max(0, playbackDuration * 1000 - HERO_BG_CROSSFADE_MS)
    heroBgTimerRef.current = window.setTimeout(() => {
      const nextIndex = currentIndex === 0 ? 1 : 0
      const nextVideo = heroBgVideoRefs[nextIndex].current
      const activateNext = () => {
        if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => setActiveHeroBgVideo(nextIndex))
          })
        } else {
          setActiveHeroBgVideo(nextIndex)
        }
      }
      if (nextVideo) {
        try {
          nextVideo.currentTime = 0
        } catch {
          /* ignore seek issues */
        }
        const maybePlay = nextVideo.play()
        if (maybePlay && typeof maybePlay.then === "function") {
          maybePlay.then(activateNext).catch(() => activateNext())
        } else {
          activateNext()
        }
      } else {
        activateNext()
      }
    }, switchDelay)

    return () => {
      if (heroBgTimerRef.current) {
        window.clearTimeout(heroBgTimerRef.current)
        heroBgTimerRef.current = null
      }
    }
  }, [activeHeroBgVideo, heroBgReady])

  useEffect(() => {
    if (!showIntro) return
    const video = introVideoRef.current
    if (!video) return

    const handleNearEnd = () => {
      const remaining = video.duration - video.currentTime
      if (!Number.isNaN(remaining) && remaining <= 0.06) {
        handleIntroFinish()
      }
    }

    video.addEventListener("timeupdate", handleNearEnd)
    return () => video.removeEventListener("timeupdate", handleNearEnd)
  }, [showIntro])

  useEffect(() => {
    if (typeof window === "undefined") return
    ;(window as typeof window & { __floatingBlocked?: boolean }).__floatingBlocked = showIntro
    window.dispatchEvent(new CustomEvent("floating:block", { detail: showIntro }))
    return () => {
      ;(window as typeof window & { __floatingBlocked?: boolean }).__floatingBlocked = false
      window.dispatchEvent(new CustomEvent("floating:block", { detail: false }))
    }
  }, [showIntro])

  useEffect(() => {
    if (typeof document === "undefined") return
    if (showIntro) {
      if (originalOverflowRef.current === null) {
        originalOverflowRef.current = document.body.style.overflow
      }
      document.body.style.overflow = "hidden"
      window.scrollTo({ top: 0, behavior: "auto" })
    } else if (originalOverflowRef.current !== null) {
      document.body.style.overflow = originalOverflowRef.current
      originalOverflowRef.current = null
    }

    return () => {
      if (typeof document !== "undefined" && originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current
        originalOverflowRef.current = null
      }
    }
  }, [showIntro])

  return (
    <>
      <section className="relative isolate overflow-visible px-4 pt-20 pb-28 sm:px-6 md:px-12 lg:pb-36">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 h-full w-screen -translate-x-1/2">
          {[0, 1].map((index) => (
            <video
              key={index}
              aria-hidden
              className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-hero-bg ${
                activeHeroBgVideo === index ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: `${HERO_BG_FADE_DURATION}ms`, willChange: "opacity" }}
              autoPlay
              muted
              playsInline
              preload="auto"
              ref={heroBgVideoRefs[index]}
            >
              <source src="/videohero.mp4" type="video/mp4" />
            </video>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
          <div className="pointer-events-none absolute -top-14 flex w-full justify-center">
            <Image
              src="/logoblanco.png"
              alt="TavoloAI"
              width={80}
              height={80}
              className="h-12 w-12 object-contain"
              style={{
                opacity: showIntro ? 0 : 1,
                transform: `translateY(${showIntro ? "16px" : "0"})`,
                transition: "opacity 0.22s ease-out 0.05s, transform 0.22s ease-out 0.05s",
              }}
            />
          </div>
          <h1
            className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-[72px]"
            style={{
              opacity: showIntro ? 0 : 1,
              transform: `translateY(${showIntro ? "18px" : "0"})`,
              transition: "opacity 0.22s ease-out, transform 0.22s ease-out",
            }}
          >
            {hero.title}
          </h1>
          <p
            className="relative z-10 max-w-3xl text-base text-slate-200 sm:text-lg"
            style={{
              opacity: showIntro ? 0 : 1,
              transform: `translateY(${showIntro ? "14px" : "0"})`,
              transition: "opacity 0.22s ease-out 0.03s, transform 0.22s ease-out 0.03s",
            }}
          >
            {hero.description}
          </p>
        </div>
      </section>

      {showIntro && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black">
          <div className="pointer-events-none w-full">
            <div className="relative flex w-full justify-center overflow-visible py-16" style={{ backgroundColor: "#000000" }}>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[-8%] z-10"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(0,0,0,0) 16%, rgba(0,0,0,0.25) 42%, rgba(0,0,0,0.45) 68%, rgba(0,0,0,0.6) 82%, rgba(0,0,0,0.8) 92%)",
                  filter: "blur(60px)",
                }}
              />
              <video
                ref={introVideoRef}
                autoPlay
                muted
                playsInline
                className="relative z-20 w-[min(420px,90vw)] object-cover"
                style={{
                  filter: "brightness(1.45) saturate(1.3)",
                  maskImage:
                    "radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.25) 52%, rgba(0,0,0,0.05) 72%, transparent 90%)",
                  WebkitMaskImage:
                    "radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.25) 52%, rgba(0,0,0,0.05) 72%, transparent 90%)",
                  boxShadow:
                    "inset 0 0 260px 110px rgba(0,0,0,0.96), inset 0 0 200px 70px rgba(0,0,0,0.92)",
                }}
                onEnded={handleIntroFinish}
                onError={handleIntroFinish}
              >
                <source src="/videointro.mp4" type="video/mp4" />
              </video>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[-10%] z-30"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(0,0,0,0) 22%, rgba(0,0,0,0.35) 48%, rgba(0,0,0,0.6) 72%, rgba(0,0,0,0.82) 88%)",
                  filter: "blur(70px)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[-4%] z-40"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(0,0,0,0) 28%, rgba(0,0,0,0.55) 64%, rgba(0,0,0,0.82) 88%, rgba(0,0,0,0.95) 94%, rgba(0,0,0,0.98) 96%, rgba(0,0,0,1) 100%)",
                  filter: "blur(16px)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
