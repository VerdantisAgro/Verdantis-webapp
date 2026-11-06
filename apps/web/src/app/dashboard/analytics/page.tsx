"use client"

import { useState, useEffect, useMemo } from "react"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { ChartCard } from "@/src/components/chart-card"
import { CropMarketCard } from "@/src/components/crop-market-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Maximize2, X, Calculator, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { CropMarketData } from "@/src/types"
import { toast } from "sonner"
import { analyticsApi, lotesApi, getErrorMessage } from "@/src/api"
import { formatCurrency } from "@/src/lib/format"
import { mapApiLote, type UILote } from "@/src/lib/lotes"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

const STATIC_CROPS: CropMarketData[] = [
  {
    id: "1",
    name: "Milho",
    imageUrl: "/milho.png",
    pricePerSack: 64,
    priceMin: 58,
    priceMax: 70,
    unit: "saca 60 kg",
    priceTrend: "stable",
  },
  {
    id: "2",
    name: "Soja",
    imageUrl: "/soja.png",
    pricePerSack: 135,
    priceMin: 125,
    priceMax: 145,
    unit: "saca 60 kg",
    priceTrend: "up",
  },
  {
    id: "3",
    name: "Trigo",
    imageUrl: "/trigo.png",
    pricePerSack: 85,
    priceMin: 75,
    priceMax: 95,
    unit: "saca 60 kg",
    priceTrend: "stable",
  },
  {
    id: "4",
    name: "Cafe Arabica",
    imageUrl: "/cafe.png",
    pricePerSack: 2150,
    priceMin: 1900,
    priceMax: 2400,
    unit: "saca 60 kg · min. oficial R$ 793",
    priceTrend: "up",
  },
  {
    id: "5",
    name: "Tomate",
    imageUrl: "/tomate.png",
    pricePerSack: 125,
    priceMin: 80,
    priceMax: 170,
    unit: "caixa 20 kg",
    priceTrend: "down",
  },
  {
    id: "6",
    name: "Feijao",
    imageUrl: "/feijao.png",
    pricePerSack: 250,
    priceMin: 180,
    priceMax: 320,
    unit: "saca 60 kg",
    priceTrend: "up",
  },
  {
    id: "7",
    name: "Alface",
    imageUrl: "/alface.png",
    pricePerSack: 42,
    priceMin: 25,
    priceMax: 60,
    unit: "caixa (unidades)",
    priceTrend: "stable",
  },
  {
    id: "8",
    name: "Arroz",
    imageUrl: "/arroz.png",
    pricePerSack: 72,
    priceMin: 60,
    priceMax: 85,
    unit: "saca 50 kg",
    priceTrend: "stable",
  },
]

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
}

// Expandable Chart Modal
function ChartModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children 
}: { 
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-5xl">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="h-[500px]">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Chart Card with expand option
function ExpandableChartCard({ 
  title, 
  description, 
  children,
  expandedContent
}: { 
  title: string
  description?: string
  children: React.ReactNode
  expandedContent?: React.ReactNode
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsExpanded(true)}
            className="h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Expandir grafico</span>
          </Button>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      <ChartModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title={title}
        description={description}
      >
        {expandedContent || children}
      </ChartModal>
    </>
  )
}

