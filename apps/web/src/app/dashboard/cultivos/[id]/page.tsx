"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { lotesApi, getErrorMessage } from "@/src/api"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { ProgressIndicator } from "@/src/components/progress-indicator"
import { TraceabilityTimeline } from "@/src/components/traceability-timeline"
import { TraceabilityEventForm } from "@/src/components/traceability-event-form"
import { TraceabilityHashCard } from "@/src/components/traceability-hash-card"
import { AppButton } from "@/src/components/app-button"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Calendar, Leaf } from "lucide-react"
import { fetchCultivoEvents, hashFromFinalize, loteToCultivo } from "@/src/lib/cultivos"
import { mapApiLote } from "@/src/lib/lotes"
import type { Cultivo, TraceabilityEvent } from "@/src/types"

export default function TraceabilityDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [cultivo, setCultivo] = useState<Cultivo | null>(null)
  const [events, setEvents] = useState<TraceabilityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(false)

  const loadEvents = useCallback(async () => {
    setEvents(await fetchCultivoEvents(id))
  }, [id])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const raw = await lotesApi.getLoteById(Number(id))
        setCultivo(loteToCultivo(raw))
        await loadEvents()
      } catch (err) {
        toast.error(getErrorMessage(err, "Nao foi possivel carregar o cultivo."))
      } finally {
        setLoading(false)
      }
    })()
  }, [id, loadEvents])

  if (loading) {
    return (
      <>
        <Topbar title="Rastreabilidade" description="Carregando..." />
        <PageContainer>
          <div className="h-40 rounded-lg bg-muted animate-pulse" />
        </PageContainer>
      </>
    )
  }

  if (!cultivo) {
    return (
      <>
        <Topbar title="Rastreabilidade" description="Cultivo nao encontrado" />
        <PageContainer>
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground space-y-4">
              <p>Cultivo nao encontrado.</p>
              <Link href="/dashboard/cultivos">
                <Button>Voltar para Cultivos</Button>
              </Link>
            </CardContent>
          </Card>
        </PageContainer>
      </>
    )
  }

  const isComplete = Boolean(cultivo.isComplete)

  const handleAddEvent = async (event: TraceabilityEvent) => {
    try {
      await lotesApi.postEvento(Number(id), {
        loteId: Number(id),
        tipoEvento: event.type,
        descricao: event.description,
      })
      await loadEvents()
      toast.success("Evento registrado.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Nao foi possivel registrar o evento."))
    }
  }

  const handleFinalize = async () => {
    if (events.length === 0) return
    setFinalizing(true)
    try {
      const lote = mapApiLote(await lotesApi.getLoteById(Number(id)))
      const res = await lotesApi.finalizarCultivo(Number(id), {
        nomeLote: lote.name,
        cultura: lote.crop,
        producaoTotal: lote.production,
        custoTotal: lote.cost,
        precoVenda: lote.salePrice,
      })
      setCultivo({
        ...cultivo,
        isComplete: true,
        status: "Colheita",
        traceabilityHash: hashFromFinalize(res, id, events.length),
      })
      toast.success("Cultivo finalizado.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Nao foi possivel finalizar o cultivo."))
    } finally {
      setFinalizing(false)
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
                    <p className="text-sm text-muted-foreground">{cultivo.variety || "Variedade nao informada"}</p>
                    <h2 className="text-xl font-semibold text-foreground">{cultivo.lot} · {cultivo.name}</h2>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    isComplete
                      ? "border-green-500/30 bg-green-500/10 text-green-700"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  }
                >
                  {isComplete ? "Concluido" : "Em andamento"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Plantio: {cultivo.plantingDate || "—"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Colheita: {cultivo.harvestDate || "—"}
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
                <TraceabilityEventForm lotId={cultivo.id} onAddEvent={handleAddEvent} disabled={isComplete} />
                <AppButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleFinalize}
                  disabled={isComplete || events.length === 0 || finalizing}
                >
                  {finalizing ? "Finalizando..." : "Finalizar cultivo"}
                </AppButton>
              </CardContent>
            </Card>
          </div>

          {cultivo.traceabilityHash && (
            <TraceabilityHashCard hash={{ ...cultivo.traceabilityHash, eventCount: events.length }} />
          )}
        </div>
      </PageContainer>
    </>
  )
}
