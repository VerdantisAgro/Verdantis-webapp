"use client"

import { Button } from "@/src/components/ui/button"
import { Home, Grid3x3, Sprout, BarChart3, User, LogOut, Leaf, Calculator } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/src/lib/utils"
import { clearSession } from "@/src/lib/session"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Lotes", href: "/dashboard/lotes", icon: Grid3x3 },
  { name: "Cultivos", href: "/dashboard/cultivos", icon: Sprout },
  { name: "Simulacoes", href: "/dashboard/simulacao", icon: Calculator },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Perfil", href: "/dashboard/perfil", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearSession()
    router.replace("/")
  }

  return (
    <aside className="w-[240px] h-screen sticky top-0 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Leaf className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground tracking-tight">Verdantis</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
