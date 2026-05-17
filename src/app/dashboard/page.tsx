"use client"

import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { KpiCard } from "@/src/components/kpi-card"
import { ChartCard } from "@/src/components/chart-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Sprout, Grid3x3, ArrowRight, Calendar, Leaf, Activity, Clock } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useEffect, useState } from "react"
import type { Lote as LoteType } from "@/src/types"
import { dashboardApi, lotesApi, analyticsApi } from "@/src/api"

type UILote = {
  id: string
  name: string
  crop: string
  production: number
  cost: number
  salePrice?: number
  revenue: number
  profit: number
  margin: number
  status: string
  area?: number
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
}

function mapApiLoteToUI(item: any): UILote {
  const name = item.nomeLote || item.lote || `Lote ${item.id}`
  const crop = item.cultura || item.crop || ""
  const production = item.producao || item.producaoTotal || item.producaoEstimada || 0
  const cost = item.custo || item.custoTotal || 0
  const revenue = item.receita || item.receitaTotal || 0
  const profit = item.lucroEstimado || item.lucro || item.lucroTotal || (revenue - cost)
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  return {
    id: String(item.id),
    name,
    crop,
    production,
    cost,
    salePrice: item.precoVenda || item.precoEstimado,
    revenue,
    profit,
    margin,
    status: item.status || "",
    area: item.area || item.tamanho || 0,
  }
}

const initialProfitOverTime: { month: string; lucro: number }[] = []

export default function DashboardPage() {
  const [lots, setLots] = useState<UILote[]>([])
  const [profitOverTime, setProfitOverTime] = useState<{ month: string; lucro: number }[]>(initialProfitOverTime)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [upcomingHarvests, setUpcomingHarvests] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const lotes = await lotesApi.getLotes()
        setLots((lotes || []).map(mapApiLoteToUI))

        const tendencia = await analyticsApi.getTendenciaLucro()
        if (Array.isArray(tendencia)) {
          setProfitOverTime(tendencia.map((t: any) => ({ month: t.data || t.month || t.label || "", lucro: t.lucro || t.value || 0 })))
        }

        // fetch dashboard summary (optional)
        try {
          const dash = await dashboardApi.getDashboard()
          // could use dash to set other UI pieces
        } catch (_) {
          // ignore
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      }
    })()
  }, [])

  const totalProfit = lots.reduce((sum, l) => sum + (l.profit || 0), 0)
  const totalRevenue = lots.reduce((sum, l) => sum + (l.revenue || 0), 0)
  const totalCost = lots.reduce((sum, l) => sum + (l.cost || 0), 0)
  const activeLots = lots.filter((l) => l.status === "ativo" || l.status === "Ativo").length
  const activeCultivos = 3

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const profitByLot = lots.map((l) => ({ name: l.name, lucro: l.profit, receita: l.revenue, custo: l.cost }))

  return (
    <>
      <Topbar title="Dashboard" description="Visao geral da sua producao" />
      <PageContainer>
        <div className="space-y-8">
          {/* Welcome Section */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Bem-vindo de volta, Joao!</h2>
                  <p className="text-muted-foreground">
                    Voce tem {activeLots} lotes ativos e {activeCultivos} cultivos em andamento.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/lotes/novo">
                    <Button variant="outline" size="sm">
                      <Grid3x3 className="h-4 w-4 mr-2" />
                      Novo Lote
                    </Button>
                  </Link>
                  <Link href="/dashboard/cultivos/novo">
                    <Button size="sm">
                      <Sprout className="h-4 w-4 mr-2" />
                      Novo Cultivo
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Lucro Total"
              value={formatCurrency(totalProfit)}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              variant={totalProfit >= 0 ? "success" : "danger"}
              trend={{ value: 12, label: "vs. safra anterior" }}
            />
            <KpiCard
              title="Receita Total"
              value={formatCurrency(totalRevenue)}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              trend={{ value: 8, label: "vs. safra anterior" }}
            />
            <KpiCard
              title="Custo Total"
              value={formatCurrency(totalCost)}
              icon={<TrendingDown className="h-5 w-5 text-primary" />}
              variant="warning"
              trend={{ value: -3, label: "reducao" }}
            />
            <KpiCard
              title="Lotes Ativos"
              value={String(activeLots)}
              description={`${lots.length} lotes cadastrados`}
              icon={<Grid3x3 className="h-5 w-5 text-primary" />}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Lucro por Lote" description="Comparativo de desempenho financeiro">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={profitByLot}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Bar dataKey="lucro" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Evolucao do Lucro" description="Ultimos 6 meses">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={profitOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="lucro" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ fill: "var(--chart-1)", r: 3 }} name="Lucro" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Activity and Upcoming Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Atividade Recente</CardTitle>
                  <CardDescription>Ultimas acoes na plataforma</CardDescription>
                </div>
                <Link href="/dashboard/cultivos">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver tudo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Harvests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proximas Colheitas</CardTitle>
                <CardDescription>Cultivos proximos da colheita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingHarvests.map((harvest) => (
                    <div key={harvest.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{harvest.crop}</p>
                        <p className="text-xs text-muted-foreground">{harvest.lot}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          harvest.daysRemaining <= 30
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                            : "border-muted-foreground/30 bg-muted text-muted-foreground"
                        }
                      >
                        {harvest.daysRemaining}d
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/cultivos" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos os cultivos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acoes Rapidas</CardTitle>
              <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/lotes">
                  <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                    <Grid3x3 className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Gerenciar Lotes</p>
                  </div>
                </Link>
                <Link href="/dashboard/cultivos">
                  <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                    <Sprout className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Ver Cultivos</p>
                  </div>
                </Link>
                <Link href="/dashboard/analytics">
                  <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Analytics</p>
                  </div>
                </Link>
                <Link href="/dashboard/simulacao">
                  <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                    <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Simulacoes</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}
