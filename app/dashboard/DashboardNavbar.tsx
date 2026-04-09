// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { CalendarDays, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

const sectionTitles = [
  { match: /^\/dashboard$/, title: "Dashboard", subtitle: "Panoramica generale del locale" },
  { match: /^\/dashboard\/menus/, title: "Menu", subtitle: "Gestisci menu, sezioni e categorie" },
  { match: /^\/dashboard\/media/, title: "Laboratorio IA", subtitle: "Migliora immagini di piatti e bevande" },
  { match: /^\/dashboard\/reports/, title: "Statistiche", subtitle: "Lettura commerciale delle performance" },
  { match: /^\/dashboard\/posters/, title: "Poster IA", subtitle: "Promozioni pronte da pubblicare" },
  { match: /^\/dashboard\/local/, title: "Il tuo locale", subtitle: "Informazioni visibili ai clienti" },
  { match: /^\/dashboard\/admin/, title: "Amministrazione", subtitle: "Controllo operativo globale di TavoloAI" },
  { match: /^\/dashboard\/settings/, title: "Impostazioni", subtitle: "Preferenze e dati dell'account" },
]

export default function DashboardNavbar() {
  const [userLabel, setUserLabel] = useState<string | null>(null)
  const [typedText, setTypedText] = useState("")
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    const resolveLabel = (session: any) => {
      const business = session?.user?.user_metadata?.business
      setUserLabel(business || null)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      resolveLabel(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      resolveLabel(session)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const targetText = userLabel ? `Benvenuto, ${userLabel}` : "Benvenuto"

  useEffect(() => {
    let index = 0
    setTypedText("")

    const timer = window.setInterval(() => {
      index += 1
      setTypedText(targetText.slice(0, index))
      if (index >= targetText.length) {
        window.clearInterval(timer)
      }
    }, 40)

    return () => window.clearInterval(timer)
  }, [targetText])

  const currentSection = sectionTitles.find((section) => section.match.test(pathname || "")) || sectionTitles[0]

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="mx-4 mt-4 flex h-[72px] items-center justify-between rounded-[26px] border border-white/[0.04] bg-[#070d17]/72 px-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl text-slate-100 md:mx-5 md:mt-5 md:px-5"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/10">
            <Sparkles className="h-4 w-4 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">{currentSection.title}</p>
            <p className="truncate text-xs text-slate-400">{currentSection.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.05] bg-white/6 px-3 py-2 text-xs text-slate-300 md:flex">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          <span>{new Date().toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</span>
        </div>
        <div className="hidden min-w-0 rounded-full border border-white/[0.05] bg-white/6 px-3 py-2 text-xs md:block">
          <p className="truncate text-slate-400">Sessione</p>
          <p className="max-w-[180px] truncate font-medium text-white">
            {userLabel || typedText}
            {!userLabel && <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-white/70 align-middle" />}
          </p>
        </div>
      </div>
    </motion.header>
  )
}
