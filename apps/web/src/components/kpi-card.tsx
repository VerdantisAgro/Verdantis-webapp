import { Card, CardContent } from "@/src/components/ui/card"
import { cn } from "@/src/lib/utils"
import type { KpiCardProps } from "@/src/types"

export function KpiCard({ title, value, description, icon, trend, variant = "default" }: KpiCardProps) {
  const trendColor =
    trend && trend.value >= 0 ? "text-green-600" : "text-red-600"

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-2xl font-bold",
                variant === "success" && "text-green-600",
                variant === "danger" && "text-red-600",
                variant === "warning" && "text-amber-600",
                variant === "default" && "text-foreground"
              )}
            >
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                <span>{trend.value >= 0 ? "+" : ""}{trend.value}%</span>
                <span className="text-muted-foreground font-normal">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
