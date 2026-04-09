"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { lotesApi } from "@/src/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { ArrowLeft, Save, DollarSign, TrendingUp, Percent, Package } from "lucide-react"
import { StatCard } from "@/src/components/stat-card"
import type { LoteFormData } from "@/src/types"

const crops = ["Milho", "Soja", "Cafe", "Trigo", "Alface", "Tomate", "Feijao", "Arroz"]

export default function NovoLotePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoteFormData>({
    name: "",
    cropId: "",
    production: 0,
    cost: 0,
    salePrice: 0,
  })

  const profitPreview = useMemo(() => {
    const revenue = formData.production * formData.salePrice
    const profit = revenue - formData.cost
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    return { revenue, profit, margin }
  }, [formData.production, formData.salePrice, formData.cost])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      try {
        await lotesApi.createLote({ nomeLote: formData.name, cultura: formData.cropId, producaoTotal: formData.production, custoTotal: formData.cost, precoVenda: formData.salePrice })
      } catch (err) {
        console.error("Failed to create lote", err)
      }
      router.push("/dashboard/lotes")
    })()
  }

  const updateField = (field: keyof LoteFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <>
      <Topbar title="Novo Lote" description="Cadastre um novo lote de producao" />
      <PageContainer>
        <div className="space-y-6">
          <Link href="/dashboard/lotes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Lotes
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Informacoes do Lote</CardTitle>
                <CardDescription>Preencha os dados reais do lote para calcular a lucratividade</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Identification */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Identificacao</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Lote *</Label>
                        <Input
                          id="name"
                          placeholder="Ex: Lote A1"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cultura *</Label>
                        <Select value={formData.cropId} onValueChange={(v) => updateField("cropId", v)}>
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
                  </div>

                  {/* Production & Financial */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Producao e Financeiro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="production">Producao Total (sacas) *</Label>
                        <Input
                          id="production"
                          type="number"
                          placeholder="Ex: 185"
                          value={formData.production || ""}
                          onChange={(e) => updateField("production", Number(e.target.value))}
                          required
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost">Custo Total (R$) *</Label>
                        <Input
                          id="cost"
                          type="number"
                          placeholder="Ex: 11500"
                          value={formData.cost || ""}
                          onChange={(e) => updateField("cost", Number(e.target.value))}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salePrice">Preco de Venda (R$/saca) *</Label>
                        <Input
                          id="salePrice"
                          type="number"
                          placeholder="Ex: 85"
                          value={formData.salePrice || ""}
                          onChange={(e) => updateField("salePrice", Number(e.target.value))}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Lote
                    </Button>
                    <Link href="/dashboard/lotes" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Live Profit Preview */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Previsao de Lucro</h3>
              <StatCard
                title="Receita"
                value={formatCurrency(profitPreview.revenue)}
                icon={<TrendingUp className="h-5 w-5 text-primary" />}
              />
              <StatCard
                title="Lucro"
                value={formatCurrency(profitPreview.profit)}
                icon={<DollarSign className="h-5 w-5 text-green-600" />}
                variant={profitPreview.profit >= 0 ? "success" : "danger"}
              />
              <StatCard
                title="Margem"
                value={`${profitPreview.margin.toFixed(1)}%`}
                icon={<Percent className="h-5 w-5 text-amber-600" />}
                variant={profitPreview.margin >= 0 ? "success" : "danger"}
              />
              <StatCard
                title="Producao"
                value={`${formData.production} sacas`}
                icon={<Package className="h-5 w-5 text-muted-foreground" />}
                description={formData.salePrice > 0 ? `a ${formatCurrency(formData.salePrice)} / saca` : undefined}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
