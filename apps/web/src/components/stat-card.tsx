import { Card, CardContent } from "@/src/components/ui/card"
import { cn } from "@/src/lib/utils"
import type { StatCardProps } from "@/src/types"

export function StatCard({ title, value, icon, description, variant = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
              variant === "success" && "bg-green-500/10",
              variant === "danger" && "bg-red-500/10",
              variant === "default" && "bg-primary/10"
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-xl font-bold",
                variant === "success" && "text-green-600",
                variant === "danger" && "text-red-600",
                variant === "default" && "text-foreground"
              )}
            >
              {value}
            </p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
