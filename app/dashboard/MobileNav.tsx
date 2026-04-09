// @ts-nocheck
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { BarChart3, Home, Image, Menu, Settings, Shield } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { isPublicAdminEmail } from "@/lib/adminAccess"

const items = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Menu, label: "Menu", href: "/dashboard/menus" },
  { icon: Image, label: "IA", href: "/dashboard/media" },
  { icon: BarChart3, label: "Dati", href: "/dashboard/reports" },
  { icon: Settings, label: "Impost.", href: "/dashboard/settings" },
]

const adminItems = [{ icon: Shield, label: "Admin", href: "/dashboard/admin" }]

export default function MobileNav() {
  const pathname = usePathname()
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    let mounted = true

    const resolveAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return
      setShowAdmin(isPublicAdminEmail(session?.user?.email))
    }

    resolveAdmin()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setShowAdmin(isPublicAdminEmail(session?.user?.email))
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const navItems = showAdmin ? adminItems : items

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname?.startsWith(href)
  }

  return (
    <div
      id="dashboard-mobile-nav"
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] md:hidden"
    >
      <div className="rounded-[28px] border border-white/8 bg-[#05070c]/84 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
        <nav className="flex items-center justify-center gap-1 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item, index) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${
                      active
                        ? "border-cyan-300/20 bg-cyan-400/10 shadow-[0_10px_30px_rgba(34,211,238,0.18)]"
                        : "border-white/8 bg-white/5"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-cyan-100" : "text-slate-300"}`} />
                  </span>
                  {item.label}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
