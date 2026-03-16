import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import RequireAuth from "@/components/guards/RequireAuth"

const Sidebar = dynamic(() => import("./Sidebar"))
const DashboardNavbar = dynamic(() => import("./DashboardNavbar"))
const MobileNav = dynamic(() => import("./MobileNav"))

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[#04060c] via-[#050911] to-[#020409] text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(59,130,246,0.14),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="dashboard-compact relative z-10 flex h-full w-full">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardNavbar />

            <main className="flex-1 overflow-auto px-4 pb-28 pt-4 md:px-5 md:pb-5 md:pt-5" data-lenis-prevent>
              <div className="mx-auto max-w-7xl">
                <div className="min-h-full rounded-[30px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl md:p-5">
                  {children}
                </div>
              </div>
            </main>

            <MobileNav />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