export default function AnalyticsPage() {
  const [cropMarketData, setCropMarketData] = useState<CropMarketData[]>(STATIC_CROPS)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await analyticsApi.getCotacoes()
        if (Array.isArray(res) && res.length > 0) {
          setCropMarketData((prev) =>
            prev.map((crop) => {
              const apiMatch = res.find(
                (r: any) =>
                  (r.cultura || r.name || "").toLowerCase() === crop.name.toLowerCase()
              )
              if (apiMatch) {
                return { ...crop, pricePerSack: apiMatch.precoSaca ?? crop.pricePerSack }
              }
              return crop
            })
          )
        }
      } catch {
        // keep reference prices when quotes are unavailable
      }
    })()
  }, [])

  const [lots, setLots] = useState<UILote[]>([])
  const [profitTrends, setProfitTrends] = useState<{ month: string; lucro: number; receita?: number; custo?: number }[]>([])

  useEffect(() => {
    ;(async () => {
      const [lotesRes, tendenciaRes] = await Promise.allSettled([
        lotesApi.getLotes(),
        analyticsApi.getTendenciaLucro(),
      ])
      if (lotesRes.status === "fulfilled") {
        setLots((lotesRes.value || []).map(mapApiLote))
      } else {
        toast.error(getErrorMessage(lotesRes.reason, "Nao foi possivel carregar os lotes."))
      }
      if (tendenciaRes.status === "fulfilled" && Array.isArray(tendenciaRes.value)) {
        setProfitTrends(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tendenciaRes.value.map((t: any) => ({
            month: t.mes || t.month || t.label || "",
            lucro: t.lucro ?? 0,
            receita: t.receita,
            custo: t.custo,
          })),
        )
      }
    })()
  }, [])

  const profitComparison = useMemo(
    () => lots.map((l) => ({ name: l.name, lucro: l.profit, custo: l.cost, receita: l.revenue })),
    [lots],
  )
  const costVsRevenue = profitComparison

  const profitByCrop = useMemo(() => {
    const totals = new Map<string, number>()
    lots.forEach((l) => totals.set(l.crop || "Sem cultura", (totals.get(l.crop || "Sem cultura") ?? 0) + l.profit))
    return Array.from(totals, ([cultura, lucro]) => ({ cultura, lucro })).sort((a, b) => b.lucro - a.lucro)
  }, [lots])

  return (
    <>
      <Topbar title="Analytics" description="Comparativos, insights e cotacoes de mercado" />
      <PageContainer>
        <div className="space-y-6">
          {/* Simulation CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Simulador de Cenarios</h3>
                    <p className="text-sm text-muted-foreground">
                      Projete diferentes cenarios e compare resultados para tomar decisoes mais assertivas
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/simulacao">
                  <Button>
                    <Calculator className="h-4 w-4 mr-2" />
                    Executar Simulacao
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Crop Market Cards */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Cotacoes de Mercado</h2>
              <p className="text-xs text-muted-foreground">Faixas de preco de referencia</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cropMarketData.map((crop) => (
                <CropMarketCard key={crop.id} {...crop} />
              ))}
            </div>
          </div>

          {/* Row 1: Profit comparison + Profit by crop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpandableChartCard 
              title="Comparativo de Lucro entre Lotes" 
              description="Lucro liquido de cada lote"
              expandedContent={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitComparison}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="lucro" name="Lucro" radius={[4, 4, 0, 0]} fill="var(--chart-1)" />
                    <Bar dataKey="receita" name="Receita" radius={[4, 4, 0, 0]} fill="var(--chart-2)" />
                    <Bar dataKey="custo" name="Custo" radius={[4, 4, 0, 0]} fill="var(--chart-5)" />
                  </BarChart>
                </ResponsiveContainer>
              }
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={profitComparison}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Bar dataKey="lucro" name="Lucro" radius={[4, 4, 0, 0]} fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </ExpandableChartCard>

            <ExpandableChartCard 
              title="Lucro por Cultura" 
              description="Performance de lucratividade por tipo de cultura"
              expandedContent={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitByCrop} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <YAxis dataKey="cultura" type="category" width={80} tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                    <Bar dataKey="lucro" name="Lucro" radius={[0, 4, 4, 0]} fill="var(--chart-2)" />
                  </BarChart>
                </ResponsiveContainer>
              }
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={profitByCrop} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis dataKey="cultura" type="category" width={60} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Bar dataKey="lucro" name="Lucro" radius={[0, 4, 4, 0]} fill="var(--chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </ExpandableChartCard>
          </div>

          {/* Row 2: Cost vs Revenue + Profit Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpandableChartCard 
              title="Custo vs Receita" 
              description="Comparativo financeiro por lote"
              expandedContent={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costVsRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="custo" name="Custo" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="receita" name="Receita" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              }
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={costVsRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="custo" name="Custo" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="receita" name="Receita" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ExpandableChartCard>

            <ExpandableChartCard 
              title="Tendencia de Lucro" 
              description="Evolucao do lucro mensal ao longo do ano"
              expandedContent={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="receita" name="Receita" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="custo" name="Custo" stroke="var(--chart-5)" fill="var(--chart-5)" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="lucro" name="Lucro" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              }
            >
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={profitTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="lucro" name="Lucro" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ fill: "var(--chart-1)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ExpandableChartCard>
          </div>

        </div>
      </PageContainer>
    </>
  )
}
