import { supabaseAdmin } from "@/lib/supabaseAdmin"
import {
  POSTER_FEATURE_KEY,
  type AccountPlan,
  buildPosterUsageSummary,
} from "@/lib/accountPlan"

function getCurrentWindowBounds() {
  const now = new Date()
  const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const windowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  return {
    windowStart,
    windowEnd,
    windowStartIso: windowStart.toISOString(),
    windowEndIso: windowEnd.toISOString(),
  }
}

export async function getPosterUsageForUser(userId: string, plan: AccountPlan) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin no configurado.")
  }

  const { windowStartIso, windowEndIso } = getCurrentWindowBounds()

  const { data, error } = await supabaseAdmin
    .from("poster_generation_usage")
    .select("used_count")
    .eq("user_id", userId)
    .eq("feature_key", POSTER_FEATURE_KEY)
    .eq("window_start", windowStartIso)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const usedCount = Number(data?.used_count || 0)

  return {
    ...buildPosterUsageSummary(plan, usedCount),
    windowStart: windowStartIso,
    windowEnd: windowEndIso,
  }
}

export async function consumePosterGeneration(userId: string, plan: AccountPlan) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin no configurado.")
  }

  const usage = await getPosterUsageForUser(userId, plan)
  const nextUsedCount = usage.usedCount + 1

  const { error } = await supabaseAdmin.from("poster_generation_usage").upsert(
    {
      user_id: userId,
      feature_key: POSTER_FEATURE_KEY,
      window_start: usage.windowStart,
      window_end: usage.windowEnd,
      used_count: nextUsedCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,feature_key,window_start" },
  )

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...buildPosterUsageSummary(plan, nextUsedCount),
    windowStart: usage.windowStart,
    windowEnd: usage.windowEnd,
  }
}

