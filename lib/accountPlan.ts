export type AccountPlan = "free" | "premium"

export const POSTER_FEATURE_KEY = "openai_poster_generation"
export const FREE_POSTER_LIMIT = 5
export const POSTER_USAGE_WINDOW_LABEL = "este mes"
export const UPGRADE_URL = "/pago"

export function normalizeAccountPlan(value: unknown): AccountPlan {
  const normalized = String(value || "").trim().toLowerCase()
  return normalized === "premium" ? "premium" : "free"
}

export function getPlanFromMetadata(metadata: Record<string, unknown> | null | undefined): AccountPlan {
  if (!metadata) return "free"

  return normalizeAccountPlan(
    metadata["plan"] ??
      metadata["account_plan"] ??
      metadata["subscription_plan"] ??
      metadata["tier"],
  )
}

export function getPosterLimitForPlan(plan: AccountPlan): number | null {
  return plan === "premium" ? null : FREE_POSTER_LIMIT
}

export function buildPosterUsageSummary(plan: AccountPlan, usedCount: number) {
  const limit = getPosterLimitForPlan(plan)
  const remainingCount = limit == null ? null : Math.max(limit - usedCount, 0)
  const hasReachedLimit = limit != null && usedCount >= limit
  const isNearLimit = limit != null && remainingCount != null && remainingCount <= 1

  return {
    plan,
    limit,
    usedCount,
    remainingCount,
    hasReachedLimit,
    isNearLimit,
    usageWindowLabel: POSTER_USAGE_WINDOW_LABEL,
  }
}
