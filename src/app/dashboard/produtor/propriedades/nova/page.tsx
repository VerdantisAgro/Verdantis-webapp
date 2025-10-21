"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { PropertyFormData } from "@/src/types"

export default function NovaPropriedadePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    area: 0,
    location: "",
    owner: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Registering new property:", formData)
    // Here you would typically save to a database or state management
    router.push("/dashboard/produtor/propriedades")
  }

  const handleChange = (field: keyof PropertyFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/dashboard/produtor/propriedades">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h2 className="text-3xl font-bold mb-2">Nova Propriedade</h2>
        <p className="text-muted-foreground">Cadastre uma nova propriedade rural</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações da Propriedade</CardTitle>
          <CardDescription>Preencha os dados da sua propriedade rural</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Propriedade *</Label>
              <Input
                id="name"
                placeholder="Ex: Fazenda São José"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Proprietário *</Label>
              <Input
                id="owner"
                placeholder="Nome do proprietário"
                value={formData.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                placeholder="Ex: Ribeirão Preto, SP"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área Total (hectares) *</Label>
              <Input
                id="area"
                type="number"
                placeholder="Ex: 120"
                value={formData.area || ""}
                onChange={(e) => handleChange("area", Number.parseFloat(e.target.value))}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar Propriedade
              </Button>
              <Link href="/dashboard/produtor/propriedades" className="flex-1">
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
