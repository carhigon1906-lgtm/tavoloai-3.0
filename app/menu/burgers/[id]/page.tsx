// app/menu/burgers/[id]/page.tsx
// ⛔️ IMPORTANTÍSIMO: aquí NO va "use client"

import BurgerDetailClient from "./BurgerDetailClient"

interface BurgerDetailPageProps {
    params: { id: string }
}

// ✅ Pre-generamos las 4 páginas de detalle para que sean estáticas
export function generateStaticParams() {
    return [
        { id: "1" },
        { id: "2" },
        { id: "3" },
        { id: "4" },
    ]
}

export default function BurgerDetailPage({ params }: BurgerDetailPageProps) {
    // En el App Router, params.id ya viene como string
    return <BurgerDetailClient burgerId={params.id} />
}
