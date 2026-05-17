"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { ChartCard } from "@/src/components/chart-card"
import { CropMarketCard } from "@/src/components/crop-market-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Maximize2, X, Calculator, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { CropMarketData } from "@/src/types"
import { analyticsApi } from "@/src/api"
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

const profitComparison = [
  { name: "Lote A1", lucro: 4225, custo: 11500, receita: 15725 },
  { name: "Lote B2", lucro: 10400, custo: 8800, receita: 19200 },
  { name: "Lote C3", lucro: -2700, custo: 16200, receita: 13500 },
  { name: "Lote D4", lucro: 1900, custo: 7200, receita: 9100 },
  { name: "Lote E5", lucro: 6350, custo: 9800, receita: 16150 },
  { name: "Lote F6", lucro: -560, custo: 3200, receita: 2640 },
]

const profitByCrop = [
  { cultura: "Milho", lucro: 10575 },
  { cultura: "Soja", lucro: 10400 },
  { cultura: "Trigo", lucro: 1900 },
  { cultura: "Cafe", lucro: -2700 },
  { cultura: "Alface", lucro: -560 },
]

const costVsRevenue = [
  { name: "Lote A1", custo: 11500, receita: 15725 },
  { name: "Lote B2", custo: 8800, receita: 19200 },
  { name: "Lote C3", custo: 16200, receita: 13500 },
  { name: "Lote D4", custo: 7200, receita: 9100 },
  { name: "Lote E5", custo: 9800, receita: 16150 },
  { name: "Lote F6", custo: 3200, receita: 2640 },
]

const profitTrends = [
  { month: "Jan", lucro: 2800, receita: 8500, custo: 5700 },
  { month: "Fev", lucro: 3200, receita: 9200, custo: 6000 },
  { month: "Mar", lucro: 1500, receita: 7800, custo: 6300 },
  { month: "Abr", lucro: 4100, receita: 11000, custo: 6900 },
  { month: "Mai", lucro: 3800, receita: 10500, custo: 6700 },
  { month: "Jun", lucro: 5200, receita: 12800, custo: 7600 },
  { month: "Jul", lucro: 4800, receita: 12000, custo: 7200 },
  { month: "Ago", lucro: 6100, receita: 14500, custo: 8400 },
  { month: "Set", lucro: 5400, receita: 13200, custo: 7800 },
  { month: "Out", lucro: 7200, receita: 16000, custo: 8800 },
  { month: "Nov", lucro: 6800, receita: 15500, custo: 8700 },
  { month: "Dez", lucro: 8500, receita: 18200, custo: 9700 },
]

const productivityByArea = [
  { area: "0-10 ha", produtividade: 145 },
  { area: "10-25 ha", produtividade: 168 },
  { area: "25-50 ha", produtividade: 182 },
  { area: "50-100 ha", produtividade: 195 },
  { area: ">100 ha", produtividade: 210 },
]

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

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
        // keep static data on API failure
      }
    })()
  }, [])

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
              <p className="text-xs text-muted-foreground">Faixas de preco de referencia · 2025</p>
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

          {/* Productivity by Area */}
          <ExpandableChartCard 
            title="Produtividade por Tamanho de Area" 
            description="Media de produtividade (sc/ha) por faixa de tamanho de lote"
            expandedContent={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityByArea}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} />
                  <Tooltip formatter={(value: number) => `${value} sc/ha`} contentStyle={tooltipStyle} />
                  <Bar dataKey="produtividade" name="Produtividade" radius={[4, 4, 0, 0]} fill="var(--chart-4)" />
                </BarChart>
              </ResponsiveContainer>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productivityByArea}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value} sc/ha`} contentStyle={tooltipStyle} />
                <Bar dataKey="produtividade" name="Produtividade" radius={[4, 4, 0, 0]} fill="var(--chart-4)" />
              </BarChart>
            </ResponsiveContainer>
          </ExpandableChartCard>
        </div>
      </PageContainer>
    </>
  )
}
