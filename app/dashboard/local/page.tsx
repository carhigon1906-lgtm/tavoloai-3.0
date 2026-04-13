// @ts-nocheck
"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Store, Upload, Image as ImageIcon, Save, MapPin, Phone, Quote, Clock } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function LocalPage() {
  const [businessName, setBusinessName] = useState("")
  const [businessNameSaved, setBusinessNameSaved] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [businessAddressSaved, setBusinessAddressSaved] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [businessPhoneSaved, setBusinessPhoneSaved] = useState("")
  const [businessSlogan, setBusinessSlogan] = useState("")
  const [businessSloganSaved, setBusinessSloganSaved] = useState("")
  const [businessHours, setBusinessHours] = useState("")
  const [businessHoursSaved, setBusinessHoursSaved] = useState("")
  const [nameError, setNameError] = useState("")
  const [nameSuccess, setNameSuccess] = useState("")
  const [isSavingName, setIsSavingName] = useState(false)
  const [logoPreview, setLogoPreview] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoName, setLogoName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState("")
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const session = data.session
      const metadata = session?.user?.user_metadata ?? {}
      setUserId(session?.user?.id ?? null)
      const business = metadata.business ?? ""
      setBusinessName(business)
      setBusinessNameSaved(business)
      const address = metadata.business_address ?? ""
      setBusinessAddress(address)
      setBusinessAddressSaved(address)
      const phone = metadata.business_phone ?? ""
      setBusinessPhone(phone)
      setBusinessPhoneSaved(phone)
      const slogan = metadata.business_slogan ?? ""
      setBusinessSlogan(slogan)
      setBusinessSloganSaved(slogan)
      const hours = metadata.business_hours ?? ""
      setBusinessHours(hours)
      setBusinessHoursSaved(hours)
      setLogoUrl(metadata.business_logo_url ?? "")
      setLogoPreview(metadata.business_logo_url ?? "")
    })

    return () => {
      mounted = false
    }
  }, [])

  const onLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "image/png") {
      setLogoPreview(logoUrl)
      setLogoName("")
      setLogoFile(null)
      setLogoError("Il logo deve essere un file PNG.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(String(reader.result || ""))
      setLogoName(file.name)
      setLogoFile(file)
      setLogoError("")
    }
    reader.readAsDataURL(file)
  }

  const saveBusinessDetails = async () => {
    if (!businessName.trim()) {
      setNameError("Il nome del locale è obbligatorio.")
      return
    }
    if (!userId) {
      setNameError("Devi accedere per salvare.")
      return
    }

    setIsSavingName(true)
    setNameError("")
    setNameSuccess("")

    const { error } = await supabase.auth.updateUser({
      data: {
        business: businessName.trim(),
        business_address: businessAddress.trim(),
        business_phone: businessPhone.trim(),
        business_slogan: businessSlogan.trim(),
        business_hours: businessHours.trim(),
      },
    })

    if (error) {
      setNameError(error.message)
    } else {
      setBusinessNameSaved(businessName.trim())
      setBusinessAddressSaved(businessAddress.trim())
      setBusinessPhoneSaved(businessPhone.trim())
      setBusinessSloganSaved(businessSlogan.trim())
      setBusinessHoursSaved(businessHours.trim())
      setNameSuccess("Dati aggiornati.")

      const { error: menusError } = await supabase
        .from("menus")
        .update({ nombre: businessName.trim(), updated_at: new Date().toISOString() })
        .eq("user_id", userId)

      if (menusError) {
        setNameError("Non è stato possibile aggiornare il nome nei menu pubblici.")
      }
    }

    setIsSavingName(false)
  }

  const uploadLogo = async () => {
    if (!logoFile) return
    if (!userId) {
      setLogoError("Devi accedere per caricare il logo.")
      return
    }

    setIsUploadingLogo(true)
    setLogoError("")

    const previousLogoUrl = logoUrl
    const filePath = `${userId}/business-logo-${Date.now()}.png`
    const formData = new FormData()
    formData.append("file", logoFile)
    formData.append("path", filePath)
    formData.append("bucket", "menu-assets")

    try {
      const response = await fetch("/api/menu/upload-logo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        setLogoError("Non è stato possibile caricare il logo. Controlla il bucket in Supabase.")
        return
      }

      const result = await response.json()
      if (!result?.publicUrl) {
        setLogoError("Non è stato possibile ottenere l'URL del logo.")
        return
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          business_logo_url: result.publicUrl,
        },
      })

      if (error) {
        setLogoError(error.message)
        return
      }

      const { error: menusError } = await supabase
        .from("menus")
        .update({ logo_url: result.publicUrl, updated_at: new Date().toISOString() })
        .eq("user_id", userId)

      if (menusError) {
        setLogoError("Non è stato possibile aggiornare il logo nei menu pubblici.")
        return
      }

        if (previousLogoUrl && previousLogoUrl !== result.publicUrl) {
          const url = new URL(previousLogoUrl)
          const marker = "/storage/v1/object/public/"
          const idx = url.pathname.indexOf(marker)
          if (idx !== -1) {
            const remainder = url.pathname.slice(idx + marker.length)
            const [bucket, ...pathParts] = remainder.split("/")
            const path = pathParts.join("/")
            if (bucket && path) {
              await fetch("/api/menu/delete-logo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bucket, path }),
              })
            }
          }
        }

        setLogoUrl(result.publicUrl)
      setLogoPreview(result.publicUrl)
      setLogoName("")
      setLogoFile(null)
    } finally {
      setIsUploadingLogo(false)
    }
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
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mx-auto max-w-4xl space-y-8">
        <motion.div variants={cardVariants} className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 shadow-lg backdrop-blur-sm">
            <Store className="h-8 w-8 text-emerald-200" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Mi local</h1>
          <p className="text-lg font-medium text-slate-300">Nome del locale e logo principale</p>
        </motion.div>

        <motion.section
          variants={cardVariants}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
              <Store className="h-4 w-4 text-slate-400" />
              Nome del locale
            </label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 transition-all shadow-sm hover:bg-white/10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value)
                setNameError("")
                setNameSuccess("")
              }}
              placeholder="Inserisci il nome del tuo locale"
            />
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
                <MapPin className="h-4 w-4 text-slate-400" />
                Indirizzo
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 transition-all shadow-sm hover:bg-white/10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                value={businessAddress}
                onChange={(e) => {
                  setBusinessAddress(e.target.value)
                  setNameError("")
                  setNameSuccess("")
                }}
                placeholder="Indirizzo completo del locale"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
                <Phone className="h-4 w-4 text-slate-400" />
                Telefono
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 transition-all shadow-sm hover:bg-white/10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                value={businessPhone}
                onChange={(e) => {
                  setBusinessPhone(e.target.value)
                  setNameError("")
                  setNameSuccess("")
                }}
                placeholder="Numero di contatto"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
                <Quote className="h-4 w-4 text-slate-400" />
                Slogan
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 transition-all shadow-sm hover:bg-white/10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                value={businessSlogan}
                onChange={(e) => {
                  setBusinessSlogan(e.target.value)
                  setNameError("")
                  setNameSuccess("")
                }}
                placeholder="Es: Sapori che raccontano una storia"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
                <Clock className="h-4 w-4 text-slate-400" />
                Orari di apertura
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder:text-slate-500 transition-all shadow-sm hover:bg-white/10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                value={businessHours}
                onChange={(e) => {
                  setBusinessHours(e.target.value)
                  setNameError("")
                  setNameSuccess("")
                }}
                placeholder="Es: Lun-Sab 12:00 - 23:00"
              />
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveBusinessDetails}
              disabled={
                isSavingName ||
                (businessName.trim() === businessNameSaved.trim() &&
                  businessAddress.trim() === businessAddressSaved.trim() &&
                  businessPhone.trim() === businessPhoneSaved.trim() &&
                  businessSlogan.trim() === businessSloganSaved.trim() &&
                  businessHours.trim() === businessHoursSaved.trim())
              }
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/20 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSavingName ? "Salvataggio..." : "Salva dati"}
            </motion.button>
            {nameError && <p className="text-sm font-medium text-rose-300">{nameError}</p>}
            {nameSuccess && <p className="text-sm font-medium text-emerald-300">{nameSuccess}</p>}
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0a1220] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Logo del restaurante</p>
                <p className="mt-1 text-xs text-slate-400">Formato PNG recomendado.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm font-semibold text-slate-200 transition hover:border-emerald-300/60 hover:text-white"
              >
                <Upload className="h-4 w-4" />
                {logoPreview ? "Cambiar logo" : "Subir logo PNG"}
              </button>

              <div className="flex min-h-[64px] items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo del restaurante" className="h-12 w-auto object-contain" />
                ) : (
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-emerald-300" />
                    <span>Vista previa</span>
                  </div>
                )}
              </div>
            </div>

            {logoName && <p className="text-xs font-medium text-slate-400">Archivo: {logoName}</p>}

            {logoError && <p className="text-sm font-medium text-rose-300">{logoError}</p>}

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={uploadLogo}
              disabled={!logoFile || isUploadingLogo}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/20 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingLogo ? "Subiendo..." : "Guardar logo"}
            </motion.button>

            <input ref={logoInputRef} type="file" accept="image/png" className="hidden" onChange={onLogoSelected} />
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}




