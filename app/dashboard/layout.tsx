import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import RequireAuth from "@/components/guards/RequireAuth"

const Sidebar = dynamic(() => import("./Sidebar"))
const DashboardNavbar = dynamic(() => import("./DashboardNavbar"))

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="h-screen w-full bg-gradient-to-br from-[#04060c] via-[#050911] to-[#020409] text-slate-100 flex">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />

          <main className="flex-1 overflow-auto p-6" data-lenis-prevent>
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </RequireAuth>
  )
}
