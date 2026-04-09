"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { lotesApi } from "@/src/api"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { ProgressIndicator } from "@/src/components/progress-indicator"
import { TraceabilityTimeline } from "@/src/components/traceability-timeline"
import { TraceabilityEventForm } from "@/src/components/traceability-event-form"
import { TraceabilityHashCard } from "@/src/components/traceability-hash-card"
import { AppButton } from "@/src/components/app-button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Calendar, Leaf, MapPin } from "lucide-react"
import type { CropStatus, Cultivo, TraceabilityEvent, TraceabilityHash } from "@/src/types"

const initialCultivos: Cultivo[] = [
  {
    id: "1", name: "Milho", lot: "Lote A3", loteId: "1", farm: "Fazenda Sao Jose", propertyId: "1",
    status: "Em Crescimento", plantingDate: "15 de Janeiro, 2025", harvestDate: "20 de Maio, 2025",
    area: 25, daysUntilHarvest: 15, progress: 85, irrigation: true, weather: true,
    variety: "AG 8088 PRO3", expectedYield: 180, isComplete: false,
    events: [
      { id: "e1", lotId: "1", type: "INPUT_ADDITION", description: "Aplicacao de fertilizante NPK 10-10-10, 200kg/ha", timestamp: new Date("2025-01-20") },
      { id: "e2", lotId: "1", type: "IRRIGATION", description: "Irrigacao por gotejamento - 4 horas", timestamp: new Date("2025-02-05") },
      { id: "e3", lotId: "1", type: "INPUT_ADDITION", description: "Aplicacao de defensivo contra lagarta-do-cartucho", timestamp: new Date("2025-03-10") },
    ],
  },
  {
    id: "2", name: "Soja", lot: "Lote B1", loteId: "2", farm: "Fazenda Boa Vista", propertyId: "2",
    status: "Plantio", plantingDate: "10 de Marco, 2025", harvestDate: "15 de Julho, 2025",
    area: 30, daysUntilHarvest: 127, progress: 15, irrigation: true, weather: true,
    variety: "M 6210 IPRO", expectedYield: 210, isComplete: false, events: [],
  },
  {
    id: "3", name: "Alface", lot: "Lote C2", loteId: "3", farm: "Fazenda Verde", propertyId: "3",
    status: "Colheita", plantingDate: "20 de Fevereiro, 2025", harvestDate: "05 de Abril, 2025",
    area: 15, daysUntilHarvest: 0, progress: 100, irrigation: true, weather: true,
    variety: "Crespa", expectedYield: 45, isComplete: true,
    traceabilityHash: {
      lotId: "3",
      hash: "0xa3f7b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
      generatedAt: new Date("2025-04-06"),
      eventCount: 5,
    },
    events: [
      { id: "e4", lotId: "3", type: "INPUT_ADDITION", description: "Adubacao organica com composto", timestamp: new Date("2025-02-22") },
      { id: "e5", lotId: "3", type: "IRRIGATION", description: "Irrigacao por aspersao", timestamp: new Date("2025-03-01") },
      { id: "e6", lotId: "3", type: "INPUT_ADDITION", description: "Aplicacao de calcario dolomitico", timestamp: new Date("2025-03-10") },
      { id: "e7", lotId: "3", type: "OTHER", description: "Inspecao de qualidade - folhas saudaveis", timestamp: new Date("2025-03-25") },
      { id: "e8", lotId: "3", type: "HARVEST", description: "Colheita manual - 42 sacas colhidas", timestamp: new Date("2025-04-05") },
    ],
  },
]

function generateHash(events: TraceabilityEvent[], lotId: string): string {
  const data = events.map((e) => `${e.type}:${e.description}:${new Date(e.timestamp).getTime()}`).join("|")
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0")
  return `0x${hex}${lotId.padStart(4, "0")}${"a3f7b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0".slice(0, 52)}`
}

