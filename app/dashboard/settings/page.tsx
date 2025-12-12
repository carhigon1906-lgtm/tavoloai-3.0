// @ts-nocheck
"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Settings, MapPin, Phone, Store, Save } from "lucide-react"

export default function SettingsPage() {
    const [nombre, setNombre] = useState("Mi Restaurante")
    const [direccion, setDireccion] = useState("Calle 123, Ciudad")
    const [telefono, setTelefono] = useState("+57 300 000 0000")

    const onSave = (e: React.FormEvent) => {
        e.preventDefault()
        alert("Guardado (demo)")
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
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/40 p-4 md:p-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-4xl mx-auto space-y-8"
            >
                <motion.div variants={cardVariants} className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto shadow-lg backdrop-blur-sm">
                        <Settings className="w-8 h-8 text-slate-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Configuración</h1>
                    <p className="text-slate-600 text-lg font-medium">Administra la información de tu restaurante</p>
                </motion.div>

                <motion.form
                    onSubmit={onSave}
                    variants={cardVariants}
                    className="bg-white/40 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8 space-y-8 will-change-transform"
                >
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                <Store className="w-4 h-4 text-slate-500" />
                                Nombre del restaurante
                            </label>
                            <input
                                className="w-full bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all shadow-sm hover:bg-white/70"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ingresa el nombre de tu restaurante"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                Dirección
                            </label>
                            <input
                                className="w-full bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all shadow-sm hover:bg-white/70"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Dirección completa del restaurante"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                <Phone className="w-4 h-4 text-slate-500" />
                                Teléfono
                            </label>
                            <input
                                className="w-full bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all shadow-sm hover:bg-white/70"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="Número de contacto"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-500/80 to-indigo-600/80 hover:from-blue-600/90 hover:to-indigo-700/90 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg backdrop-blur-sm border border-white/10 flex items-center justify-center gap-3 text-lg"
                        >
                            <Save className="w-5 h-5" />
                            Guardar Configuración
                        </motion.button>
                    </div>
                </motion.form>

                <motion.div
                    variants={cardVariants}
                    className="bg-white/30 backdrop-blur-md rounded-3xl shadow-lg border border-white/20 p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Settings className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Información importante</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Esta información se mostrará en tus códigos QR y será visible para tus clientes. Asegúrate de mantenerla
                                actualizada para brindar la mejor experiencia.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
