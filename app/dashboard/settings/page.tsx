// @ts-nocheck
"use client"
import { useEffect, useState } from "react"
import type React from "react"
import Link from "next/link"

import { motion } from "framer-motion"
import { Settings, MapPin, Phone, Store, Save } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function SettingsPage() {
    const [nombre, setNombre] = useState("")
    const [direccion, setDireccion] = useState("")
    const [telefono, setTelefono] = useState("")
    const [plan, setPlan] = useState<"free" | "premium">("free")
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession()
            .then(({ data }) => {
                if (!mounted) return
                const metadata = data.session?.user?.user_metadata ?? {}
                setNombre(metadata.business ?? "")
                setDireccion(metadata.business_address ?? "")
                setTelefono(metadata.business_phone ?? "")
                setPlan(metadata.plan === "premium" ? "premium" : "free")
            })
            .catch(() => {
                if (!mounted) return
                setSaveError("No se pudo cargar la sesion actual.")
            })

        return () => {
            mounted = false
        }
    }, [])

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setSaveError(null)
        setSaveSuccess(null)

        const { error } = await supabase.auth.updateUser({
            data: {
                business: nombre,
                business_address: direccion,
                business_phone: telefono,
                plan,
            },
        })

        if (error) {
            setSaveError(error.message)
        } else {
            setSaveSuccess("Impostazioni salvate.")
        }

        setIsSaving(false)
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                staggerChildren: 0.1,
            },
        },
    }

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
            },
        },
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#03040a] via-[#050b16] to-[#010204] p-4 md:p-6 text-white">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-4xl mx-auto space-y-8"
            >
                <motion.div variants={cardVariants} className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto shadow-lg backdrop-blur-sm border border-white/10">
                        <Settings className="w-8 h-8 text-slate-200" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Impostazioni</h1>
                    <p className="text-slate-300 text-lg font-medium">Gestisci le informazioni del tuo locale</p>
                </motion.div>

                <motion.form
                    onSubmit={onSave}
                    variants={cardVariants}
                    className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl will-change-transform"
                >
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-200 uppercase tracking-wide">
                                <Store className="w-4 h-4 text-slate-400" />
                                Nome del locale
                            </label>
                            <input
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-transparent transition-all shadow-sm hover:bg-white/10"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Inserisci il nome del tuo locale"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-200 uppercase tracking-wide">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                Indirizzo
                            </label>
                            <input
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-transparent transition-all shadow-sm hover:bg-white/10"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Indirizzo completo del locale"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-200 uppercase tracking-wide">
                                <Phone className="w-4 h-4 text-slate-400" />
                                Telefono
                            </label>
                            <input
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-transparent transition-all shadow-sm hover:bg-white/10"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="Numero di contatto"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-200 uppercase tracking-wide">
                                <Settings className="w-4 h-4 text-slate-400" />
                                Tipo de cuenta
                            </label>
                            <select
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-transparent transition-all shadow-sm hover:bg-white/10"
                                value={plan}
                                onChange={(e) => setPlan(e.target.value === "premium" ? "premium" : "free")}
                            >
                                <option value="free" className="bg-slate-900 text-white">Free</option>
                                <option value="premium" className="bg-slate-900 text-white">Premium</option>
                            </select>
                            <p className="text-sm text-slate-400">
                                Free mantiene casi todas las funciones, pero con limite de intentos en la IA. Premium elimina ese cap.
                            </p>
                            <Link href="/pago" className="inline-flex text-sm font-medium text-cyan-300 hover:text-cyan-200">
                                Ir a la pagina de upgrade
                            </Link>
                        </div>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSaving}
                            className="w-full bg-gradient-to-r from-blue-500/80 to-indigo-600/80 hover:from-blue-600/90 hover:to-indigo-700/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg backdrop-blur-sm border border-white/10 flex items-center justify-center gap-3 text-lg"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? "Salvataggio..." : "Salva impostazioni"}
                        </motion.button>
                        {saveError && <p className="mt-3 text-sm font-medium text-rose-400">{saveError}</p>}
                        {saveSuccess && <p className="mt-3 text-sm font-medium text-emerald-300">{saveSuccess}</p>}
                    </div>
                </motion.form>

                <motion.div
                    variants={cardVariants}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
                            <Settings className="w-6 h-6 text-amber-300" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">Informazioni importanti</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Queste informazioni compariranno nei tuoi QR e saranno visibili ai clienti. Tienile sempre aggiornate
                                per offrire un'esperienza più chiara e professionale.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
