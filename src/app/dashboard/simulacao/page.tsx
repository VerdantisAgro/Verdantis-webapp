"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import { 
  Calculator, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Target,
  Scale,
  Trophy,
  ArrowRight,
  Plus,
  X,
  CheckCircle2
} from "lucide-react"
import type { SimulationLot } from "@/src/types"

import { lotesApi } from "@/src/api"

const existingLotsInitial: { id: string; name: string; crop: string; area: number }[] = []

const crops = ["Milho", "Soja", "Cafe", "Trigo", "Arroz", "Feijao", "Algodao", "Alface"]

interface ScenarioData {
  id: string
  name: string
  useExistingLot: boolean
  existingLotId: string
  tempLotName: string
  tempLotCrop: string
  tempLotArea: number
  estimatedYield: number
  estimatedPrice: number
  laborCost: number
  inputCost: number
  otherCosts: number
}

interface CalculatedResult {
  totalProduction: number
  totalRevenue: number
  totalCost: number
  profit: number
  margin: number
  roi: number
  breakEvenPrice: number
  breakEvenYield: number
  lot: SimulationLot
}

const createEmptyScenario = (id: string, name: string): ScenarioData => ({
  id,
  name,
  useExistingLot: true,
  existingLotId: "",
  tempLotName: "",
  tempLotCrop: "",
  tempLotArea: 0,
  estimatedYield: 0,
  estimatedPrice: 0,
  laborCost: 0,
  inputCost: 0,
  otherCosts: 0,
})

