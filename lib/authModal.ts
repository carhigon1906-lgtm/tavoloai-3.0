// lib/authModal.ts
"use client"

/**
 * Abre el modal de autenticación
 * - Lanza un CustomEvent "auth:open"
 * - Opcional: registra evento en Google Analytics si está disponible
 */
type OpenAuthModalOptions = {
  redirectTo?: string
}

export function openAuthModal(options?: OpenAuthModalOptions) {
  if (typeof window !== "undefined") {
    try {
      ;(window as typeof window & { __authModalOpen?: boolean }).__authModalOpen = true
      if (options?.redirectTo) {
        window.sessionStorage.setItem("authRedirectTo", options.redirectTo)
      }

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

export function openSignupModal(options?: OpenAuthModalOptions) {
  if (typeof window !== "undefined") {
    try {
      ;(window as typeof window & { __authModalOpen?: boolean }).__authModalOpen = true
      if (options?.redirectTo) {
        window.sessionStorage.setItem("authRedirectTo", options.redirectTo)
      }

      window.dispatchEvent(new CustomEvent("auth:open:signup"))

      if (typeof (window as any).gtag === "function") {
        ;(window as any).gtag("event", "auth_modal_opened", {
          event_category: "engagement",
          event_label: "cta_click_signup",
        })
      }
    } catch (error) {
      console.warn("Failed to open signup modal:", error)
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
      ;(window as typeof window & { __authModalOpen?: boolean }).__authModalOpen = false
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
