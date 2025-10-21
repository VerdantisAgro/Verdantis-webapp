"use client"

import { Button } from "@/src/components/ui/button"
import { Home, MapPin, Grid3x3, Sprout, BarChart3, Users, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface SidebarProps {
  role: "produtor" | "gestor"
}

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const produtorNavigation = [
    { name: "Dashboard", href: "/dashboard/produtor", icon: Home },
    { name: "Propriedades", href: "/dashboard/produtor/propriedades", icon: MapPin },
    { name: "Lotes", href: "/dashboard/produtor/lotes", icon: Grid3x3 },
    { name: "Cultivos", href: "/dashboard/produtor/cultivos", icon: Sprout },
    { name: "Perfil", href: "/dashboard/produtor/perfil", icon: User },
  ]

  const gestorNavigation = [
    { name: "Dashboard", href: "/dashboard/gestor", icon: Home },
    { name: "Analytics", href: "/dashboard/gestor/analytics", icon: BarChart3 },
    { name: "Produtores", href: "/dashboard/gestor/produtores", icon: Users },
    { name: "Perfil", href: "/dashboard/gestor/perfil", icon: User },
  ]

  const navigation = role === "produtor" ? produtorNavigation : gestorNavigation

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-border/40 bg-background/70 backdrop-blur-md overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? "" : "hover:bg-accent"}`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-border/40">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sair
          </Button>
        </div>
      </nav>
    </aside>
  )
}
