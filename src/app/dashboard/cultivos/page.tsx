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
import { toast } from "sonner"
import { lotesApi, getErrorMessage } from "@/src/api"
import { EventsDropdown } from "@/src/components/event-history-modal"
import { fetchCultivoEvents, hashFromFinalize, loteToCultivo } from "@/src/lib/cultivos"
import { mapApiLote } from "@/src/lib/lotes"
import { getSessionUser } from "@/src/lib/session"
import type { Cultivo, CropStatus, TraceabilityEvent } from "@/src/types"

function getStatusColor(status: CropStatus) {
  const map: Record<CropStatus, string> = {
    "Em Crescimento": "border-green-500/30 bg-green-500/10 text-green-700",
    "Plantio": "border-amber-500/30 bg-amber-500/10 text-amber-700",
    "Pronto": "border-blue-500/30 bg-blue-500/10 text-blue-700",
    "Colheita": "border-primary/30 bg-primary/10 text-primary",
  }
  return map[status]
}

interface CropLotCardProps {
  cultivo: Cultivo
  onAddEvent: (cultivoId: string, event: TraceabilityEvent) => void
  onFinalize: (cultivoId: string) => void
  farmerName: string
}

function CropLotCard({ cultivo, onAddEvent, onFinalize, farmerName }: CropLotCardProps) {
  const [expanded, setExpanded] = useState(false)
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
                  farmerName={farmerName}
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
  const [cultivos, setCultivos] = useState<Cultivo[]>([])
  const [loading, setLoading] = useState(true)
  const [farmerName, setFarmerName] = useState("")

  useEffect(() => {
    setFarmerName(getSessionUser().name ?? "")
  }, [])

  const updateCultivo = useCallback((id: string, patch: Partial<Cultivo>) => {
    setCultivos((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await lotesApi.getLotes()
        const mapped = (res || []).map((l) => loteToCultivo(l))
        setCultivos(mapped)

        await Promise.all(
          mapped.map(async (c) => {
            try {
              updateCultivo(c.id, { events: await fetchCultivoEvents(c.loteId) })
            } catch {
              // a lote without events should not block the others
            }
          }),
        )
      } catch (err) {
        toast.error(getErrorMessage(err, "Nao foi possivel carregar os cultivos."))
      } finally {
        setLoading(false)
      }
    })()
  }, [updateCultivo])

  const handleAddEvent = useCallback(
    async (cultivoId: string, event: TraceabilityEvent) => {
      try {
        await lotesApi.postEvento(Number(cultivoId), {
          loteId: Number(cultivoId),
          tipoEvento: event.type,
          descricao: event.description,
        })
        updateCultivo(cultivoId, { events: await fetchCultivoEvents(cultivoId) })
        toast.success("Evento registrado.")
      } catch (err) {
        toast.error(getErrorMessage(err, "Nao foi possivel registrar o evento."))
      }
    },
    [updateCultivo],
  )

  const handleFinalize = useCallback(
    async (cultivoId: string) => {
      const cultivo = cultivos.find((c) => c.id === cultivoId)
      if (!cultivo || cultivo.isComplete) return
      try {
        const lote = mapApiLote(await lotesApi.getLoteById(Number(cultivoId)))
        const res = await lotesApi.finalizarCultivo(Number(cultivoId), {
          nomeLote: lote.name,
          cultura: lote.crop,
          producaoTotal: lote.production,
          custoTotal: lote.cost,
          precoVenda: lote.salePrice,
        })
        updateCultivo(cultivoId, {
          isComplete: true,
          status: "Colheita",
          traceabilityHash: hashFromFinalize(res, cultivoId, (cultivo.events || []).length),
        })
        toast.success("Cultivo finalizado.")
      } catch (err) {
        toast.error(getErrorMessage(err, "Nao foi possivel finalizar o cultivo."))
      }
    },
    [cultivos, updateCultivo],
  )

  return (
    <>
      <Topbar title="Cultivos" description="Acompanhe cultivos e gerencie rastreabilidade" />
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Carregando..." : `${cultivos.length} cultivos`}
            </p>
            <Link href="/dashboard/cultivos/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cultivo
              </Button>
            </Link>
          </div>

          {!loading && cultivos.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Leaf className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Nenhum cultivo ainda</p>
                <p className="text-xs text-muted-foreground">Crie um lote para comecar a registrar eventos</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {cultivos.map((cultivo) => (
              <CropLotCard
                key={cultivo.id}
                cultivo={cultivo}
                onAddEvent={handleAddEvent}
                onFinalize={handleFinalize}
                farmerName={farmerName}
              />
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}
