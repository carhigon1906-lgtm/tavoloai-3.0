"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { isPublicAdminEmail } from "@/lib/adminAccess"

type Props = {
  children: React.ReactNode
}

export default function RequireAdmin({ children }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "ready">("checking")

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      const email = session?.user?.email || ""
      if (!session || !isPublicAdminEmail(email)) {
        router.replace("/dashboard")
        return
      }

      setStatus("ready")
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      const email = session?.user?.email || ""
      if (!session || !isPublicAdminEmail(email)) {
        router.replace("/dashboard")
        return
      }

      setStatus("ready")
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [router])

  if (status === "checking") {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center rounded-[28px] border border-white/10 bg-black/30 text-white">
        Validando acceso de administrador...
      </div>
    )
  }

  return <>{children}</>
}