function getStatusBadge(status: CropStatus, isComplete: boolean) {
  if (isComplete) {
    return "border-green-500/30 bg-green-500/10 text-green-700"
  }
  const map: Record<CropStatus, string> = {
    "Em Crescimento": "border-amber-500/30 bg-amber-500/10 text-amber-700",
    "Plantio": "border-amber-500/30 bg-amber-500/10 text-amber-700",
    "Pronto": "border-blue-500/30 bg-blue-500/10 text-blue-700",
    "Colheita": "border-primary/30 bg-primary/10 text-primary",
  }
  return map[status]
}

export default function TraceabilityDetailsPage() {
  const params = useParams<{ lotId: string }>()
  const cultivo = useMemo(
    () => initialCultivos.find((item) => item.id === params.lotId),
    [params.lotId],
  )

  const [events, setEvents] = useState<TraceabilityEvent[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [hash, setHash] = useState<TraceabilityHash | null>(null)

  useEffect(() => {
    ;(async () => {
      if (!cultivo) return
      try {
        const ev = await lotesApi.getEventos(Number(cultivo.loteId))
        setEvents((ev || []).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp || e.date || Date.now()) })))
      } catch (err) {
        console.error("Failed to load events", err)
      }
      setIsComplete(Boolean(cultivo.isComplete))
      setHash(cultivo.traceabilityHash || null)
    })()
  }, [cultivo])

  if (!cultivo) {
    return (
      <>
        <Topbar title="Rastreabilidade" description="Cultivo nao encontrado" />
        <PageContainer>
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Cultivo nao encontrado.
            </CardContent>
          </Card>
        </PageContainer>
      </>
    )
  }

  const handleAddEvent = async (event: TraceabilityEvent) => {
    try {
      await lotesApi.postEvento(Number(cultivo.loteId), {
        loteId: Number(cultivo.loteId),
        tipoEvento: event.type,
        descricao: event.description,
      })
      setEvents((prev) => [...prev, event])
    } catch (err) {
      console.error("Failed to post event", err)
    }
  }

  const handleFinalize = async () => {
    if (events.length === 0) return
    try {
      const payload = {
        nomeLote: cultivo.lot,
        cultura: cultivo.name,
        producaoTotal: cultivo.expectedYield || 0,
        custoTotal: 0,
        precoVenda: cultivo.expectedYield || 0,
      }
      const res = await lotesApi.finalizarCultivo(Number(cultivo.loteId), payload)
      const generated: TraceabilityHash = {
        lotId: cultivo.id,
        hash: res?.hashEventos || res?.hash || generateHash(events, cultivo.id),
        generatedAt: new Date(),
        eventCount: events.length,
      }
      setIsComplete(true)
      setHash(generated)
    } catch (err) {
      console.error("Failed to finalize cultivo", err)
    }
  }

  return (
    <>
      <Topbar title="Rastreabilidade" description={`${cultivo.lot} · ${cultivo.name}`} />
      <PageContainer>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{cultivo.farm}</p>
                    <h2 className="text-xl font-semibold text-foreground">{cultivo.lot} · {cultivo.name}</h2>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusBadge(cultivo.status, isComplete)}>
                  {isComplete ? "Concluido" : "Em andamento"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Plantio: {cultivo.plantingDate}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Colheita: {cultivo.harvestDate}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {cultivo.farm}
                </div>
              </div>

              <ProgressIndicator currentStatus={cultivo.status} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-foreground">Timeline de eventos</h3>
                <TraceabilityTimeline events={events} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-foreground">Registrar evento</h3>
                <TraceabilityEventForm
                  lotId={cultivo.id}
                  onAddEvent={handleAddEvent}
                  disabled={isComplete}
                />
                <AppButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleFinalize}
                  disabled={isComplete || events.length === 0}
                >
                  Finalizar cultivo
                </AppButton>
              </CardContent>
            </Card>
          </div>

          {hash && (
            <div>
              <TraceabilityHashCard hash={hash} />
            </div>
          )}
        </div>
      </PageContainer>
    </>
  )
}
