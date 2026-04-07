import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { isAdminEmail } from "@/lib/adminAccess"
import { query } from "@/lib/db"

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

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  }

  try {
    const [overviewResult, dailyResult, topBusinessesResult, recentUsersResult, sourcesResult] = await Promise.all([
      query<{
        total_accounts: string
        new_accounts_7d: string
        new_accounts_30d: string
        total_menus: string
        active_menus: string
        scans_24h: string
        scans_7d: string
        scans_30d: string
        visitors_24h: string
        visitors_7d: string
        visitors_30d: string
        active_businesses_7d: string
        active_businesses_30d: string
      }>(`
        select
          (select count(*)::text from auth.users) as total_accounts,
          (select count(*)::text from auth.users where created_at >= now() - interval '7 days') as new_accounts_7d,
          (select count(*)::text from auth.users where created_at >= now() - interval '30 days') as new_accounts_30d,
          (select count(*)::text from public.menus) as total_menus,
          (select count(*)::text from public.menus where activo = true) as active_menus,
          (select count(*)::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '24 hours') as scans_24h,
          (select count(*)::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '7 days') as scans_7d,
          (select count(*)::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '30 days') as scans_30d,
          (select count(distinct coalesce(nullif(session_id, ''), concat('anon-', id)))::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '24 hours') as visitors_24h,
          (select count(distinct coalesce(nullif(session_id, ''), concat('anon-', id)))::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '7 days') as visitors_7d,
          (select count(distinct coalesce(nullif(session_id, ''), concat('anon-', id)))::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '30 days') as visitors_30d,
          (select count(distinct user_id)::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '7 days') as active_businesses_7d,
          (select count(distinct user_id)::text from public.menu_analytics_events where event_type = 'menu_view' and created_at >= now() - interval '30 days') as active_businesses_30d
      `),
      query<{
        day: string
        accounts: string
        scans: string
        visitors: string
      }>(`
        with days as (
          select generate_series(
            date_trunc('day', now()) - interval '13 days',
            date_trunc('day', now()),
            interval '1 day'
          ) as day
        ),
        accounts as (
          select date_trunc('day', created_at) as day, count(*)::int as value
          from auth.users
          where created_at >= now() - interval '14 days'
          group by 1
        ),
        scans as (
          select date_trunc('day', created_at) as day, count(*)::int as value
          from public.menu_analytics_events
          where event_type = 'menu_view' and created_at >= now() - interval '14 days'
          group by 1
        ),
        visitors as (
          select
            date_trunc('day', created_at) as day,
            count(distinct coalesce(nullif(session_id, ''), concat('anon-', id)))::int as value
          from public.menu_analytics_events
          where event_type = 'menu_view' and created_at >= now() - interval '14 days'
          group by 1
        )
        select
          to_char(days.day, 'YYYY-MM-DD') as day,
          coalesce(accounts.value, 0)::text as accounts,
          coalesce(scans.value, 0)::text as scans,
          coalesce(visitors.value, 0)::text as visitors
        from days
        left join accounts on accounts.day = days.day
        left join scans on scans.day = days.day
        left join visitors on visitors.day = days.day
        order by days.day asc
      `),
      query<{
        user_id: string
        email: string | null
        business: string | null
        menus_total: string
        active_menus: string
        scans_30d: string
        visitors_30d: string
      }>(`
        with business_metrics as (
          select
            m.user_id,
            count(distinct m.id)::int as menus_total,
            count(distinct case when m.activo = true then m.id end)::int as active_menus,
            count(e.id)::int as scans_30d,
            count(distinct case when e.id is not null then coalesce(nullif(e.session_id, ''), concat('anon-', e.id)) end)::int as visitors_30d
          from public.menus m
          left join public.menu_analytics_events e
            on e.menu_id = m.id
            and e.event_type = 'menu_view'
            and e.created_at >= now() - interval '30 days'
          group by m.user_id
        )
        select
          bm.user_id::text as user_id,
          u.email,
          nullif(trim(coalesce(u.raw_user_meta_data ->> 'business', u.raw_user_meta_data ->> 'name', '')), '') as business,
          bm.menus_total::text,
          bm.active_menus::text,
          bm.scans_30d::text,
          bm.visitors_30d::text
        from business_metrics bm
        left join auth.users u on u.id = bm.user_id
        order by bm.scans_30d desc, bm.active_menus desc, bm.menus_total desc
        limit 6
      `),
      query<{
        id: string
        email: string | null
        business: string | null
        created_at: string
      }>(`
        select
          id::text as id,
          email,
          nullif(trim(coalesce(raw_user_meta_data ->> 'business', raw_user_meta_data ->> 'name', '')), '') as business,
          created_at::text
        from auth.users
        order by created_at desc
        limit 8
      `),
      query<{
        source: string
        visits: string
      }>(`
        select
          case
            when referrer is null or btrim(referrer) = '' then 'Directo / QR'
            when referrer ilike '%instagram%' then 'Instagram'
            when referrer ilike '%facebook%' then 'Facebook'
            when referrer ilike '%whatsapp%' or referrer ilike '%wa.me%' then 'WhatsApp'
            when referrer ilike '%google%' then 'Google'
            when referrer ilike '%tiktok%' then 'TikTok'
            else split_part(regexp_replace(referrer, '^https?://(www\\.)?', ''), '/', 1)
          end as source,
          count(*)::text as visits
        from public.menu_analytics_events
        where event_type = 'menu_view'
          and created_at >= now() - interval '30 days'
        group by 1
        order by count(*) desc
        limit 6
      `),
    ])

    const overview = overviewResult.rows[0]
    const toNumber = (value?: string | null) => Number(value || 0)
    const weeklyVisitors = toNumber(overview?.visitors_7d)
    const monthlyVisitors = toNumber(overview?.visitors_30d)
    const stickiness = monthlyVisitors > 0 ? Math.round((weeklyVisitors / monthlyVisitors) * 100) : 0

    return NextResponse.json({
      overview: {
        totalAccounts: toNumber(overview?.total_accounts),
        newAccounts7d: toNumber(overview?.new_accounts_7d),
        newAccounts30d: toNumber(overview?.new_accounts_30d),
        totalMenus: toNumber(overview?.total_menus),
        activeMenus: toNumber(overview?.active_menus),
        scans24h: toNumber(overview?.scans_24h),
        scans7d: toNumber(overview?.scans_7d),
        scans30d: toNumber(overview?.scans_30d),
        visitors24h: toNumber(overview?.visitors_24h),
        visitors7d: toNumber(overview?.visitors_7d),
        visitors30d: toNumber(overview?.visitors_30d),
        activeBusinesses7d: toNumber(overview?.active_businesses_7d),
        activeBusinesses30d: toNumber(overview?.active_businesses_30d),
        stickiness,
      },
      daily: dailyResult.rows.map((row: { day: string; accounts: string; scans: string; visitors: string }) => ({
        day: row.day,
        accounts: toNumber(row.accounts),
        scans: toNumber(row.scans),
        visitors: toNumber(row.visitors),
      })),
      topBusinesses: topBusinessesResult.rows.map((row: {
        user_id: string
        email: string | null
        business: string | null
        menus_total: string
        active_menus: string
        scans_30d: string
        visitors_30d: string
      }) => ({
        userId: row.user_id,
        email: row.email || "Sin email",
        business: row.business || row.email || "Negocio sin nombre",
        menusTotal: toNumber(row.menus_total),
        activeMenus: toNumber(row.active_menus),
        scans30d: toNumber(row.scans_30d),
        visitors30d: toNumber(row.visitors_30d),
      })),
      recentUsers: recentUsersResult.rows.map((row: {
        id: string
        email: string | null
        business: string | null
        created_at: string
      }) => ({
        id: row.id,
        email: row.email || "Sin email",
        business: row.business || row.email || "Usuario sin nombre",
        createdAt: row.created_at,
      })),
      trafficSources: sourcesResult.rows.map((row: { source: string; visits: string }) => ({
        source: row.source || "Desconocido",
        visits: toNumber(row.visits),
      })),
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar el resumen admin."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
