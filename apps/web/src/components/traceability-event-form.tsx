"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { Plus } from "lucide-react"
import type { TraceabilityEvent, TraceabilityEventType } from "@/src/types"

const eventTypes: { value: TraceabilityEventType; label: string }[] = [
  { value: "INPUT_ADDITION", label: "Adicao de Insumo" },
  { value: "IRRIGATION", label: "Irrigacao" },
  { value: "FERTILIZATION", label: "Adubacao/Fertilizacao" },
  { value: "PEST_CONTROL", label: "Controle de Pragas" },
  { value: "SOIL_PREPARATION", label: "Preparo do Solo" },
  { value: "PRUNING", label: "Poda" },
  { value: "INSPECTION", label: "Inspecao de Qualidade" },
  { value: "HARVEST", label: "Colheita" },
  { value: "OTHER", label: "Outro Evento" },
]

interface TraceabilityEventFormProps {
  lotId: string
  onAddEvent: (event: TraceabilityEvent) => void
  disabled?: boolean
}

export function TraceabilityEventForm({ lotId, onAddEvent, disabled = false }: TraceabilityEventFormProps) {
  const [type, setType] = useState<TraceabilityEventType>("INPUT_ADDITION")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      setError("A descricao e obrigatoria")
      return
    }
    
    if (description.trim().length < 10) {
      setError("A descricao deve ter pelo menos 10 caracteres")
      return
    }

    const event: TraceabilityEvent = {
      id: crypto.randomUUID(),
      lotId,
      type,
      description: description.trim(),
      timestamp: new Date(),
    }

    onAddEvent(event)
    setDescription("")
    setType("INPUT_ADDITION")
    setError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Categoria do Evento *</Label>
        <Select value={type} onValueChange={(v) => setType(v as TraceabilityEventType)} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((et) => (
              <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-description">Descricao *</Label>
        <Textarea
          id="event-description"
          placeholder="Descreva detalhadamente o evento de cultivo..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            if (error) setError("")
          }}
          rows={3}
          disabled={disabled}
          className={error ? "border-red-500" : ""}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-muted-foreground">Campo obrigatorio - minimo 10 caracteres</p>
      </div>

      <Button type="submit" size="sm" disabled={disabled || !description.trim()} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Registrar Evento
      </Button>
    </form>
  )
}
