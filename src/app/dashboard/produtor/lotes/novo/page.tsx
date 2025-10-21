"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { LoteFormData } from "@/src/types"

export default function NovoLotePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoteFormData>({
    name: "",
    propertyId: "",
    area: 0,
    soilType: "",
    irrigationSystem: false,
  })

  const properties = [
    { id: "1", name: "Fazenda São José" },
    { id: "2", name: "Fazenda Boa Vista" },
    { id: "3", name: "Fazenda Verde" },
  ]

  const soilTypes = ["Argiloso", "Arenoso", "Humoso", "Calcário", "Siltoso"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Registering new lote:", formData)
    router.push("/dashboard/produtor/lotes")
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/dashboard/produtor/lotes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h2 className="text-3xl font-bold mb-2">Novo Lote</h2>
        <p className="text-muted-foreground">Cadastre um novo lote em sua propriedade</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Lote</CardTitle>
          <CardDescription>Preencha os dados do lote de cultivo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="property">Propriedade *</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
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
              <Label htmlFor="name">Nome do Lote *</Label>
              <Input
                id="name"
                placeholder="Ex: Lote A1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área (hectares) *</Label>
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
              <Label htmlFor="soilType">Tipo de Solo *</Label>
              <Select
                value={formData.soilType}
                onValueChange={(value) => setFormData({ ...formData, soilType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de solo" />
                </SelectTrigger>
                <SelectContent>
                  {soilTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="irrigation"
                checked={formData.irrigationSystem}
                onCheckedChange={(checked) => setFormData({ ...formData, irrigationSystem: checked as boolean })}
              />
              <Label htmlFor="irrigation" className="cursor-pointer">
                Possui sistema de irrigação
              </Label>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar Lote
              </Button>
              <Link href="/dashboard/produtor/lotes" className="flex-1">
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
