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

const STATUS_NORMALIZE: Record<string, string> = {
  ativo: "Ativo",
  finalizado: "Finalizado",
  "em preparo": "Em Preparo",
  em_preparo: "Em Preparo",
}

export const STATUS_CLASSES: Record<string, string> = {
  Ativo: "border-green-500/30 bg-green-500/10 text-green-700",
  Finalizado: "border-muted-foreground/30 bg-muted text-muted-foreground",
  "Em Preparo": "border-amber-500/30 bg-amber-500/10 text-amber-700",
}

export const DEFAULT_STATUS_CLASS = "border-muted-foreground/30 bg-muted text-muted-foreground"

export function normalizeStatus(status: string): string {
  return STATUS_NORMALIZE[status.toLowerCase()] ?? status
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapApiLote(item: any): UILote {
  const production = item.producao ?? item.producaoTotal ?? 0
  const cost = item.custo ?? item.custoTotal ?? 0
  const salePrice = item.precoVenda ?? 0
  const revenue = item.receita ?? production * salePrice
  const profit = item.lucroEstimado ?? item.lucro ?? revenue - cost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  return {
    id: String(item.id),
    name: item.nomeLote || item.lote || `Lote ${item.id}`,
    crop: item.cultura || "",
    production,
    cost,
    salePrice,
    revenue,
    profit,
    margin,
    status: item.status ? normalizeStatus(item.status) : "",
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapApiEvento(item: any, loteId: string): TraceabilityEvent {
  const rawType = String(item.tipoEvento ?? item.type ?? "OTHER").toUpperCase()
  const type = (EVENT_TYPES as string[]).includes(rawType) ? (rawType as TraceabilityEventType) : "OTHER"
  return {
    id: String(item.id ?? crypto.randomUUID()),
    lotId: loteId,
    type,
    description: item.descricao ?? item.description ?? "",
    timestamp: new Date(item.dataEvento ?? item.criadoEm ?? item.timestamp ?? Date.now()),
  }
}
