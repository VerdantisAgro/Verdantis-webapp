"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { ChartCard } from "@/src/components/chart-card"
import { CropMarketCard } from "@/src/components/crop-market-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Maximize2, X, Calculator, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"
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

// crop market data fetched from API
const defaultMarket: CropMarketData[] = []

// Extended market quotations
const extendedMarketData = [
  { id: "5", name: "Arroz", price: 85.0, change: 2.3, trend: "up" as const },
  { id: "6", name: "Feijao", price: 320.0, change: -1.5, trend: "down" as const },
  { id: "7", name: "Algodao", price: 195.0, change: 0.8, trend: "up" as const },
  { id: "8", name: "Cana-de-Acucar", price: 0.95, change: 0.0, trend: "stable" as const },
  { id: "9", name: "Laranja", price: 42.0, change: 3.2, trend: "up" as const },
  { id: "10", name: "Cacau", price: 280.0, change: -2.1, trend: "down" as const },
  { id: "11", name: "Sorgo", price: 58.0, change: 1.1, trend: "up" as const },
  { id: "12", name: "Amendoim", price: 165.0, change: -0.5, trend: "down" as const },
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

// Market Quotation Row
function MarketQuotationRow({ 
  name, 
  price, 
  change, 
  trend 
}: { 
  name: string
  price: number
  change: number
  trend: "up" | "down" | "stable"
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
  const bgColor = trend === "up" ? "bg-green-500/10" : trend === "down" ? "bg-red-500/10" : "bg-muted"

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center`}>
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        </div>
        <span className="font-medium text-foreground">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-foreground">{formatCurrency(price)}/sc</span>
        <Badge 
          variant="outline" 
          className={
            trend === "up" 
              ? "border-green-500/30 bg-green-500/10 text-green-700" 
              : trend === "down"
              ? "border-red-500/30 bg-red-500/10 text-red-700"
              : "border-muted-foreground/30 bg-muted text-muted-foreground"
          }
        >
          {change >= 0 ? "+" : ""}{change}%
        </Badge>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [cropMarketData, setCropMarketData] = useState<CropMarketData[]>(defaultMarket)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await analyticsApi.getCotacoes()
        if (Array.isArray(res)) {
          setCropMarketData(res.map((r: any, i: number) => ({ id: String(i + 1), name: r.cultura || r.name, imageUrl: `/crops/${(r.cultura || r.name).toLowerCase()}.jpg`, pricePerSack: r.precoSaca || r.pricePerSack || 0, priceTrend: "stable" })))
        }
      } catch (err) {
        console.error("Failed to load cotacoes", err)
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
            <h2 className="text-sm font-semibold text-foreground mb-3">Cotacoes de Mercado - Principais Culturas</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cropMarketData.map((crop) => (
                <CropMarketCard key={crop.id} {...crop} />
              ))}
            </div>
          </div>

          {/* Extended Market Quotations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cotacoes Adicionais</CardTitle>
              <CardDescription>Precos e tendencias de outras culturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-8">
                {extendedMarketData.map((item) => (
                  <MarketQuotationRow 
                    key={item.id}
                    name={item.name}
                    price={item.price}
                    change={item.change}
                    trend={item.trend}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

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
