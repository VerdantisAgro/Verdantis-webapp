import Image from "next/image"
import { Card, CardContent } from "@/src/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/src/lib/utils"
import type { CropMarketData } from "@/src/types"

const trendConfig = {
  up: {
    icon: TrendingUp,
    label: "Em alta",
    color: "text-green-600",
    bg: "bg-green-500/10 border-green-500/20",
  },
  down: {
    icon: TrendingDown,
    label: "Em baixa",
    color: "text-red-600",
    bg: "bg-red-500/10 border-red-500/20",
  },
  stable: {
    icon: Minus,
    label: "Estavel",
    color: "text-amber-600",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

export function CropMarketCard({ name, imageUrl, pricePerSack, priceMin, priceMax, unit, priceTrend }: CropMarketData) {
  const trend = trendConfig[priceTrend]
  const TrendIcon = trend.icon
  const hasRange = priceMin !== undefined && priceMax !== undefined

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 group">
      <div className="relative h-36 w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <p className="text-white font-semibold text-sm drop-shadow-md leading-tight">{name}</p>
          <span
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border",
              trend.bg,
              trend.color
            )}
          >
            <TrendIcon className="h-2.5 w-2.5" />
            {trend.label}
          </span>
        </div>
      </div>

      <CardContent className="p-3.5">
        {hasRange ? (
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Faixa de preco</p>
            <p className="text-base font-bold text-foreground leading-tight">
              {formatCurrency(priceMin!)}
              <span className="text-muted-foreground font-normal mx-1">~</span>
              {formatCurrency(priceMax!)}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Preco / saca</p>
            <p className="text-base font-bold text-foreground">{formatCurrency(pricePerSack)}</p>
          </div>
        )}
        {unit && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{unit}</p>
        )}
      </CardContent>
    </Card>
  )
}
