"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, Leaf, MapPin, Activity, ArrowUpRight } from "lucide-react"
import { useEffect, useRef } from "react"
import type {
  ManagerStats,
  TopProducer,
  CropDistribution,
  RegionalDistribution,
  CertificationData,
  EnvironmentalImpact,
  ChartDataPoint,
} from "@/types"

export default function GestorDashboard() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const stats: ManagerStats = {
    totalProducers: 1247,
    totalArea: 45892,
    activeCrops: 3456,
    averageProductivity: 18,
  }

  const chartData: ChartDataPoint[] = [
    { month: "J", value: 65 },
    { month: "F", value: 78 },
    { month: "M", value: 82 },
    { month: "A", value: 75 },
    { month: "M", value: 88 },
    { month: "J", value: 92 },
    { month: "J", value: 85 },
    { month: "A", value: 95 },
    { month: "S", value: 90 },
    { month: "O", value: 98 },
    { month: "N", value: 94 },
    { month: "D", value: 100 },
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
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Verdantis</h1>
                <p className="text-xs text-muted-foreground">Dashboard do Gestor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Minha Conta
              </Button>
              <Button size="sm">Sair</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Visão Geral - Analytics</h2>
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

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="animate-on-scroll">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="crops">Por Cultura</TabsTrigger>
            <TabsTrigger value="regions">Por Região</TabsTrigger>
            <TabsTrigger value="sustainability">Sustentabilidade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Production Chart */}
              <Card className="lg:col-span-2 animate-on-scroll">
                <CardHeader>
                  <CardTitle>Produção por Mês</CardTitle>
                  <CardDescription>Comparativo dos últimos 12 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-end justify-between space-x-2">
                    {chartData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-all cursor-pointer"
                          style={{ height: `${data.value}%` }}
                        ></div>
                        <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-4">
                    {cropDistributions.map((crop, index) => (
                      <div key={crop.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{crop.name}</span>
                          <span className="text-muted-foreground">{crop.percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-chart-${index + 1} rounded-full`}
                            style={{ width: `${crop.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
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
          </TabsContent>

          <TabsContent value="crops" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cropDistributions.map((crop, index) => (
                <Card key={crop.name} className={`animate-on-scroll animate-delay-${index * 100} card-hover`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{crop.name}</CardTitle>
                      <Badge
                        className={`bg-chart-${index + 1}/10 text-chart-${index + 1} border-chart-${index + 1}/20`}
                      >
                        {crop.percentage}%
                      </Badge>
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
                          className={`h-full bg-chart-${index + 1} rounded-full`}
                          style={{ width: `${70 + crop.productivity}%` }}
                        ></div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regions">
            <Card className="animate-on-scroll">
              <CardHeader>
                <CardTitle>Distribuição Regional</CardTitle>
                <CardDescription>Produção por estado brasileiro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {regionalDistributions.map((region, index) => (
                      <div
                        key={region.state}
                        className={`flex items-center justify-between p-4 border border-border/40 rounded-lg hover-lift ${index < 3 ? "" : ""}`}
                      >
                        <div>
                          <p className="font-semibold">{region.state}</p>
                          <p className="text-sm text-muted-foreground">{region.area.toLocaleString()} ha</p>
                        </div>
                        <Badge>{region.percentage}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sustainability">
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
                  <CardTitle>Impacto Ambiental</CardTitle>
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
                        <div
                          className={`h-full ${
                            impact.metric === "Consumo de Água"
                              ? "bg-blue-500"
                              : impact.metric === "Emissões de CO₂"
                                ? "bg-green-500"
                                : impact.metric === "Uso de Pesticidas"
                                  ? "bg-yellow-500"
                                  : "bg-primary"
                          } rounded-full`}
                          style={{ width: `${impact.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
