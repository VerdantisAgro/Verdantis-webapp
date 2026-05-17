"use client"

import { useState, useCallback, useEffect } from "react"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Leaf, Plus, Calendar, MapPin, TrendingUp, ChevronDown, ChevronUp, History } from "lucide-react"
import Link from "next/link"
import { ProgressIndicator } from "@/src/components/progress-indicator"
import { TraceabilityTimeline } from "@/src/components/traceability-timeline"
import { TraceabilityEventForm } from "@/src/components/traceability-event-form"
import { TraceabilityHashPanel } from "@/src/components/traceability-hash-panel"
import { CultivationExport } from "@/src/components/cultivation-export"
import { lotesApi } from "@/src/api"
import { EventsDropdown, EventsHistoryModal } from "@/src/components/event-history-modal"
import type { Cultivo, CropStatus, TraceabilityEvent, TraceabilityHash } from "@/src/types"

const initialCultivos: Cultivo[] = []

function getStatusColor(status: CropStatus) {
  const map: Record<CropStatus, string> = {
    "Em Crescimento": "border-green-500/30 bg-green-500/10 text-green-700",
    "Plantio": "border-amber-500/30 bg-amber-500/10 text-amber-700",
    "Pronto": "border-blue-500/30 bg-blue-500/10 text-blue-700",
    "Colheita": "border-primary/30 bg-primary/10 text-primary",
  }
  return map[status]
}

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

interface CropLotCardProps {
  cultivo: Cultivo
  onAddEvent: (cultivoId: string, event: TraceabilityEvent) => void
  onFinalize: (cultivoId: string) => void
}

function CropLotCard({ cultivo, onAddEvent, onFinalize }: CropLotCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showFullHistory, setShowFullHistory] = useState(false)
  const events = cultivo.events || []
  const isComplete = cultivo.isComplete || false

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{cultivo.name} - {cultivo.lot}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Variedade: {cultivo.variety}</p>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(cultivo.status)}>{cultivo.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Plantio
            </p>
            <p className="font-medium text-foreground text-sm">{cultivo.plantingDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Colheita
            </p>
            <p className="font-medium text-foreground text-sm">{cultivo.harvestDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Area</p>
            <p className="font-medium text-foreground text-sm">{cultivo.area} ha</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Produtividade
            </p>
            <p className="font-medium text-foreground text-sm">{cultivo.expectedYield} sc/ha</p>
          </div>
        </div>

    
        {/* Events Dropdown Preview */}
        <div className="space-y-3">
          <EventsDropdown 
            events={events} 
            cultivoName={cultivo.name} 
            lotName={cultivo.lot}
            maxPreviewEvents={10}
          />
        </div>

        {/* Expand/Collapse Traceability Management */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Ocultar Gerenciamento
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Gerenciar Rastreabilidade
            </>
          )}
        </Button>

        {expanded && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event form */}
              <div className="space-y-4">
                {!isComplete && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Registrar Novo Evento</h4>
                    <TraceabilityEventForm
                      lotId={cultivo.id}
                      onAddEvent={(event) => onAddEvent(cultivo.id, event)}
                      disabled={isComplete}
                    />
                  </div>
                )}

                {/* Hash panel */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Hash de Rastreabilidade</h4>
                  <TraceabilityHashPanel
                    hash={cultivo.traceabilityHash || null}
                    onGenerate={() => onFinalize(cultivo.id)}
                    canGenerate={events.length > 0 && !isComplete}
                  />
                </div>
              </div>

              {/* Finish Cultivation Export */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Finalizar Cultivo</h4>
                <CultivationExport 
                  cultivo={cultivo}
                  farmerName="Joao Paulo"
                  onFinish={() => onFinalize(cultivo.id)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function CultivosPage() {
  const [cultivos, setCultivos] = useState<Cultivo[]>(initialCultivos)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await lotesApi.getLotes()
        // map lote items to Cultivo-ish objects
        const mapped: Cultivo[] = (res || []).map((l: any) => ({
          id: String(l.id),
          name: l.cultura || l.crop || "",
          lot: l.nomeLote || l.lote || `Lote ${l.id}`,
          loteId: String(l.id),
          status: l.status || "Em Crescimento",
          plantingDate: l.plantingDate || "",
          harvestDate: l.harvestDate || "",
          area: l.area || 0,
          daysUntilHarvest: 0,
          progress: 0,
          irrigation: true,
          weather: true,
          variety: l.variety || "",
          expectedYield: l.producaoEstimada || l.producao || 0,
          isComplete: Boolean(l.isComplete),
          traceabilityHash: l.traceabilityHash ? { lotId: String(l.id), hash: l.hash || l.traceabilityHash.hash, generatedAt: l.traceabilityHash.generatedAt ? new Date(l.traceabilityHash.generatedAt) : new Date(), eventCount: l.traceabilityHash.eventCount || 0 } : undefined,
          events: [],
        }))
        setCultivos(mapped)

        // load events for each lote
        await Promise.all(mapped.map(async (c) => {
          try {
            const ev = await lotesApi.getEventos(Number(c.loteId))
            setCultivos((prev) => prev.map((p) => p.id === c.id ? { ...p, events: ev || [] } : p))
          } catch (e) {
            // ignore per-lote
          }
        }))
      } catch (err) {
        console.error("Failed to load cultivos", err)
      }
    })()
  }, [])

  const handleAddEvent = useCallback(async (cultivoId: string, event: TraceabilityEvent) => {
    try {
      await lotesApi.postEvento(Number(cultivoId), {
        loteId: Number(cultivoId),
        tipoEvento: event.type,
        descricao: event.description,
      })
      // optimistic update
      setCultivos((prev) => prev.map((c) => c.id === cultivoId ? { ...c, events: [...(c.events || []), event] } : c))
    } catch (err) {
      console.error("Failed to post event", err)
    }
  }, [])

  const handleFinalize = useCallback(async (cultivoId: string) => {
    const cultivo = cultivos.find((c) => c.id === cultivoId)
    if (!cultivo) return
    try {
      const payload = {
        nomeLote: cultivo.lot,
        cultura: cultivo.name,
        producaoTotal: cultivo.expectedYield || 0,
        custoTotal: 0,
        precoVenda: cultivo.expectedYield || 0,
      }
      const res = await lotesApi.finalizarCultivo(Number(cultivoId), payload)
      // res expected to have hashEventos, qrCode, arquivoPdf, arquivoTxt
      const hashObj = res ? { lotId: cultivoId, hash: res.hashEventos || res.hash || "", generatedAt: new Date(), eventCount: (cultivo.events || []).length } : undefined
      setCultivos((prev) => prev.map((c) => c.id === cultivoId ? { ...c, isComplete: true, traceabilityHash: hashObj as any, status: "Colheita" } : c))
    } catch (err) {
      console.error("Failed to finalize cultivo", err)
    }
  }, [cultivos])

  return (
    <>
      <Topbar title="Cultivos" description="Acompanhe cultivos e gerencie rastreabilidade" />
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{cultivos.length} cultivos ativos</p>
            <Link href="/dashboard/cultivos/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cultivo
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {cultivos.map((cultivo) => (
              <CropLotCard
                key={cultivo.id}
                cultivo={cultivo}
                onAddEvent={handleAddEvent}
                onFinalize={handleFinalize}
              />
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}
