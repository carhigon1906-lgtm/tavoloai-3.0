// @ts-nocheck
"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "@/context/TranslationContext"
import { openAuthModal, closeAuthModal } from "@/lib/authModal"

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { ssr: false })

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t, dictionary } = useTranslation()

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onClose = () => setOpen(false)
    window.addEventListener("auth:open", onOpen)
    window.addEventListener("auth:close", onClose)
    return () => {
      window.removeEventListener("auth:open", onOpen)
      window.removeEventListener("auth:close", onClose)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { id: "features", label: dictionary.header.nav.features },
    { id: "how-it-works", label: dictionary.header.nav.howItWorks },
    { id: "pricing", label: dictionary.header.nav.pricing },
    { id: "cases", label: dictionary.header.nav.cases },
    { id: "faq", label: dictionary.header.nav.faq },
  ]

  const searchString = searchParams?.toString() ?? ""
  const registerHref = searchString ? `/register?${searchString}` : "/register"

  const handleNavClick = (sectionId: string) => {
    const target = sectionId.replace(/^#/, "")
    const hash = `#${target}`

    if (pathname === "/") {
      const element = document.getElementById(target)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        if (typeof window !== "undefined") {
          const query = searchString ? `?${searchString}` : ""
          window.history.replaceState(null, "", `${query}${hash}`)
        }
      }
    } else {
      const params = searchString ? `?${searchString}` : ""
      router.push(`/${params}${hash}`)
    }
  }

  const handleClose = () => {
    setOpen(false)
    closeAuthModal()
  }

  return (
    <>
      <motion.header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#050505]/95 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
            : "bg-[#050505]/90"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          mass: 0.8,
        }}
      >
        <div className="container mx-auto flex items-center justify-between gap-6 py-3 px-6 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Link href="/" className="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80">
              <Image src="/logoblanco.png" alt="TavoloAI" width={32} height={32} className="h-8 w-8 object-contain" />
              <Image src="/Logoextendido.png" alt="TavoloAI" width={70} height={18} className="h-3 w-auto object-contain" />
            </Link>
          </motion.div>

          <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-5">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="inline-flex h-9 items-center justify-center rounded-full px-3 text-[12px] font-semibold text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={openAuthModal}
              aria-label={t("header.login")}
              className="text-[12px] font-semibold text-slate-300 transition-colors hover:text-white"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("header.login")}
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <Link
                href={registerHref}
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black shadow-[0_8px_18px_rgba(0,0,0,0.55)] transform transition-all duration-300 ease-out hover:bg-[#0ea5e9] hover:text-white hover:shadow-[0_12px_28px_rgba(14,165,233,0.35)] hover:-translate-y-0.5"
              >
                {t("header.signup")}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <AuthModal open={open} onClose={handleClose} />
    </>
  )
}
