"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { CultivoFormData } from "@/src/types"

export default function NovoCultivoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CultivoFormData>({
    name: "",
    loteId: "",
    propertyId: "",
    variety: "",
    plantingDate: "",
    harvestDate: "",
    area: 0,
    expectedYield: 0,
    notes: "",
  })

  const properties = [
    {
      id: "1",
      name: "Fazenda São José",
      lotes: [
        { id: "1", name: "Lote A1" },
        { id: "4", name: "Lote A3" },
      ],
    },
    {
      id: "2",
      name: "Fazenda Boa Vista",
      lotes: [
        { id: "2", name: "Lote B1" },
        { id: "5", name: "Lote B2" },
      ],
    },
    { id: "3", name: "Fazenda Verde", lotes: [{ id: "3", name: "Lote C2" }] },
  ]

  const crops = ["Milho", "Soja", "Alface", "Tomate", "Feijão", "Trigo", "Arroz", "Café"]

  const selectedProperty = properties.find((p) => p.id === formData.propertyId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Registering new cultivo:", formData)
    router.push("/dashboard/produtor/cultivos")
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/dashboard/produtor/cultivos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h2 className="text-3xl font-bold mb-2">Novo Cultivo</h2>
        <p className="text-muted-foreground">Cadastre um novo cultivo em seu lote</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Cultivo</CardTitle>
          <CardDescription>Preencha os dados do cultivo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property">Propriedade *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => setFormData({ ...formData, propertyId: value, loteId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lote">Lote *</Label>
                <Select
                  value={formData.loteId}
                  onValueChange={(value) => setFormData({ ...formData, loteId: value })}
                  disabled={!formData.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o lote" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProperty?.lotes.map((lote) => (
                      <SelectItem key={lote.id} value={lote.id}>
                        {lote.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Cultura *</Label>
                <Select value={formData.name} onValueChange={(value) => setFormData({ ...formData, name: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Variedade *</Label>
                <Input
                  id="variety"
                  placeholder="Ex: AG 8088 PRO3"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                <Label htmlFor="harvestDate">Previsão de Colheita *</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="area">Área Cultivada (hectares) *</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="Ex: 25"
                  value={formData.area || ""}
                  onChange={(e) => setFormData({ ...formData, area: Number.parseFloat(e.target.value) })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedYield">Produtividade Esperada (sc/ha) *</Label>
                <Input
                  id="expectedYield"
                  type="number"
                  placeholder="Ex: 180"
                  value={formData.expectedYield || ""}
                  onChange={(e) => setFormData({ ...formData, expectedYield: Number.parseFloat(e.target.value) })}
                  required
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre o cultivo..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar Cultivo
              </Button>
              <Link href="/dashboard/produtor/cultivos" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
