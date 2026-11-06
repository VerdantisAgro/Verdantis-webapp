import { lotesApi } from "@/src/api"
import { mapApiEvento, mapApiLote, type UILote } from "@/src/lib/lotes"
import type { Cultivo, CropStatus, TraceabilityHash } from "@/src/types"

const CROP_STATUSES: CropStatus[] = ["Plantio", "Em Crescimento", "Pronto", "Colheita"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHash(raw: any, loteId: string, eventCount: number): TraceabilityHash | undefined {
  const hash = raw?.hashFinal ?? raw?.hashEventos ?? raw?.traceabilityHash?.hash ?? raw?.hash
  if (!hash) return undefined
  const generatedAt = raw?.finalizadoEm ?? raw?.traceabilityHash?.generatedAt
  return {
    lotId: loteId,
    hash,
    generatedAt: generatedAt ? new Date(generatedAt) : new Date(),
    eventCount,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loteToCultivo(raw: any, lote: UILote = mapApiLote(raw)): Cultivo {
  const isComplete = lote.status === "Finalizado" || Boolean(raw.isComplete)
  const status = CROP_STATUSES.includes(raw.estagio) ? (raw.estagio as CropStatus) : isComplete ? "Colheita" : "Em Crescimento"
  return {
    id: lote.id,
    loteId: lote.id,
    name: lote.crop,
    lot: lote.name,
    status,
    plantingDate: raw.dataPlantio ?? raw.plantingDate ?? "",
    harvestDate: raw.previsaoColheita ?? raw.harvestDate ?? "",
    area: raw.areaHectares ?? raw.area ?? 0,
    variety: raw.variedade ?? raw.variety ?? "",
    expectedYield: lote.production,
    isComplete,
    traceabilityHash: mapHash(raw, lote.id, 0),
    events: [],
  }
}

export async function fetchCultivoEvents(loteId: string) {
  const events = await lotesApi.getEventos(Number(loteId))
  return (events || []).map((e) => mapApiEvento(e, loteId))
}

// The finalize endpoint returns the hash and related artifacts for the lote.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hashFromFinalize(res: any, loteId: string, eventCount: number): TraceabilityHash | undefined {
  return mapHash(res, loteId, eventCount)
}
