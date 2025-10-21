"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { TrendingUp, Users, Leaf, MapPin, Activity, ArrowUpRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type {
  ManagerStats,
  TopProducer,
  CropDistribution,
  RegionalDistribution,
  CertificationData,
  EnvironmentalImpact,
} from "@/src/types"

type FilterView = "overview" | "crops" | "regions" | "sustainability"

export default function GestorDashboard() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [activeView, setActiveView] = useState<FilterView>("overview")

  const stats: ManagerStats = {
    totalProducers: 1247,
    totalArea: 45892,
    activeCrops: 3456,
    averageProductivity: 18,
  }

  const monthlyProductionData = [
    { month: "Jan", producao: 6500, meta: 6000 },
    { month: "Fev", producao: 7800, meta: 7000 },
    { month: "Mar", producao: 8200, meta: 7500 },
    { month: "Abr", producao: 7500, meta: 7200 },
    { month: "Mai", producao: 8800, meta: 8000 },
    { month: "Jun", producao: 9200, meta: 8500 },
    { month: "Jul", producao: 8500, meta: 8200 },
    { month: "Ago", producao: 9500, meta: 9000 },
    { month: "Set", producao: 9000, meta: 8800 },
    { month: "Out", producao: 9800, meta: 9200 },
    { month: "Nov", producao: 9400, meta: 9000 },
    { month: "Dez", producao: 10000, meta: 9500 },
  ]

  const topProducers: TopProducer[] = [
    { rank: 1, name: "Fazenda São José", area: 2450, mainCrop: "Milho" },
    { rank: 2, name: "Fazenda Boa Vista", area: 1890, mainCrop: "Soja" },
    { rank: 3, name: "Fazenda Verde", area: 1650, mainCrop: "Café" },
    { rank: 4, name: "Fazenda Esperança", area: 1420, mainCrop: "Trigo" },
    { rank: 5, name: "Fazenda Progresso", area: 1280, mainCrop: "Milho" },
  ]

  const cropDistributions: CropDistribution[] = [
    { name: "Milho", percentage: 35, area: 16062, producers: 436, activeLots: 1209, productivity: 12 },
    { name: "Soja", percentage: 28, area: 12850, producers: 349, activeLots: 968, productivity: 15 },
    { name: "Café", percentage: 18, area: 8261, producers: 224, activeLots: 622, productivity: 9 },
    { name: "Trigo", percentage: 12, area: 5507, producers: 150, activeLots: 415, productivity: 7 },
    { name: "Alface", percentage: 4, area: 1836, producers: 50, activeLots: 138, productivity: 20 },
    { name: "Outros", percentage: 3, area: 1376, producers: 38, activeLots: 104, productivity: 11 },
  ]

  const cropPieData = cropDistributions.map((crop) => ({
    name: crop.name,
    value: crop.percentage,
  }))

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"]

  const regionalDistributions: RegionalDistribution[] = [
    { state: "São Paulo", area: 12450, percentage: 27 },
    { state: "Mato Grosso", area: 10890, percentage: 24 },
    { state: "Paraná", area: 8760, percentage: 19 },
    { state: "Minas Gerais", area: 6540, percentage: 14 },
    { state: "Goiás", area: 4320, percentage: 9 },
    { state: "Outros Estados", area: 2932, percentage: 7 },
  ]

  const certifications: CertificationData[] = [
    { name: "Certificação Orgânica", farms: 342, percentage: 38 },
    { name: "Rainforest Alliance", farms: 287, percentage: 32 },
    { name: "Fair Trade", farms: 263, percentage: 30 },
  ]

  const environmentalImpacts: EnvironmentalImpact[] = [
    { metric: "Consumo de Água", reduction: -22, progress: 78 },
    { metric: "Emissões de CO₂", reduction: -18, progress: 82 },
    { metric: "Uso de Pesticidas", reduction: -35, progress: 65 },
    { metric: "Energia Renovável", reduction: 42, progress: 92 },
  ]

  const sustainabilityData = environmentalImpacts.map((impact) => ({
    name: impact.metric,
    valor: Math.abs(impact.reduction),
    progresso: impact.progress,
  }))

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("animate-on-scroll")
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".animate-on-scroll")
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [activeView])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Acompanhe métricas agregadas de todas as fazendas e cultivos registrados
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="animate-on-scroll card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+12% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-on-scroll animate-delay-100 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Total Cultivada</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArea.toLocaleString()} ha</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+8% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-on-scroll animate-delay-200 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultivos Ativos</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCrops.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+15% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-on-scroll animate-delay-300 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtividade Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.averageProductivity}%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>vs. safra anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-2 animate-on-scroll">
        <Button variant={activeView === "overview" ? "default" : "outline"} onClick={() => setActiveView("overview")}>
          Visão Geral
        </Button>
        <Button variant={activeView === "crops" ? "default" : "outline"} onClick={() => setActiveView("crops")}>
          Por Cultura
        </Button>
        <Button variant={activeView === "regions" ? "default" : "outline"} onClick={() => setActiveView("regions")}>
          Por Região
        </Button>
        <Button
          variant={activeView === "sustainability" ? "default" : "outline"}
          onClick={() => setActiveView("sustainability")}
        >
          Sustentabilidade
        </Button>
      </div>

      {activeView === "overview" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 animate-on-scroll">
              <CardHeader>
                <CardTitle>Produção por Mês</CardTitle>
                <CardDescription>Comparativo dos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="producao" stroke="#10b981" strokeWidth={2} name="Produção" />
                    <Line
                      type="monotone"
                      dataKey="meta"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Producers */}
            <Card className="animate-on-scroll animate-delay-200">
              <CardHeader>
                <CardTitle>Top Produtores</CardTitle>
                <CardDescription>Maiores áreas cultivadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducers.map((producer) => (
                  <div key={producer.rank} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{producer.rank}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{producer.name}</p>
                        <p className="text-xs text-muted-foreground">{producer.area.toLocaleString()} ha</p>
                      </div>
                    </div>
                    <Badge>{producer.mainCrop}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Crop Distribution */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="animate-on-scroll">
              <CardHeader>
                <CardTitle>Distribuição por Cultura</CardTitle>
                <CardDescription>Percentual de área cultivada</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cropPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cropPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="animate-on-scroll animate-delay-200">
              <CardHeader>
                <CardTitle>Métricas de Sustentabilidade</CardTitle>
                <CardDescription>Indicadores ambientais agregados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {environmentalImpacts.map((impact) => (
                  <div key={impact.metric} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{impact.metric}</p>
                      <p className="text-2xl font-bold text-primary">
                        {impact.reduction > 0 ? "+" : ""}
                        {impact.reduction}%
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeView === "crops" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2 animate-on-scroll">
              <CardHeader>
                <CardTitle>Produção por Cultura</CardTitle>
                <CardDescription>Área cultivada em hectares</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cropDistributions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="area" fill="#10b981" name="Área (ha)" />
                    <Bar dataKey="producers" fill="#3b82f6" name="Produtores" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cropDistributions.map((crop, index) => (
              <Card key={crop.name} className={`animate-on-scroll animate-delay-${index * 100} card-hover`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{crop.name}</CardTitle>
                    <Badge>{crop.percentage}%</Badge>
                  </div>
                  <CardDescription>{crop.area.toLocaleString()} hectares cultivados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Produtores</p>
                      <p className="text-lg font-bold">{crop.producers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lotes Ativos</p>
                      <p className="text-lg font-bold">{crop.activeLots.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Produtividade</span>
                      <span className="font-medium text-green-600">+{crop.productivity}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${70 + crop.productivity}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeView === "regions" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2 animate-on-scroll">
              <CardHeader>
                <CardTitle>Distribuição Regional</CardTitle>
                <CardDescription>Produção por estado brasileiro</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalDistributions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="state" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="area" fill="#10b981" name="Área (ha)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {regionalDistributions.map((region, index) => (
              <Card key={region.state} className="animate-on-scroll card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{region.state}</p>
                      <p className="text-sm text-muted-foreground">{region.area.toLocaleString()} ha</p>
                    </div>
                    <Badge className="text-lg px-4 py-2">{region.percentage}%</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeView === "sustainability" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2 animate-on-scroll">
              <CardHeader>
                <CardTitle>Impacto Ambiental</CardTitle>
                <CardDescription>Métricas de sustentabilidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sustainabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valor" fill="#10b981" name="Redução (%)" />
                    <Bar dataKey="progresso" fill="#3b82f6" name="Progresso (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="animate-on-scroll">
              <CardHeader>
                <CardTitle>Certificações Sustentáveis</CardTitle>
                <CardDescription>Fazendas com certificação ativa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">{cert.farms} fazendas</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20">{cert.percentage}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="animate-on-scroll animate-delay-200">
              <CardHeader>
                <CardTitle>Detalhes de Impacto</CardTitle>
                <CardDescription>Reduções vs. ano anterior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {environmentalImpacts.map((impact) => (
                  <div key={impact.metric}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{impact.metric}</span>
                      <span className="text-sm font-bold text-green-600">
                        {impact.reduction > 0 ? "+" : ""}
                        {impact.reduction}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${impact.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
