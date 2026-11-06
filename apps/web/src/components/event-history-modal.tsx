"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { X, History, ChevronDown } from "lucide-react"
import { TraceabilityTimeline } from "@/src/components/traceability-timeline"
import type { TraceabilityEvent } from "@/src/types"

interface EventsHistoryModalProps {
  events: TraceabilityEvent[]
  cultivoName: string
  lotName: string
  isOpen: boolean
  onClose: () => void
}

export function EventsHistoryModal({ events, cultivoName, lotName, isOpen, onClose }: EventsHistoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4">
        <CardHeader className="flex flex-row items-start justify-between border-b border-border">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Historico Completo de Eventos
            </CardTitle>
            <CardDescription className="mt-1">
              {cultivoName} - {lotName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{events.length} eventos</Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {events.length > 0 ? (
            <TraceabilityTimeline events={events} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum evento registrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface EventsDropdownProps {
  events: TraceabilityEvent[]
  cultivoName: string
  lotName: string
  maxPreviewEvents?: number
}

export function EventsDropdown({ events, cultivoName, lotName, maxPreviewEvents = 10 }: EventsDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const previewEvents = events.slice(-maxPreviewEvents)
  const hasMoreEvents = events.length > maxPreviewEvents

  if (events.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Nenhum evento registrado ainda
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Ultimos eventos ({Math.min(events.length, maxPreviewEvents)} de {events.length})
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </Button>

      {isExpanded && (
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-4">
            <TraceabilityTimeline events={previewEvents} maxEvents={maxPreviewEvents} />
          </div>
          
          {hasMoreEvents && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowModal(true)}
            >
              Ver todos os {events.length} eventos
            </Button>
          )}
        </div>
      )}

      <EventsHistoryModal
        events={events}
        cultivoName={cultivoName}
        lotName={lotName}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
