"use client"

import type React from "react"
import { Leaf } from "lucide-react"
import { DashboardSidebar } from "@/src/components/dashboard-sidebar"

export default function ProdutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Verdantis</h1>
                <p className="text-xs text-muted-foreground">Dashboard do Produtor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <DashboardSidebar role="produtor" />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
