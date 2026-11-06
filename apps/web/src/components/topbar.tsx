"use client"

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Bell } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface TopbarProps {
  title: string
  description?: string
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificacoes</span>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">JP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
