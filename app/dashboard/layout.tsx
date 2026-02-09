import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import RequireAuth from "@/components/guards/RequireAuth"

const Sidebar = dynamic(() => import("./Sidebar"))
const DashboardNavbar = dynamic(() => import("./DashboardNavbar"))
const MobileNav = dynamic(() => import("./MobileNav"))

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="h-screen w-full bg-gradient-to-br from-[#04060c] via-[#050911] to-[#020409] text-slate-100">
        <div className="dashboard-compact h-full w-full flex">
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0">
            <DashboardNavbar />

            <main className="flex-1 overflow-auto p-5 pb-28 md:pb-5" data-lenis-prevent>
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>

            <MobileNav />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
