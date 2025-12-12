import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Servicio de Supabase no configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu entorno.",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { email, password, name, business } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios." }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, business },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo crear el usuario." }, { status: 500 })
  }
}
