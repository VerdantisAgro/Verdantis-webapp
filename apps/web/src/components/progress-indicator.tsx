import { cn } from "@/src/lib/utils"
import type { CropStatus } from "@/src/types"

const steps: { status: CropStatus; label: string }[] = [
  { status: "Plantio", label: "Plantio" },
  { status: "Em Crescimento", label: "Crescimento" },
  { status: "Pronto", label: "Pronto" },
  { status: "Colheita", label: "Colheita" },
]

const statusOrder: Record<CropStatus, number> = {
  "Plantio": 0,
  "Em Crescimento": 1,
  "Pronto": 2,
  "Colheita": 3,
}

interface ProgressIndicatorProps {
  currentStatus: CropStatus
}

export function ProgressIndicator({ currentStatus }: ProgressIndicatorProps) {
  const currentIndex = statusOrder[currentStatus]

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        return (
          <div key={step.status} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-full rounded-full transition-colors",
                isCompleted ? "bg-primary" : "bg-muted"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
