"use client"

import type React from "react"
import { Sidebar } from "@/src/components/sidebar"
import { AuthGuard } from "@/src/components/auth-guard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
