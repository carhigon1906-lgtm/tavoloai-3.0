// @ts-nocheck
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { Upload, Globe, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

const GRADIENT =
    "linear-gradient(90deg,#491f53 0%,#7e00bf 25%,#312783 50%,#006ae9 75%,#6adbff 90%,#3ea3dc 100%)"

const iosSpring = { type: "spring", stiffness: 140, damping: 20, mass: 0.7, restDelta: 0.001 }

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        business: "",
    })
    const [loading, setLoading] = useState(false)
    const [created, setCreated] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage(null)
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    name: form.name,
                    business: form.business,
                }),
            })

            const payload = await response.json()
            if (!response.ok) {
                throw new Error(payload.error || "No se pudo crear la cuenta. Intenta de nuevo.")
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            })
            if (signInError) throw signInError

            setCreated(true)
        } catch (error) {
            const message = error?.message ?? "No se pudo crear la cuenta. Intenta de nuevo."
            setErrorMessage(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#050b16] to-[#010204] text-white flex items-center justify-center py-16 px-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.16),transparent_55%)]" />
            <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...iosSpring, duration: 0.5 }}
                className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                aria-label="Crear cuenta"
            >
                {/* Outer gradient frame (thin) */}
                <div
                    aria-hidden
                    className="absolute -inset-[1px] rounded-3xl pointer-events-none"
                    style={{
                        background: GRADIENT,
                        zIndex: -1,
                        filter: "blur(10px)",
                        opacity: 0.18,
                        margin: "-1px",
                    }}
                />

                <div className="relative z-10">
                    {!created ? (
                        <>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Crear cuenta
                            </h1>
                            <p className="text-sm text-slate-300 mb-6">
                                Regístrate para comenzar con tu restaurante en TavoloAI.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-medium text-slate-200 mb-2 block">Nombre completo</span>
                                    <input
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Tu nombre"
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-200 mb-2 block">Correo electrónico</span>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="tu@correo.com"
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-200 mb-2 block">Contraseña</span>
                                    <input
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="********"
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-200 mb-2 block">Nombre del negocio</span>
                                    <input
                                        name="business"
                                        type="text"
                                        value={form.business}
                                        onChange={handleChange}
                                        placeholder="Ej: Restaurante Tavolo"
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                                        required
                                    />
                                </label>

                                <div className="flex gap-3 items-center">
                                    <Button type="submit" className="flex-1 py-3" disabled={loading}>
                                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                                    </Button>

                                    <motion.button
                                        type="button"
                                        onClick={() => router.push("/")}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={iosSpring}
                                        className="px-4 py-2 rounded-2xl border border-white/15 bg-white/5 text-sm text-slate-200 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
                                    >
                                        Volver
                                    </motion.button>
                                </div>

                                {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}

                                <div className="text-sm text-slate-300 mt-1">
                                    ¿Ya tienes una cuenta?{" "}
                                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium underline">
                                        Inicia sesión
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ ...iosSpring, duration: 0.5 }}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                            >
                                <h2 className="text-lg font-semibold text-white">¡Bienvenido a TavoloAI!</h2>
                                <p className="text-sm text-slate-300 mt-1">
                                    Tu cuenta ha sido creada con éxito. Estos son tus próximos pasos para configurar tu restaurante:
                                </p>

                                <ul className="mt-3 space-y-2">
                                    {[
                                        { icon: Upload, text: "Subir logo del restaurante" },
                                        { icon: Globe, text: "Configurar idioma y moneda" },
                                        { icon: BookOpen, text: "Crear primer menú o ver ejemplo" },
                                    ].map(({ icon: Icon, text }, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                            className="flex items-center gap-2 text-sm text-slate-200"
                                        >
                                            <Icon className="w-4 h-4 text-blue-400" />
                                            {text}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>

                            <div className="flex gap-3">
                                <Button onClick={() => router.push("/")} className="flex-1 py-3">
                                    Ir al inicio
                                </Button>
                                <motion.button
                                    onClick={() => setCreated(false)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={iosSpring}
                                    className="px-4 py-3 rounded-2xl border border-white/15 bg-white/5 text-sm text-slate-200 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
                                >
                                    Crear otro
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.section>
        </main>
    )
}
