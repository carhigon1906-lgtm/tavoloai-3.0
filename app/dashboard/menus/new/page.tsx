// @ts-nocheck
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Save, Layers } from "lucide-react"

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

export default function NewMenuPage() {
  const [nombre, setNombre] = useState("")
  const [slug, setSlug] = useState("")
  const [descripcion, setDescripcion] = useState("")

  useEffect(() => {
    if (!nombre || slug) return
    setSlug(slugify(nombre))
  }, [nombre, slug])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      alert("El nombre del menú es obligatorio.")
      return
    }
    if (!slug.trim()) {
      alert("El slug del menú es obligatorio.")
      return
    }
    alert("Menú creado (demo).")
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 16 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 24 } },
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#03040a] via-[#050b16] to-[#010204] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.16),transparent_60%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.section
          variants={cardVariants}
          className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 shadow-lg border border-white/10">
            <Layers className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Crear menú nuevo</h1>
          <p className="mt-2 text-lg font-medium text-slate-300">
            Define el nombre, el slug público y una breve descripción para tu menú.
          </p>
        </motion.section>

        <motion.section
          variants={cardVariants}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Nombre del menú</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-transparent transition-all shadow-sm hover:bg-white/10"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Carta principal"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Slug público</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-transparent transition-all shadow-sm hover:bg-white/10"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="carta-principal"
              />
              <p className="text-xs text-slate-400">Este slug se usará en la URL pública del menú.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Descripción</label>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-transparent transition-all shadow-sm hover:bg-white/10"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe qué incluye este menú."
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-emerald-400/80 to-cyan-400/80 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg backdrop-blur-sm border border-white/10 flex items-center justify-center gap-3 text-lg"
            >
              <Save className="w-5 h-5" />
              Crear menú
            </motion.button>
          </form>
        </motion.section>
      </motion.div>
    </div>
  )
}
