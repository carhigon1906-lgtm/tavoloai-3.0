"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  children: React.ReactNode
}

export default function RequireAuth({ children }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "ready">("checking")

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return
      if (!session) {
        router.replace("/")
      } else {
        setStatus("ready")
      }
    }

    checkSession()

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (!session) {
        router.replace("/")
      }
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [router])

  if (status === "checking") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        Verificando sesión...
      </div>
    )
  }

  return <>{children}</>
}
