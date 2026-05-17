"use client"

import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { KpiCard } from "@/src/components/kpi-card"
import { ChartCard } from "@/src/components/chart-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sprout,
  Grid3x3,
  ArrowRight,
  Activity,
  Plus,
  Leaf,
  Pencil,
} from "lucide-react"
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
import { lotesApi, analyticsApi } from "@/src/api"
import { cn } from "@/src/lib/utils"

type UILote = {
  id: string
  name: string
  crop: string
  production: number
  cost: number
  revenue: number
  profit: number
  margin: number
  status: string
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
}

const STATUS_CLASSES: Record<string, string> = {
  Ativo: "border-green-500/30 bg-green-500/10 text-green-700",
  Finalizado: "border-muted-foreground/30 bg-muted text-muted-foreground",
  "Em Preparo": "border-amber-500/30 bg-amber-500/10 text-amber-700",
}

const STATUS_NORMALIZE: Record<string, string> = {
  ativo: "Ativo",
  finalizado: "Finalizado",
  "em preparo": "Em Preparo",
  em_preparo: "Em Preparo",
}

function normalizeStatus(status: string): string {
  return STATUS_NORMALIZE[status.toLowerCase()] ?? status
}

function mapApiLote(item: any): UILote {
  const production = item.producao ?? item.producaoTotal ?? 0
  const cost = item.custo ?? item.custoTotal ?? 0
  const salePrice = item.precoVenda ?? 0
  const revenue = item.receita ?? production * salePrice
  const profit = item.lucroEstimado ?? item.lucro ?? revenue - cost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  return {
    id: String(item.id),
    name: item.nomeLote || item.lote || `Lote ${item.id}`,
    crop: item.cultura || "",
    production,
    cost,
    revenue,
    profit,
    margin,
    status: item.status ? normalizeStatus(item.status) : "",
  }
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function DashboardPage() {
  const [lots, setLots] = useState<UILote[]>([])
  const [profitOverTime, setProfitOverTime] = useState<{ month: string; lucro: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Produtor")

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) setUserName(name)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [lotesRes, tendenciaRes] = await Promise.allSettled([
          lotesApi.getLotes(),
          analyticsApi.getTendenciaLucro(),
        ])

        if (lotesRes.status === "fulfilled") {
          setLots((lotesRes.value || []).map(mapApiLote))
        }

        if (tendenciaRes.status === "fulfilled" && Array.isArray(tendenciaRes.value)) {
          setProfitOverTime(
            tendenciaRes.value.map((t: any) => ({
              month: t.cultura || t.data || t.month || t.label || "",
              lucro: t.tendenciaLucro || t.lucro || t.value || 0,
            }))
          )
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const totalProfit = lots.reduce((sum, l) => sum + l.profit, 0)
  const totalRevenue = lots.reduce((sum, l) => sum + l.revenue, 0)
  const totalCost = lots.reduce((sum, l) => sum + l.cost, 0)
  const activeLots = lots.filter((l) => l.status === "Ativo").length

  const profitByLot = lots.map((l) => ({
    name: l.name,
    lucro: l.profit,
    receita: l.revenue,
    custo: l.cost,
  }))

  const topLots = [...lots].sort((a, b) => b.profit - a.profit).slice(0, 5)

  const statusSummary = lots.reduce<Record<string, number>>((acc, l) => {
    const s = l.status || "Sem status"
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <Topbar title="Dashboard" description="Visao geral da sua producao" />
      <PageContainer>
        <div className="space-y-8">
          {/* Welcome */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Bem-vindo, {userName}!
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {loading
                      ? "Carregando dados..."
                      : `Voce tem ${activeLots} lote${activeLots !== 1 ? "s" : ""} ativo${activeLots !== 1 ? "s" : ""} de ${lots.length} cadastrado${lots.length !== 1 ? "s" : ""}.`}
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
              value={loading ? "—" : formatCurrency(totalProfit)}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              variant={totalProfit >= 0 ? "success" : "danger"}
            />
            <KpiCard
              title="Receita Total"
              value={loading ? "—" : formatCurrency(totalRevenue)}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
            />
            <KpiCard
              title="Custo Total"
              value={loading ? "—" : formatCurrency(totalCost)}
              icon={<TrendingDown className="h-5 w-5 text-primary" />}
              variant="warning"
            />
            <KpiCard
              title="Lotes Ativos"
              value={loading ? "—" : String(activeLots)}
              description={loading ? undefined : `${lots.length} cadastrado${lots.length !== 1 ? "s" : ""}`}
              icon={<Grid3x3 className="h-5 w-5 text-primary" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Lucro por Lote" description="Comparativo de desempenho financeiro">
              {profitByLot.length === 0 ? (
                <div className="h-65 flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum dado disponivel
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={profitByLot}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="lucro" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Lucro" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Tendencia de Lucro" description="Por cultura">
              {profitOverTime.length === 0 ? (
                <div className="h-65 flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum dado disponivel
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={profitOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={tooltipStyle}
                    />
                    <Line
                      type="monotone"
                      dataKey="lucro"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--chart-1)", r: 3 }}
                      name="Lucro"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Lotes table + Status summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top lotes */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Seus Lotes</CardTitle>
                  <CardDescription>Desempenho financeiro por lote</CardDescription>
                </div>
                <Link href="/dashboard/lotes">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver todos
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-10 rounded bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : topLots.length === 0 ? (
                  <div className="py-12 text-center px-6">
                    <Leaf className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Nenhum lote cadastrado ainda
                    </p>
                    <Link href="/dashboard/lotes/novo">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar primeiro lote
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
                            Lote
                          </th>
                          <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
                            Cultura
                          </th>
                          <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">
                            Receita
                          </th>
                          <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">
                            Lucro
                          </th>
                          <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="py-2.5 px-4" />
                        </tr>
                      </thead>
                      <tbody>
                        {topLots.map((lot) => (
                          <tr
                            key={lot.id}
                            className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-foreground">{lot.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{lot.crop}</td>
                            <td className="py-3 px-4 text-right text-foreground tabular-nums">
                              {formatCurrency(lot.revenue)}
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums">
                              <span
                                className={cn(
                                  "font-semibold",
                                  lot.profit >= 0 ? "text-green-600" : "text-red-600"
                                )}
                              >
                                {formatCurrency(lot.profit)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {lot.status ? (
                                <Badge
                                  variant="outline"
                                  className={
                                    STATUS_CLASSES[lot.status] ??
                                    "border-muted-foreground/30 bg-muted text-muted-foreground"
                                  }
                                >
                                  {lot.status}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link href={`/dashboard/lotes/${lot.id}/editar`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status summary + Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status dos Lotes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                    ))
                  ) : Object.keys(statusSummary).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sem lotes
                    </p>
                  ) : (
                    Object.entries(statusSummary).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={
                            STATUS_CLASSES[status] ??
                            "border-muted-foreground/30 bg-muted text-muted-foreground"
                          }
                        >
                          {status}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {count} lote{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Acoes Rapidas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Link href="/dashboard/lotes">
                    <div className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                      <Grid3x3 className="h-5 w-5 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-foreground">Lotes</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/cultivos">
                    <div className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                      <Sprout className="h-5 w-5 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-foreground">Cultivos</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/analytics">
                    <div className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                      <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-foreground">Analytics</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/simulacao">
                    <div className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer text-center">
                      <Activity className="h-5 w-5 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-foreground">Simulacao</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
