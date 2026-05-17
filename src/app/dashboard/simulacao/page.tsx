"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import {
  Calculator,
  Plus,
  X,
  CheckCircle2,
  Trophy,
  Scale,
  Target,
  TrendingUp,
} from "lucide-react"
import type { SimulationLot } from "@/src/types"
import { simulacoesApi, lotesApi } from "@/src/api"
import { cn } from "@/src/lib/utils"

const crops = ["Milho", "Soja", "Cafe", "Trigo", "Arroz", "Feijao", "Algodao", "Alface"]

type ExistingLot = {
  id: string
  name: string
  crop: string
  area: number
}

interface ScenarioData {
  id: string
  name: string
  useExistingLot: boolean
  existingLotId: string
  lotArea: number
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
  lotArea: 0,
  tempLotName: "",
  tempLotCrop: "",
  tempLotArea: 0,
  estimatedYield: 0,
  estimatedPrice: 0,
  laborCost: 0,
  inputCost: 0,
  otherCosts: 0,
})

function calculateResult(
  scenario: ScenarioData,
  existingLots: ExistingLot[]
): CalculatedResult | null {
  let lot: SimulationLot
  let area: number

  if (scenario.useExistingLot) {
    const existingLot = existingLots.find((l) => l.id === scenario.existingLotId)
    if (!existingLot) return null
    area = scenario.lotArea > 0 ? scenario.lotArea : existingLot.area
    if (area <= 0) return null
    lot = {
      id: existingLot.id,
      name: existingLot.name,
      isTemporary: false,
      area,
      crop: existingLot.crop,
    }
  } else {
    area = scenario.tempLotArea
    if (!area || !scenario.tempLotCrop) return null
    lot = {
      id: scenario.id,
      name: scenario.tempLotName || "Lote Temporario",
      isTemporary: true,
      area,
      crop: scenario.tempLotCrop,
    }
  }

  if (scenario.estimatedYield <= 0 || scenario.estimatedPrice <= 0) return null

  const totalProduction = scenario.estimatedYield * area
  const totalRevenue = totalProduction * scenario.estimatedPrice
  const totalCost = scenario.laborCost + scenario.inputCost + scenario.otherCosts
  const profit = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0
  const breakEvenPrice = totalProduction > 0 ? totalCost / totalProduction : 0
  const breakEvenYield =
    scenario.estimatedPrice > 0 && area > 0 ? totalCost / (scenario.estimatedPrice * area) : 0

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

// ─── Scenario Card ────────────────────────────────────────────────────────────

function ScenarioCard({
  scenario,
  onChange,
  onRemove,
  canRemove,
  existingLots,
}: {
  scenario: ScenarioData
  onChange: (data: ScenarioData) => void
  onRemove: () => void
  canRemove: boolean
  existingLots: ExistingLot[]
}) {
  const selectedExistingLot = existingLots.find((l) => l.id === scenario.existingLotId)
  const showAreaOverride = scenario.useExistingLot && !!selectedExistingLot
  const showProductionParams = scenario.useExistingLot
    ? !!selectedExistingLot && (scenario.lotArea > 0 || selectedExistingLot.area > 0)
    : scenario.tempLotArea > 0 && !!scenario.tempLotCrop

  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <Input
            value={scenario.name}
            onChange={(e) => onChange({ ...scenario, name: e.target.value })}
            className="text-base font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
            placeholder="Nome do cenario"
          />
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Lot selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`use-existing-${scenario.id}`}
              checked={scenario.useExistingLot}
              onCheckedChange={(checked) =>
                onChange({
                  ...scenario,
                  useExistingLot: checked as boolean,
                  existingLotId: "",
                  lotArea: 0,
                  tempLotName: "",
                  tempLotCrop: "",
                  tempLotArea: 0,
                })
              }
            />
            <Label htmlFor={`use-existing-${scenario.id}`} className="text-sm cursor-pointer">
              Usar lote existente
            </Label>
          </div>

          {scenario.useExistingLot ? (
            <div className="space-y-3">
              <Select
                value={scenario.existingLotId}
                onValueChange={(v) => onChange({ ...scenario, existingLotId: v, lotArea: 0 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lote" />
                </SelectTrigger>
                <SelectContent>
                  {existingLots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.name} — {lot.crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {showAreaOverride && (
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Area do lote (ha)
                    {selectedExistingLot?.area > 0 && (
                      <span className="ml-1 text-muted-foreground">
                        — cadastrado: {selectedExistingLot.area} ha
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    value={scenario.lotArea || ""}
                    onChange={(e) => onChange({ ...scenario, lotArea: Number(e.target.value) })}
                    min="0"
                    step="0.1"
                  />
                </div>
              )}
            </div>
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
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
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

        {/* Production parameters */}
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

            <div className="space-y-2">
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

            {/* Live preview */}
            {scenario.estimatedYield > 0 && scenario.estimatedPrice > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                <p className="text-xs font-medium text-primary">Previsao rapida</p>
                {(() => {
                  const area = scenario.useExistingLot
                    ? scenario.lotArea > 0
                      ? scenario.lotArea
                      : (existingLots.find((l) => l.id === scenario.existingLotId)?.area ?? 0)
                    : scenario.tempLotArea
                  const prod = scenario.estimatedYield * area
                  const rev = prod * scenario.estimatedPrice
                  const cost = scenario.laborCost + scenario.inputCost + scenario.otherCosts
                  const profit = rev - cost
                  return (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Producao:</span>
                      <span className="font-medium text-foreground text-right">{prod.toFixed(0)} sc</span>
                      <span className="text-muted-foreground">Receita:</span>
                      <span className="font-medium text-foreground text-right">{formatCurrency(rev)}</span>
                      <span className="text-muted-foreground">Lucro:</span>
                      <span
                        className={cn(
                          "font-semibold text-right",
                          profit >= 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {formatCurrency(profit)}
                      </span>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Comparison Panel ─────────────────────────────────────────────────────────

function ComparisonPanel({
  scenarios,
  results,
}: {
  scenarios: ScenarioData[]
  results: (CalculatedResult | null)[]
}) {
  const validResults = results.filter((r): r is CalculatedResult => r !== null)

  if (validResults.length < 2) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">
            Comparacao indisponivel
          </p>
          <p className="text-xs text-muted-foreground">
            Preencha pelo menos 2 cenarios completos para comparar resultados
          </p>
        </CardContent>
      </Card>
    )
  }

  const sortedByProfit = [...validResults].sort((a, b) => b.profit - a.profit)
  const bestResult = sortedByProfit[0]
  const worstResult = sortedByProfit[sortedByProfit.length - 1]
  const bestScenarioData = scenarios.find((_, i) => results[i] === bestResult)

  return (
    <div className="space-y-6">
      {/* Winner */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="py-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Trophy className="h-7 w-7 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Cenario mais viavel</p>
              <p className="text-xl font-bold text-foreground truncate">
                {bestScenarioData?.name || "Cenario"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {bestResult.lot.name} — {bestResult.lot.crop} · {bestResult.lot.area} ha
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(bestResult.profit)}
              </p>
              <p className="text-xs text-muted-foreground">lucro projetado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side table */}
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
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                    Metrica
                  </th>
                  {scenarios.map((s, i) =>
                    results[i] ? (
                      <th key={s.id} className="text-right py-3 px-3 font-medium text-muted-foreground">
                        <span className="flex items-center justify-end gap-1">
                          {s.name}
                          {results[i] === bestResult && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </span>
                      </th>
                    ) : null
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Lote / Cultura",
                    render: (r: CalculatedResult) => `${r.lot.name} / ${r.lot.crop}`,
                    highlight: false,
                  },
                  {
                    label: "Area",
                    render: (r: CalculatedResult) => `${r.lot.area} ha`,
                    highlight: false,
                  },
                  {
                    label: "Producao Total",
                    render: (r: CalculatedResult) => `${r.totalProduction.toFixed(0)} sc`,
                    highlight: false,
                  },
                  {
                    label: "Custo Total",
                    render: (r: CalculatedResult) => formatCurrency(r.totalCost),
                    best: (vals: number[]) => Math.min(...vals),
                    vals: validResults.map((r) => r.totalCost),
                    highlight: true,
                  },
                  {
                    label: "Receita Total",
                    render: (r: CalculatedResult) => formatCurrency(r.totalRevenue),
                    best: (vals: number[]) => Math.max(...vals),
                    vals: validResults.map((r) => r.totalRevenue),
                    highlight: true,
                  },
                  {
                    label: "Margem",
                    render: (r: CalculatedResult) => `${r.margin.toFixed(1)}%`,
                    best: (vals: number[]) => Math.max(...vals),
                    vals: validResults.map((r) => r.margin),
                    highlight: true,
                  },
                  {
                    label: "ROI",
                    render: (r: CalculatedResult) => `${r.roi.toFixed(1)}%`,
                    best: (vals: number[]) => Math.max(...vals),
                    vals: validResults.map((r) => r.roi),
                    highlight: true,
                  },
                  {
                    label: "Preco de Equilibrio",
                    render: (r: CalculatedResult) => `${formatCurrency(r.breakEvenPrice)}/sc`,
                    highlight: false,
                  },
                  {
                    label: "Produtividade Min.",
                    render: (r: CalculatedResult) => `${r.breakEvenYield.toFixed(1)} sc/ha`,
                    highlight: false,
                  },
                ].map((row, rowIdx) => {
                  const isBoldRow = row.label === "Lucro"
                  return (
                    <tr
                      key={rowIdx}
                      className={cn(
                        "border-b border-border/50 last:border-0",
                        isBoldRow && "bg-muted/50"
                      )}
                    >
                      <td className="py-3 px-3 text-foreground font-medium">{row.label}</td>
                      {results.map((r, i) =>
                        r ? (
                          <td
                            key={i}
                            className={cn(
                              "py-3 px-3 text-right",
                              row.highlight && row.vals && row.best
                                ? r === validResults[validResults.indexOf(r)] &&
                                  (() => {
                                    const bestVal = row.best(row.vals!)
                                    const myVal = row.vals![validResults.indexOf(r)]
                                    return myVal === bestVal
                                  })()
                                  ? "text-green-600 font-medium"
                                  : "text-foreground"
                                : "text-foreground"
                            )}
                          >
                            {row.render(r)}
                          </td>
                        ) : null
                      )}
                    </tr>
                  )
                })}
                {/* Lucro row */}
                <tr className="border-b border-border/50 bg-muted/50">
                  <td className="py-3 px-3 font-semibold text-foreground">Lucro</td>
                  {results.map((r, i) =>
                    r ? (
                      <td
                        key={i}
                        className={cn(
                          "py-3 px-3 text-right font-bold",
                          r.profit < 0
                            ? "text-red-600"
                            : r === bestResult
                            ? "text-green-600"
                            : "text-foreground"
                        )}
                      >
                        {formatCurrency(r.profit)}
                      </td>
                    ) : null
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Decision summary */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Analise de Decisao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-sm font-semibold text-foreground mb-3">
                Por que &quot;{bestScenarioData?.name}&quot; e mais viavel?
              </p>
              <ul className="space-y-1.5">
                {bestResult.totalCost < worstResult.totalCost && (
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    Menor custo de producao
                  </li>
                )}
                {bestResult.margin > worstResult.margin && (
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    Melhor margem de lucro
                  </li>
                )}
                {bestResult.roi > worstResult.roi && (
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    Maior retorno sobre investimento (ROI)
                  </li>
                )}
                {bestResult.profit > worstResult.profit && (
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    Maior lucro absoluto
                  </li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-sm font-semibold text-foreground mb-3">Diferencas-chave</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diferenca de lucro</span>
                  <span
                    className={cn(
                      "font-medium",
                      bestResult.profit - worstResult.profit >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {bestResult.profit - worstResult.profit >= 0 ? "+" : ""}
                    {formatCurrency(bestResult.profit - worstResult.profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diferenca de margem</span>
                  <span className="font-medium text-green-600">
                    +{(bestResult.margin - worstResult.margin).toFixed(1)} p.p.
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diferenca de ROI</span>
                  <span className="font-medium text-green-600">
                    +{(bestResult.roi - worstResult.roi).toFixed(1)} p.p.
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SimulacaoPage() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([
    createEmptyScenario("1", "Cenario 1"),
    createEmptyScenario("2", "Cenario 2"),
  ])
  const [existingLots, setExistingLots] = useState<ExistingLot[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await simulacoesApi.getLotesExistentes()
        if (Array.isArray(res) && res.length > 0) {
          setExistingLots(
            res.map((r: any) => ({
              id: String(r.id),
              name: r.nomeLote || r.lote || `Lote ${r.id}`,
              crop: r.cultura || "",
              area: 0,
            }))
          )
          return
        }
      } catch {
        // fallback to getLotes
      }
      try {
        const res = await lotesApi.getLotes()
        if (Array.isArray(res)) {
          setExistingLots(
            res.map((r: any) => ({
              id: String(r.id),
              name: r.nomeLote || r.lote || `Lote ${r.id}`,
              crop: r.cultura || "",
              area: 0,
            }))
          )
        }
      } catch (err) {
        console.error("Failed to load lots for simulation", err)
      }
    })()
  }, [])

  const results = useMemo(
    () => scenarios.map((s) => calculateResult(s, existingLots)),
    [scenarios, existingLots]
  )

  const handleScenarioChange = useCallback((id: string, data: ScenarioData) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? data : s)))
  }, [])

  const handleRemoveScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleAddScenario = useCallback(() => {
    const newId = crypto.randomUUID()
    setScenarios((prev) => [
      ...prev,
      createEmptyScenario(newId, `Cenario ${prev.length + 1}`),
    ])
  }, [])

  return (
    <>
      <Topbar title="Simulacoes" description="Compare cenarios e tome decisoes informadas" />
      <PageContainer>
        <div className="space-y-8">
          {/* Intro */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Comparador de Cenarios</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie cenarios com lotes reais ou temporarios, informe produtividade e custos,
                    e veja qual opcao e mais viavel.
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {results.filter(Boolean).length}/{scenarios.length} prontos
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Cenarios</h2>
              <Button onClick={handleAddScenario} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cenario
              </Button>
            </div>

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

          {/* Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Resultado da Comparacao</h2>
            <ComparisonPanel scenarios={scenarios} results={results} />
          </div>
        </div>
      </PageContainer>
    </>
  )
}
