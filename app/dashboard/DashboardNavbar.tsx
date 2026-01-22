// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"

export default function DashboardNavbar() {
  const [userLabel, setUserLabel] = useState<string | null>(null)
  const [typedText, setTypedText] = useState("")

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

  const targetText = userLabel ? `Hola Bienvenido ${userLabel}` : "Hola Bienvenido"

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

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="h-16 bg-neutral-950/70 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-100"
    >
      <div className="font-semibold text-base md:text-lg text-white">
        {typedText}
        <span className="ml-1 inline-block h-4 w-0.5 bg-white/70 align-middle animate-pulse" />
      </div>

      {userLabel && (
        <div className="text-xs sm:text-sm text-slate-300 font-medium">
          Sesión: <span className="text-white font-semibold">{userLabel}</span>
        </div>
      )}
    </motion.header>
  )
}
