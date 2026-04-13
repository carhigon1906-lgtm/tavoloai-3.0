// @ts-nocheck
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, LogOut, ChefHat, Menu, Shield, Image, BarChart3, Settings, AlertTriangle, LayoutTemplate, PenLine } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { isPublicAdminEmail } from "@/lib/adminAccess"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Menu, label: "Mis menus", href: "/dashboard/menus" },
  { icon: Menu, label: "Crear menu", href: "/dashboard/menu/new" },
  { icon: AlertTriangle, label: "Piatti esauriti", href: "/dashboard/panic" },
  { icon: Image, label: "Studio IA", href: "/dashboard/media" },
  { icon: LayoutTemplate, label: "Poster IA", href: "/dashboard/posters" },
  { icon: PenLine, label: "Promozioni IA", href: "/dashboard/writer" },
  { icon: BarChart3, label: "Statistiche", href: "/dashboard/reports" },
  { icon: Settings, label: "Impostazioni", href: "/dashboard/settings" },
]
const adminItems = [{ icon: Shield, label: "Admin", href: "/dashboard/admin" }]

const MotionLink = motion(Link)

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  const items = showAdmin ? adminItems : menuItems

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname?.startsWith(href)
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`${
        isCollapsed ? "w-16" : "w-52"
      } hidden md:flex bg-[#05070c]/88 backdrop-blur-2xl border-r border-white/5 flex-col transition-all duration-300 text-slate-100 shadow-[8px_0_40px_rgba(0,0,0,0.58)]`}
    >
      <div className="border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/12 bg-gradient-to-br from-blue-600/25 to-cyan-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <ChefHat className="h-4.5 w-4.5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">TavoloAI</h2>
              <p className="text-xs font-medium text-slate-400">{showAdmin ? "Controllo piattaforma" : "Pannello locale"}</p>
            </motion.div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3">
        {!isCollapsed && (
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {showAdmin ? "Admin" : "Pannello"}
          </p>
        )}
        <div className="space-y-1.5">
          {items.map((item, index) => {
            const active = isActive(item.href)
            return (
              <MotionLink
                key={item.href}
                href={item.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative flex items-center gap-3 rounded-[18px] px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? "border border-white/6 bg-white/10 text-white shadow-[0_14px_32px_rgba(0,0,0,0.28)]"
                    : "border border-transparent text-slate-300 hover:bg-white/6 hover:text-white"
                }`}
              >
                {active && <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-cyan-300" />}
                <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? "text-cyan-100" : "text-slate-300 group-hover:text-white"}`} />
                {!isCollapsed && <span className="font-medium text-[14px] tracking-[-0.01em]">{item.label}</span>}
                {active && !isCollapsed && (
                  <motion.div layoutId="activeIndicator" className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />
                )}
              </MotionLink>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-white/5 p-3">
        <motion.button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/")
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-slate-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-[14px] tracking-[-0.01em]">Esci</span>}
        </motion.button>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white/15"
      >
        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Menu className="w-4 h-4 text-white" />
        </motion.div>
      </button>
    </motion.aside>
  )
}
