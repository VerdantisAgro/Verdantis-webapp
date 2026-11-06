"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { ArrowLeft, Save, Info } from "lucide-react"

import { useEffect } from "react"
import { lotesApi } from "@/src/api"

// Lots data (populated from API)
const lotsInitial: { id: string; name: string; area: number }[] = []

const crops = ["Milho", "Soja", "Alface", "Tomate", "Feijao", "Trigo", "Arroz", "Cafe"]

interface CultivoFormData {
  name: string
  loteId: string
  variety: string
  plantingDate: string
  harvestDate: string
  area: number
  expectedYield: number
  notes?: string
}

export default function NovoCultivoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CultivoFormData>({
    name: "",
    loteId: "",
    variety: "",
    plantingDate: "",
    harvestDate: "",
    area: 0,
    expectedYield: 0,
    notes: "",
  })

  const [lots, setLots] = useState(lotsInitial)
  const selectedLot = lots.find((l) => l.id === formData.loteId)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await lotesApi.getLotes()
        if (Array.isArray(res)) setLots(res.map((r: any) => ({ id: String(r.id), name: r.nomeLote || r.lote || `Lote ${r.id}`, area: r.area || 0 })))
      } catch (err) {
        console.error("Failed to load lots for novo cultivo", err)
      }
    })()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard/cultivos")
  }

  return (
    <TooltipProvider>
      <Topbar title="Novo Cultivo" description="Cadastre um novo cultivo em seu lote" />
      <PageContainer>
        <div className="space-y-6">
          <Link href="/dashboard/cultivos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Cultivos
            </Button>
          </Link>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Informacoes do Cultivo</CardTitle>
              <CardDescription>Preencha os dados do cultivo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Lot Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lote *</Label>
                    <Select 
                      value={formData.loteId} 
                      onValueChange={(v) => {
                        const lot = lots.find(l => l.id === v)
                        setFormData({ ...formData, loteId: v, area: lot?.area || 0 })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o lote" />
                      </SelectTrigger>
                      <SelectContent>
                        {lots.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name} ({l.area} ha)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cultura *</Label>
                    <Select 
                      value={formData.name} 
                      onValueChange={(v) => setFormData({ ...formData, name: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cultura" />
                      </SelectTrigger>
                      <SelectContent>
                        {crops.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Variation with Info Tooltip */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="variety">Variedade *</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex">
                          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                          <span className="sr-only">Informacao sobre variedade</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium mb-2">O que e variedade?</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Variedade refere-se a especie ou tipo especifico da cultura sendo plantada.
                        </p>
                        <p className="text-sm font-medium">Exemplos:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          <li>Feijao carioca</li>
                          <li>Feijao verde</li>
                          <li>Feijao de corda</li>
                          <li>Milho AG 8088 PRO3</li>
                          <li>Soja M 6210 IPRO</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input 
                    id="variety" 
                    placeholder="Ex: Feijao carioca, Milho AG 8088 PRO3" 
                    value={formData.variety} 
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })} 
                    required 
                  />
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plantingDate">Data de Plantio *</Label>
                    <Input 
                      id="plantingDate" 
                      type="date" 
                      value={formData.plantingDate} 
                      onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harvestDate">Previsao de Colheita *</Label>
                    <Input 
                      id="harvestDate" 
                      type="date" 
                      value={formData.harvestDate} 
                      onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                {/* Area and Yield */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area Cultivada (hectares)</Label>
                    <Input 
                      id="area" 
                      type="number" 
                      placeholder="Ex: 25" 
                      value={formData.area || ""} 
                      onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })} 
                      min="0" 
                      step="0.01"
                      disabled={!!selectedLot}
                    />
                    {selectedLot && (
                      <p className="text-xs text-muted-foreground">
                        Area do lote selecionado: {selectedLot.area} ha
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedYield">Produtividade Esperada (sc/ha) *</Label>
                    <Input 
                      id="expectedYield" 
                      type="number" 
                      placeholder="Ex: 180" 
                      value={formData.expectedYield || ""} 
                      onChange={(e) => setFormData({ ...formData, expectedYield: Number(e.target.value) })} 
                      required 
                      min="0" 
                      step="0.1" 
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Observacoes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Adicione observacoes sobre o cultivo..." 
                    value={formData.notes} 
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                    rows={3} 
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Cultivo
                  </Button>
                  <Link href="/dashboard/cultivos" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </TooltipProvider>
  )
}
