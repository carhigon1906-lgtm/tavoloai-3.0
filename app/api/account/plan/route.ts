import { NextResponse } from "next/server"
import { getPlanFromMetadata } from "@/lib/accountPlan"
import { getPosterUsageForUser } from "@/lib/posterUsage"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin no configurado." }, { status: 500 })
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
  if (!bearer) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(bearer)

  if (userError || !user) {
    return NextResponse.json({ error: "Sesion invalida." }, { status: 401 })
  }

  try {
    const plan = getPlanFromMetadata(user.user_metadata as Record<string, unknown> | undefined)
    const posterUsage = await getPosterUsageForUser(user.id, plan)

    return NextResponse.json({
      account: {
        plan,
        posterUsage,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo cargar el plan." },
      { status: 500 },
    )
  }
}

