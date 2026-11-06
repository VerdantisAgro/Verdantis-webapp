import type { Evento, Lote } from "@/src/api"
import type { TraceabilityEvent, TraceabilityEventType } from "@/src/types"

export const CROPS = ["Milho", "Soja", "Cafe", "Trigo", "Arroz", "Feijao", "Algodao", "Alface", "Tomate"]

export type UILote = {
  id: string
  name: string
  crop: string
  production: number
  cost: number
  salePrice: number
  revenue: number
  profit: number
  margin: number
  status: string
}

const STATUS_LABELS: Record<Lote["status"], string> = {
  ativo: "Ativo",
  finalizado: "Finalizado",
}

export const STATUS_CLASSES: Record<string, string> = {
  Ativo: "border-green-500/30 bg-green-500/10 text-green-700",
  Finalizado: "border-muted-foreground/30 bg-muted text-muted-foreground",
}

export const DEFAULT_STATUS_CLASS = "border-muted-foreground/30 bg-muted text-muted-foreground"

export function mapApiLote(lote: Lote): UILote {
  return {
    id: String(lote.id),
    name: lote.nomeLote,
    crop: lote.cultura,
    production: lote.producaoTotal,
    cost: lote.custoTotal,
    salePrice: lote.precoVenda,
    revenue: lote.receita,
    profit: lote.lucro,
    margin: lote.receita > 0 ? (lote.lucro / lote.receita) * 100 : 0,
    status: STATUS_LABELS[lote.status] ?? lote.status,
  }
}

const EVENT_TYPES: TraceabilityEventType[] = [
  "INPUT_ADDITION",
  "IRRIGATION",
  "HARVEST",
  "PEST_CONTROL",
  "SOIL_PREPARATION",
  "PRUNING",
  "FERTILIZATION",
  "INSPECTION",
  "OTHER",
]

export function mapApiEvento(evento: Evento, loteId: string): TraceabilityEvent {
  const type = (EVENT_TYPES as string[]).includes(evento.tipoEvento)
    ? (evento.tipoEvento as TraceabilityEventType)
    : "OTHER"
  return {
    id: String(evento.id),
    lotId: loteId,
    type,
    description: evento.descricao,
    timestamp: new Date(evento.ocorridoEm),
    hash: evento.hash,
  }
}
