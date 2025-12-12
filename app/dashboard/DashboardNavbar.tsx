// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"

export default function DashboardNavbar() {
  const [userLabel, setUserLabel] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const resolveLabel = (session: any) => {
      const name = session?.user?.user_metadata?.name
      const business = session?.user?.user_metadata?.business
      const email = session?.user?.email
      setUserLabel(name || business || email || null)
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

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="h-16 bg-neutral-950/70 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-100"
    >
      <div className="font-semibold text-base md:text-lg text-white">Panel de Restaurante</div>

      {userLabel && (
        <div className="text-xs sm:text-sm text-slate-300 font-medium">
          Sesión: <span className="text-white font-semibold">{userLabel}</span>
        </div>
      )}
    </motion.header>
  )
}
