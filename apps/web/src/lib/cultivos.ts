import { lotesApi, type Certificado, type Lote } from "@/src/api"
import { formatDate } from "@/src/lib/format"
import { mapApiEvento } from "@/src/lib/lotes"
import type { Cultivo, TraceabilityHash } from "@/src/types"

export function loteToCultivo(lote: Lote): Cultivo {
  const isComplete = lote.status === "finalizado"
  return {
    id: String(lote.id),
    loteId: String(lote.id),
    name: lote.cultura,
    lot: lote.nomeLote,
    status: isComplete ? "Colheita" : lote.dataPlantio ? "Em Crescimento" : "Plantio",
    plantingDate: lote.dataPlantio ? formatDate(`${lote.dataPlantio}T00:00:00`) : "",
    harvestDate: lote.previsaoColheita ? formatDate(`${lote.previsaoColheita}T00:00:00`) : "",
    area: lote.areaHectares,
    variety: lote.variedade,
    expectedYield: lote.producaoTotal,
    isComplete,
    traceabilityHash:
      lote.hashFinal && lote.codigoVerificacao
        ? {
            lotId: String(lote.id),
            hash: lote.hashFinal,
            verificationCode: lote.codigoVerificacao,
            generatedAt: new Date(lote.finalizadoEm ?? lote.atualizadoEm),
            eventCount: 0,
          }
        : undefined,
    events: [],
  }
}

export async function fetchCultivoEvents(loteId: string) {
  const events = await lotesApi.getEventos(loteId)
  return events.map((e) => mapApiEvento(e, loteId))
}

export function hashFromCertificate(cert: Certificado, loteId: string): TraceabilityHash {
  return {
    lotId: loteId,
    hash: cert.hashFinal,
    verificationCode: cert.codigoVerificacao,
    generatedAt: new Date(cert.finalizadoEm),
    eventCount: cert.totalEventos,
  }
}
