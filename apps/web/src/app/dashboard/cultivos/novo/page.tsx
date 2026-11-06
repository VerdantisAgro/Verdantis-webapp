"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { ArrowLeft, Save, Info } from "lucide-react"
import { lotesApi, getErrorMessage, type Lote } from "@/src/api"
import { CROPS } from "@/src/lib/lotes"

interface CultivoFormData {
  loteId: string
  crop: string
  variety: string
  plantingDate: string
  harvestDate: string
  area: number
}

const EMPTY_FORM: CultivoFormData = {
  loteId: "",
  crop: "",
  variety: "",
  plantingDate: "",
  harvestDate: "",
  area: 0,
}

// A cultivo is the planting data of an active lote: crop, variety, dates and area.
export default function NovoCultivoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CultivoFormData>(EMPTY_FORM)
  const [lots, setLots] = useState<Lote[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const lotes = await lotesApi.getLotes()
        setLots(lotes.filter((l) => l.status === "ativo"))
      } catch (err) {
        toast.error(getErrorMessage(err, "Nao foi possivel carregar os lotes."))
      }
    })()
  }, [])

  const selectLot = (id: string) => {
    const lot = lots.find((l) => String(l.id) === id)
    if (!lot) return
    setFormData({
      loteId: id,
      crop: lot.cultura,
      variety: lot.variedade,
      plantingDate: lot.dataPlantio ?? "",
      harvestDate: lot.previsaoColheita ?? "",
      area: lot.areaHectares,
    })
  }

  const update = <K extends keyof CultivoFormData>(field: K, value: CultivoFormData[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const lot = lots.find((l) => String(l.id) === formData.loteId)
    if (!lot) {
      toast.error("Selecione o lote.")
      return
    }
    setSaving(true)
    try {
      await lotesApi.updateLote(lot.id, {
        ...lotesApi.toLoteInput(lot),
        cultura: formData.crop,
        variedade: formData.variety,
        areaHectares: formData.area,
        dataPlantio: formData.plantingDate || null,
        previsaoColheita: formData.harvestDate || null,
      })
      toast.success("Cultivo salvo.")
      router.push(`/dashboard/cultivos/${lot.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Nao foi possivel salvar o cultivo."))
      setSaving(false)
    }
  }

  return (
    <TooltipProvider>
      <Topbar title="Novo Cultivo" description="Registre o plantio de um lote" />
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
              <CardDescription>Escolha um lote ativo e informe os dados do plantio</CardDescription>
            </CardHeader>
            <CardContent>
              {lots.length === 0 ? (
                <div className="py-8 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">Nenhum lote ativo. Crie um lote primeiro.</p>
                  <Link href="/dashboard/lotes/novo">
                    <Button>Criar Lote</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lote *</Label>
                      <Select value={formData.loteId} onValueChange={selectLot}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o lote" />
                        </SelectTrigger>
                        <SelectContent>
                          {lots.map((l) => (
                            <SelectItem key={l.id} value={String(l.id)}>
                              {l.nomeLote}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cultura *</Label>
                      <Select value={formData.crop} onValueChange={(v) => update("crop", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cultura" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set([...CROPS, formData.crop].filter(Boolean))).map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="variety">Variedade</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex">
                            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                            <span className="sr-only">Informacao sobre variedade</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">
                            Tipo especifico da cultura plantada, por exemplo Feijao carioca, Milho AG 8088 PRO3 ou
                            Soja M 6210 IPRO.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="variety"
                      placeholder="Ex: Milho AG 8088 PRO3"
                      value={formData.variety}
                      onChange={(e) => update("variety", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plantingDate">Data de Plantio *</Label>
                      <Input
                        id="plantingDate"
                        type="date"
                        value={formData.plantingDate}
                        onChange={(e) => update("plantingDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="harvestDate">Previsao de Colheita</Label>
                      <Input
                        id="harvestDate"
                        type="date"
                        min={formData.plantingDate || undefined}
                        value={formData.harvestDate}
                        onChange={(e) => update("harvestDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area (hectares)</Label>
                      <Input
                        id="area"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex: 25"
                        value={formData.area || ""}
                        onChange={(e) => update("area", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={saving || !formData.loteId || !formData.crop}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Cultivo"}
                    </Button>
                    <Link href="/dashboard/cultivos" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </TooltipProvider>
  )
}
