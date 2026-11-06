import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { ProgressIndicator } from "@/src/components/progress-indicator"
import { Leaf, ClipboardList } from "lucide-react"
import { cn } from "@/src/lib/utils"
import type { CropStatus } from "@/src/types"

export interface CultivationLotCardProps {
  lotId: string
  lotName: string
  cropName: string
  status: CropStatus
  eventCount: number
  isComplete?: boolean
}

export function CultivationLotCard({
  lotId,
  lotName,
  cropName,
  status,
  eventCount,
  isComplete = false,
}: CultivationLotCardProps) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{cropName}</p>
              <h3 className="text-lg font-semibold text-foreground">{lotName}</h3>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              isComplete
                ? "border-green-500/30 bg-green-500/10 text-green-700"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700",
            )}
          >
            {isComplete ? "Concluido" : "Em andamento"}
          </Badge>
        </div>

        <div className="mt-4">
          <ProgressIndicator currentStatus={status} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            {eventCount} eventos registrados
          </div>
          <span className="text-sm font-medium text-foreground">Ver rastreabilidade</span>
        </div>
      </CardContent>
    </Card>
  )
}
