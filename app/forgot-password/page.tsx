// app/forgot-password/page.tsx
// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"

const GRADIENT =
    "linear-gradient(90deg,#491f53 0%,#7e00bf 25%,#312783 50%,#006ae9 75%,#6adbff 90%,#3ea3dc 100%)"

const iosSpring = { type: "spring", stiffness: 140, damping: 20, mass: 0.7, restDelta: 0.001 }

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // focus automático opcional
        const el = document.getElementById("fp-email") as HTMLInputElement | null
        el?.focus()
    }, [])

    function validateEmail(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        if (!validateEmail(email)) {
            setError("Introduce un correo válido.")
            return
        }

        setLoading(true)
        try {
            // Aquí puedes llamar a tu API real:
            // await fetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })

            // Simulación de envío
            await new Promise((r) => setTimeout(r, 900))
            setSent(true)
        } catch (err) {
            setError("No se pudo procesar. Intenta más tarde.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-slate-50">
            <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...iosSpring, duration: 0.5 }}
                className="w-full max-w-lg p-6 rounded-3xl relative"
                aria-label="Recuperar contraseña"
                style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.80))",
                    boxShadow: "0 18px 40px rgba(2,6,23,0.06)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    backdropFilter: "blur(8px)",
                }}
            >
                {/* Outer gradient frame (thin) */}
                <div
                    aria-hidden
                    className="absolute -inset-[1px] rounded-3xl pointer-events-none"
                    style={{
                        background: GRADIENT,
                        zIndex: -1,
                        filter: "blur(10px)",
                        opacity: 0.12,
                        margin: "-1px",
                    }}
                />

                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Recuperar contraseña
                    </h1>
                    <p className="text-sm text-slate-600 mb-6">
                        Introduce el correo asociado a tu cuenta y te enviaremos instrucciones para restablecer la contraseña.
                    </p>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 mb-2 block">Correo electrónico</span>
                                <input
                                    id="fp-email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    className="w-full rounded-2xl border border-slate-200/40 bg-white/70 px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(59,130,246,0.08)] focus:border-blue-300"
                                    aria-label="Correo para recuperar contraseña"
                                    required
                                />
                            </label>

                            {error && <p className="text-sm text-rose-600">{error}</p>}

                            <div className="flex gap-3 items-center">
                                <Button type="submit" className="flex-1 py-3" disabled={loading}>
                                    {loading ? "Enviando..." : "Enviar instrucciones"}
                                </Button>

                                <motion.button
                                    type="button"
                                    onClick={() => router.push("/")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={iosSpring}
                                    className="px-4 py-2 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm text-sm"
                                >
                                    Volver
                                </motion.button>
                            </div>

                            <div className="text-sm text-slate-500 mt-1">
                                ¿No tienes cuenta?{" "}
                                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium underline">
                                    Regístrate
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ ...iosSpring, duration: 0.5 }}
                                className="rounded-2xl bg-white/80 p-4 border border-white/30"
                            >
                                <h2 className="text-lg font-semibold text-slate-900">Revisa tu correo</h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    Te hemos enviado un enlace para restablecer tu contraseña a <span className="font-medium">{email}</span>.
                                    Revisa la bandeja de entrada y la carpeta de correo no deseado si no lo ves.
                                </p>
                            </motion.div>

                            <div className="flex gap-3">
                                <Button onClick={() => router.push("/")} className="flex-1 py-3">
                                    Volver al inicio
                                </Button>

                                <motion.button
                                    onClick={() => {
                                        setSent(false)
                                        setEmail("")
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={iosSpring}
                                    className="px-4 py-3 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm text-sm"
                                >
                                    Enviar otro
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.section>
        </main>
    )
}
