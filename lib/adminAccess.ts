const normalizeEmail = (value?: string | null) => (value || "").trim().toLowerCase()

export function getAdminEmail() {
  return normalizeEmail(process.env["ADMIN_EMAIL"] || process.env["NEXT_PUBLIC_ADMIN_EMAIL"])
}

export function getPublicAdminEmail() {
  return normalizeEmail(process.env["NEXT_PUBLIC_ADMIN_EMAIL"])
}

export function isAdminEmail(email?: string | null) {
  const adminEmail = getAdminEmail()
  return !!adminEmail && normalizeEmail(email) === adminEmail
}

export function isPublicAdminEmail(email?: string | null) {
  const adminEmail = getPublicAdminEmail()
  return !!adminEmail && normalizeEmail(email) === adminEmail
}
