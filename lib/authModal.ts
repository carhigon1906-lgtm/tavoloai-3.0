// lib/authModal.ts
"use client"

/**
 * Abre el modal de autenticación
 * - Lanza un CustomEvent "auth:open"
 * - Opcional: registra evento en Google Analytics si está disponible
 */
export function openAuthModal() {
  if (typeof window !== "undefined") {
    try {
      // Disparar evento custom
      window.dispatchEvent(new CustomEvent("auth:open"))

      // Tracking opcional con gtag
      if (typeof (window as any).gtag === "function") {
        ;(window as any).gtag("event", "auth_modal_opened", {
          event_category: "engagement",
          event_label: "cta_click",
        })
      }
    } catch (error) {
      console.warn("Failed to open auth modal:", error)
    }
  }
}

/**
 * Cierra el modal de autenticación
 * - Lanza un CustomEvent "auth:close"
 */
export function closeAuthModal() {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("auth:close"))
    } catch (error) {
      console.warn("Failed to close auth modal:", error)
    }
  }
}

/**
 * Verifica si el modal de autenticación está soportado
 */
export function isAuthModalSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.dispatchEvent === "function"
  )
}