function calculateResult(scenario: ScenarioData): CalculatedResult | null {
  let lot: SimulationLot

  if (scenario.useExistingLot) {
    const existingLot = existingLots.find(l => l.id === scenario.existingLotId)
    if (!existingLot) return null
    lot = {
      id: existingLot.id,
      name: existingLot.name,
      isTemporary: false,
      area: existingLot.area,
      crop: existingLot.crop,
    }
  } else {
    if (!scenario.tempLotArea || !scenario.tempLotCrop) return null
    lot = {
      id: scenario.id,
      name: scenario.tempLotName || "Lote Temporario",
      isTemporary: true,
      area: scenario.tempLotArea,
      crop: scenario.tempLotCrop,
    }
  }

  if (scenario.estimatedYield <= 0 || scenario.estimatedPrice <= 0) return null

  const totalProduction = scenario.estimatedYield * lot.area
  const totalRevenue = totalProduction * scenario.estimatedPrice
  const totalCost = scenario.laborCost + scenario.inputCost + scenario.otherCosts
  const profit = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0
  const breakEvenPrice = totalProduction > 0 ? totalCost / totalProduction : 0
  const breakEvenYield = scenario.estimatedPrice > 0 && lot.area > 0 
    ? totalCost / (scenario.estimatedPrice * lot.area) 
    : 0

  return {
    totalProduction,
    totalRevenue,
    totalCost,
    profit,
    margin,
    roi,
    breakEvenPrice,
    breakEvenYield,
    lot,
  }
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Editable Scenario Card
function ScenarioCard({ 
  scenario, 
  onChange, 
  onRemove,
  canRemove = true,
  existingLots
}: { 
  scenario: ScenarioData
  onChange: (data: ScenarioData) => void
  onRemove: () => void
  canRemove?: boolean
  existingLots: { id: string; name: string; crop: string; area: number }[]
}) {
  const selectedExistingLot = existingLots.find(l => l.id === scenario.existingLotId)
  const showProductionParams = scenario.useExistingLot 
    ? !!selectedExistingLot 
    : (scenario.tempLotArea > 0 && !!scenario.tempLotCrop)

  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Input
              value={scenario.name}
              onChange={(e) => onChange({ ...scenario, name: e.target.value })}
              className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
              placeholder="Nome do cenario"
            />
          </div>
          {canRemove && (
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Lot Selection */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`use-existing-${scenario.id}`}
              checked={scenario.useExistingLot}
              onCheckedChange={(checked) => onChange({ 
                ...scenario, 
                useExistingLot: checked as boolean,
                existingLotId: "",
                tempLotName: "",
                tempLotCrop: "",
                tempLotArea: 0
              })}
            />
            <Label htmlFor={`use-existing-${scenario.id}`} className="text-sm cursor-pointer">
              Usar lote existente
            </Label>
          </div>

          {scenario.useExistingLot ? (
            <Select 
              value={scenario.existingLotId} 
              onValueChange={(v) => onChange({ ...scenario, existingLotId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um lote" />
              </SelectTrigger>
              <SelectContent>
                {existingLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name} - {lot.crop} ({lot.area} ha)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground">Lote temporario (simulacao)</p>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Nome"
                  value={scenario.tempLotName}
                  onChange={(e) => onChange({ ...scenario, tempLotName: e.target.value })}
                />
                <Select 
                  value={scenario.tempLotCrop} 
                  onValueChange={(v) => onChange({ ...scenario, tempLotCrop: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Area (ha)"
                  value={scenario.tempLotArea || ""}
                  onChange={(e) => onChange({ ...scenario, tempLotArea: Number(e.target.value) })}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Production Parameters */}
        {showProductionParams && (
          <div className="space-y-4 pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Produtividade (sc/ha)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 85"
                  value={scenario.estimatedYield || ""}
                  onChange={(e) => onChange({ ...scenario, estimatedYield: Number(e.target.value) })}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Preco (R$/sc)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 85.00"
                  value={scenario.estimatedPrice || ""}
                  onChange={(e) => onChange({ ...scenario, estimatedPrice: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Custos de Producao</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Mao de Obra</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scenario.laborCost || ""}
                    onChange={(e) => onChange({ ...scenario, laborCost: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Insumos</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scenario.inputCost || ""}
                    onChange={(e) => onChange({ ...scenario, inputCost: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Outros</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scenario.otherCosts || ""}
                    onChange={(e) => onChange({ ...scenario, otherCosts: Number(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Comparison Result Panel
function ComparisonPanel({ scenarios, results }: { scenarios: ScenarioData[], results: (CalculatedResult | null)[] }) {
  const validResults = results.filter((r): r is CalculatedResult => r !== null)
  
  if (validResults.length < 2) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Preencha pelo menos 2 cenarios para comparar resultados
          </p>
        </CardContent>
      </Card>
    )
  }

  // Find the most viable scenario
  const sortedByProfit = [...validResults].sort((a, b) => b.profit - a.profit)
  const bestScenario = sortedByProfit[0]
  const bestScenarioData = scenarios.find((s, i) => results[i] === bestScenario)

  // Find worst for comparison
  const worstScenario = sortedByProfit[sortedByProfit.length - 1]

  return (
    <div className="space-y-6">
      {/* Winner Indicator */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Cenario mais viavel</p>
              <p className="text-xl font-bold text-foreground">{bestScenarioData?.name || "Cenario"}</p>
              <p className="text-sm text-green-600 mt-1">
                {bestScenario.lot.name} - {bestScenario.lot.crop}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(bestScenario.profit)}</p>
              <p className="text-sm text-muted-foreground">lucro projetado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Comparacao de Cenarios
          </CardTitle>
          <CardDescription>Metricas financeiras lado a lado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Metrica</th>
                  {scenarios.map((s, i) => results[i] && (
                    <th key={s.id} className="text-right py-3 px-3 font-medium text-muted-foreground">
                      {s.name}
                      {results[i] === bestScenario && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-2" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">Lote / Cultura</td>
                  {results.map((r, i) => r && (
                    <td key={i} className="py-3 px-3 text-right text-foreground">
                      {r.lot.name} / {r.lot.crop}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">Area</td>
                  {results.map((r, i) => r && (
                    <td key={i} className="py-3 px-3 text-right text-foreground">{r.lot.area} ha</td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">Producao Total</td>
                  {results.map((r, i) => r && (
                    <td key={i} className="py-3 px-3 text-right text-foreground">{r.totalProduction.toFixed(0)} sc</td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">Custo Total</td>
                  {results.map((r, i) => r && (
                    <td key={i} className={`py-3 px-3 text-right font-medium ${r.totalCost === Math.min(...validResults.map(v => v.totalCost)) ? "text-green-600" : "text-foreground"}`}>
                      {formatCurrency(r.totalCost)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">Receita Total</td>
                  {results.map((r, i) => r && (
                    <td key={i} className={`py-3 px-3 text-right font-medium ${r.totalRevenue === Math.max(...validResults.map(v => v.totalRevenue)) ? "text-green-600" : "text-foreground"}`}>
                      {formatCurrency(r.totalRevenue)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50 bg-muted/50">
                  <td className="py-3 px-3 font-semibold text-foreground">Lucro</td>
                  {results.map((r, i) => r && (
                    <td key={i} className={`py-3 px-3 text-right font-bold ${r.profit >= 0 ? (r === bestScenario ? "text-green-600" : "text-foreground") : "text-red-600"}`}>
                      {formatCurrency(r.profit)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">Margem</td>
                  {results.map((r, i) => r && (
                    <td key={i} className={`py-3 px-3 text-right font-medium ${r.margin === Math.max(...validResults.map(v => v.margin)) ? "text-green-600" : "text-foreground"}`}>
                      {r.margin.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">ROI</td>
                  {results.map((r, i) => r && (
                    <td key={i} className={`py-3 px-3 text-right font-medium ${r.roi === Math.max(...validResults.map(v => v.roi)) ? "text-green-600" : "text-foreground"}`}>
                      {r.roi.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground">Preco de Equilibrio</td>
                  {results.map((r, i) => r && (
                    <td key={i} className="py-3 px-3 text-right text-foreground">
                      {formatCurrency(r.breakEvenPrice)}/sc
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 text-foreground">Produtividade Min.</td>
                  {results.map((r, i) => r && (
                    <td key={i} className="py-3 px-3 text-right text-foreground">
                      {r.breakEvenYield.toFixed(1)} sc/ha
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Decision Summary */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Analise de Decisao
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Por que {bestScenarioData?.name} e mais viavel?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {bestScenario.totalCost < worstScenario.totalCost && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Menor custo de producao
                  </li>
                )}
                {bestScenario.margin > worstScenario.margin && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Melhor margem de lucro
                  </li>
                )}
                {bestScenario.roi > worstScenario.roi && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Maior retorno sobre investimento
                  </li>
                )}
                {bestScenario.profit > worstScenario.profit && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Maior lucro absoluto
                  </li>
                )}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Metricas-chave</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diferenca de lucro:</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(bestScenario.profit - worstScenario.profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diferenca de margem:</span>
                  <span className="font-medium text-green-600">
                    +{(bestScenario.margin - worstScenario.margin).toFixed(1)} p.p.
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diferenca de ROI:</span>
                  <span className="font-medium text-green-600">
                    +{(bestScenario.roi - worstScenario.roi).toFixed(1)} p.p.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SimulacaoPage() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([
    createEmptyScenario("1", "Cenario 1"),
    createEmptyScenario("2", "Cenario 2"),
  ])
  const [existingLots, setExistingLots] = useState(existingLotsInitial)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await lotesApi.getLotes()
        if (Array.isArray(res)) {
          setExistingLots(res.map((r: any) => ({ id: String(r.id), name: r.nomeLote || r.lote || `Lote ${r.id}`, crop: r.cultura || r.crop || "", area: r.area || r.tamanho || 0 })))
        }
      } catch (err) {
        console.error("Failed to load existing lots", err)
      }
    })()
  }, [])

  const results = useMemo(() => scenarios.map(calculateResult), [scenarios])

  const handleScenarioChange = useCallback((id: string, data: ScenarioData) => {
    setScenarios(prev => prev.map(s => s.id === id ? data : s))
  }, [])

  const handleRemoveScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleAddScenario = useCallback(() => {
    const newId = crypto.randomUUID()
    setScenarios(prev => [...prev, createEmptyScenario(newId, `Cenario ${prev.length + 1}`)])
  }, [])

  return (
    <>
      <Topbar title="Simulacoes" description="Compare cenarios e tome decisoes informadas" />
      <PageContainer>
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Comparador de Cenarios</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie multiplos cenarios, compare metricas lado a lado e identifique a opcao mais viavel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Creation Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Cenarios</h2>
              <Button onClick={handleAddScenario} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cenario
              </Button>
            </div>

            {/* Side-by-Side Scenario Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onChange={(data) => handleScenarioChange(scenario.id, data)}
                  onRemove={() => handleRemoveScenario(scenario.id)}
                  canRemove={scenarios.length > 2}
                  existingLots={existingLots}
                />
              ))}
            </div>
          </div>

          {/* Comparison Result Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Resultado da Comparacao</h2>
            <ComparisonPanel scenarios={scenarios} results={results} />
          </div>
        </div>
      </PageContainer>
    </>
  )
}
