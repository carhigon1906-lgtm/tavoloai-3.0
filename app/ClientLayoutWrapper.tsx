"use client"

import { usePathname, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Lenis from "@studio-freight/lenis"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { TranslationProvider, type LanguageCode } from "@/context/TranslationContext"

const Header = dynamic(() => import("@/components/layout/Header"))
const FloatingCTA = dynamic(() => import("@/components/ui/FloatingCTA"), { ssr: false })

const FALLBACK_LANGUAGE: LanguageCode = "es"
const LANGUAGE_SET = new Set<LanguageCode>(["es", "en", "it"])

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const langParam = (searchParams?.get("lang") ?? FALLBACK_LANGUAGE) as LanguageCode
    const initialLanguage = LANGUAGE_SET.has(langParam) ? langParam : FALLBACK_LANGUAGE

    useEffect(() => {
        if (typeof window === "undefined") return

        const lenis = new Lenis({
            duration: 0.7,      // scroll suave pero sin sensación de lag
            smoothWheel: true,  // aplica suavizado al scroll con rueda/trackpad
            // Ojo: smoothTouch no existe en LenisOptions de @studio-freight/lenis, por eso lo quitamos
        })

        let frameId: number

        const raf = (time: number) => {
            lenis.raf(time)
            frameId = requestAnimationFrame(raf)
        }

        frameId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(frameId)
            lenis.destroy()
        }
    }, [])

    const isDashboard = pathname?.startsWith("/dashboard")
    const isHome = pathname === "/"

    return (
        <TranslationProvider initialLanguage={initialLanguage}>
            <div className="min-h-screen relative flex flex-col">
                <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-slate-50/20" />
                </div>

                {/* Header solo en la home; CTA fuera del dashboard */}
                {isHome && <Header />}
                <main className="relative z-10 flex-1">{children}</main>
                {!isDashboard && <FloatingCTA sectionSelector="section" />}
            </div>
        </TranslationProvider>
    )
}
