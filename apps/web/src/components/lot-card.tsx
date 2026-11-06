import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import { Leaf, TrendingUp, TrendingDown } from "lucide-react"

export interface LotCardProps {
  id: string
  name: string
  cropName: string
  production: number
  cost: number
  revenue: number
  profit: number
  status: "active" | "completed"
}

export function LotCard({
  name,
  cropName,
  production,
  cost,
  revenue,
  profit,
  status,
}: LotCardProps) {
  const profitable = profit >= 0
  const statusLabel = status === "active" ? "Ativo" : "Finalizado"

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <Card className="relative overflow-hidden border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          profitable ? "bg-green-500" : "bg-red-500",
        )}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{cropName}</p>
                <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  status === "active"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                    : "border-green-500/30 bg-green-500/10 text-green-700",
                )}
              >
                {statusLabel}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {production} sacas
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              profitable ? "text-green-600" : "text-red-600",
            )}
          >
            {profitable ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {profitable ? "Lucro" : "Prejuizo"}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Resultado</p>
            <p className={cn("text-2xl font-semibold", profitable ? "text-green-600" : "text-red-600")}>
              {formatCurrency(profit)}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Receita</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Custo</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(cost)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
