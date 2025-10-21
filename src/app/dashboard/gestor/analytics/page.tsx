"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart, LineChart } from "lucide-react"
import {
  LineChart as RechartsLine,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { useState } from "react"

// Static data for analytics
const monthlyProductionData = [
  { month: "Jan", producao: 4200, meta: 4000, eficiencia: 95 },
  { month: "Fev", producao: 4500, meta: 4200, eficiencia: 97 },
  { month: "Mar", producao: 4800, meta: 4500, eficiencia: 98 },
  { month: "Abr", producao: 5100, meta: 4800, eficiencia: 96 },
  { month: "Mai", producao: 5400, meta: 5000, eficiencia: 99 },
  { month: "Jun", producao: 5800, meta: 5200, eficiencia: 98 },
]

const cropPerformanceData = [
  { cultura: "Soja", producao: 12500, crescimento: 15, area: 450 },
  { cultura: "Milho", producao: 9800, crescimento: 12, area: 380 },
  { cultura: "Trigo", producao: 7200, crescimento: 8, area: 290 },
  { cultura: "Café", producao: 5600, crescimento: 18, area: 220 },
  { cultura: "Algodão", producao: 4100, crescimento: 10, area: 180 },
]

const regionalDistributionData = [
  { regiao: "Sul", valor: 35, produtores: 145 },
  { regiao: "Sudeste", valor: 28, produtores: 112 },
  { regiao: "Centro-Oeste", valor: 22, produtores: 89 },
  { regiao: "Nordeste", valor: 10, produtores: 42 },
  { regiao: "Norte", valor: 5, produtores: 18 },
]

const sustainabilityTrendsData = [
  { mes: "Jan", agua: 85, co2: 78, certificacoes: 65 },
  { mes: "Fev", agua: 87, co2: 80, certificacoes: 68 },
  { mes: "Mar", agua: 89, co2: 82, certificacoes: 72 },
  { mes: "Abr", agua: 91, co2: 85, certificacoes: 75 },
  { mes: "Mai", agua: 93, co2: 87, certificacoes: 78 },
  { mes: "Jun", agua: 95, co2: 90, certificacoes: 82 },
]

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

type TimeRange = "7d" | "30d" | "90d" | "1y"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Avançados</h1>
          <p className="text-muted-foreground mt-1">Análise detalhada de desempenho e tendências</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="transition-all"
            >
              {range === "7d" && "7 dias"}
              {range === "30d" && "30 dias"}
              {range === "90d" && "90 dias"}
              {range === "1y" && "1 ano"}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produção Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.800 ton</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12.5% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eficiência Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.2%</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+2.1% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Área Cultivada</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.520 ha</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8.3% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ROI Médio</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <div className="flex items-center text-sm text-red-600 mt-1">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-1.2% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Production Trend */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Tendência de Produção Mensal</CardTitle>
            <CardDescription>Produção vs Meta nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="producao"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                  name="Produção (ton)"
                />
                <Area
                  type="monotone"
                  dataKey="meta"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  name="Meta (ton)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crop Performance */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Desempenho por Cultura</CardTitle>
            <CardDescription>Produção e crescimento por tipo de cultura</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cultura" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="producao" fill="#22c55e" name="Produção (ton)" />
                <Bar dataKey="crescimento" fill="#3b82f6" name="Crescimento (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Distribuição Regional</CardTitle>
            <CardDescription>Participação por região do Brasil</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={regionalDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ regiao, valor }) => `${regiao}: ${valor}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {regionalDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sustainability Trends */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Tendências de Sustentabilidade</CardTitle>
            <CardDescription>Evolução dos indicadores ambientais</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLine data={sustainabilityTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="agua" stroke="#3b82f6" strokeWidth={2} name="Economia de Água (%)" />
                <Line type="monotone" dataKey="co2" stroke="#22c55e" strokeWidth={2} name="Redução CO₂ (%)" />
                <Line
                  type="monotone"
                  dataKey="certificacoes"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Certificações (%)"
                />
              </RechartsLine>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Top Culturas por Área</CardTitle>
            <CardDescription>Ranking de culturas por hectares cultivados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cropPerformanceData.map((crop, index) => (
                <div
                  key={crop.cultura}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{crop.cultura}</div>
                      <div className="text-sm text-muted-foreground">{crop.area} hectares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{crop.producao.toLocaleString()} ton</div>
                    <div className="text-sm text-green-600 flex items-center justify-end">
                      <TrendingUp className="h-3 w-3 mr-1" />+{crop.crescimento}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Distribuição de Produtores</CardTitle>
            <CardDescription>Número de produtores por região</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionalDistributionData.map((region) => (
                <div key={region.regiao} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{region.regiao}</span>
                    <span className="text-sm text-muted-foreground">{region.produtores} produtores</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${region.valor}%` }} />
                  </div>
                  <div className="text-right text-sm font-medium text-primary">{region.valor}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
