"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Calendar, MapPin, Leaf, TrendingUp, Droplets, Sun, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useEffect, useRef } from "react"
import type { CropData, ProducerStats, Alert, WeatherData, CropStatus } from "@/src/types"

export default function ProdutorDashboard() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const stats: ProducerStats = {
    totalArea: 245,
    properties: 3,
    activeCrops: 8,
    nextHarvest: {
      days: 15,
      crop: "Milho",
      lot: "Lote A3",
    },
    productivity: 12,
  }

  const crops: CropData[] = [
    {
      id: "1",
      name: "Milho",
      lot: "Lote A3",
      farm: "Fazenda São José",
      status: "Em Crescimento",
      plantingDate: "15 de Janeiro, 2025",
      harvestDate: "20 de Maio, 2025",
      area: 45,
      daysUntilHarvest: 15,
      progress: 85,
      irrigation: true,
      weather: true,
    },
    {
      id: "2",
      name: "Soja",
      lot: "Lote B1",
      farm: "Fazenda Boa Vista",
      status: "Plantio",
      plantingDate: "10 de Março, 2025",
      harvestDate: "15 de Julho, 2025",
      area: 80,
      daysUntilHarvest: 127,
      progress: 15,
      irrigation: true,
      weather: true,
    },
    {
      id: "3",
      name: "Alface",
      lot: "Lote C2",
      farm: "Fazenda Verde",
      status: "Pronto",
      plantingDate: "20 de Fevereiro, 2025",
      harvestDate: "05 de Abril, 2025",
      area: 12,
      daysUntilHarvest: 2,
      progress: 98,
      irrigation: true,
      weather: true,
    },
  ]

  const alerts: Alert[] = [
    {
      id: "1",
      type: "warning",
      title: "Previsão de Chuva",
      description: "Próximos 3 dias - Lote A3",
      icon: "alert-circle",
    },
    {
      id: "2",
      type: "success",
      title: "Colheita Programada",
      description: "Alface C2 - 2 dias",
      icon: "check-circle",
    },
    {
      id: "3",
      type: "info",
      title: "Manutenção Agendada",
      description: "Sistema de irrigação - Amanhã",
      icon: "clock",
    },
  ]

  const weather: WeatherData = {
    temperature: 28,
    condition: "Ensolarado",
    humidity: 65,
    windSpeed: 12,
  }

  const getStatusBadgeClass = (status: CropStatus): string => {
    switch (status) {
      case "Em Crescimento":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "Plantio":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "Pronto":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

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
                <p className="text-xs text-muted-foreground">Dashboard do Produtor</p>
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
          <h2 className="text-3xl font-bold mb-2">Bem-vindo, Produtor</h2>
          <p className="text-muted-foreground">Gerencie suas propriedades e acompanhe o cultivo em tempo real</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="animate-on-scroll card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Área Total</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArea} ha</div>
              <p className="text-xs text-muted-foreground">{stats.properties} propriedades registradas</p>
            </CardContent>
          </Card>

          <Card className="animate-on-scroll animate-delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cultivos Ativos</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCrops}</div>
              <p className="text-xs text-muted-foreground">Milho, Soja, Alface</p>
            </CardContent>
          </Card>

          <Card className="animate-on-scroll animate-delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Colheita</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nextHarvest.days} dias</div>
              <p className="text-xs text-muted-foreground">
                {stats.nextHarvest.crop} - {stats.nextHarvest.lot}
              </p>
            </CardContent>
          </Card>

          <Card className="animate-on-scroll animate-delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.productivity}%</div>
              <p className="text-xs text-muted-foreground">vs. safra anterior</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Crops */}
            <Card className="animate-on-scroll">
              <CardHeader>
                <CardTitle>Cultivos em Andamento</CardTitle>
                <CardDescription>Acompanhe o status de cada lote em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {crops.map((crop) => (
                  <div key={crop.id} className="border border-border/40 rounded-lg p-4 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Leaf className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {crop.name} - {crop.lot}
                          </h3>
                          <p className="text-sm text-muted-foreground">{crop.farm}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeClass(crop.status)}>{crop.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Data de Plantio</p>
                        <p className="text-sm font-medium">{crop.plantingDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Previsão de Colheita</p>
                        <p className="text-sm font-medium">{crop.harvestDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Área Cultivada</p>
                        <p className="text-sm font-medium">{crop.area} hectares</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Dias até Colheita</p>
                        <p className="text-sm font-medium">{crop.daysUntilHarvest} dias</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progresso do Cultivo</span>
                        <span className="font-medium">{crop.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${crop.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                      <div className="flex items-center space-x-4 text-sm">
                        {crop.irrigation && (
                          <div className="flex items-center space-x-1">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span>Irrigação OK</span>
                          </div>
                        )}
                        {crop.weather && (
                          <div className="flex items-center space-x-1">
                            <Sun className="h-4 w-4 text-yellow-500" />
                            <span>Clima Ideal</span>
                          </div>
                        )}
                        {crop.status === "Pronto" && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Pronto para Colheita</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="animate-on-scroll animate-delay-400">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MapPin className="mr-2 h-4 w-4" />
                  Registrar Nova Propriedade
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Leaf className="mr-2 h-4 w-4" />
                  Adicionar Cultivo
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Atividade
                </Button>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="animate-on-scroll animate-delay-500">
              <CardHeader>
                <CardTitle>Alertas e Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      alert.type === "warning"
                        ? "bg-yellow-500/10 border border-yellow-500/20"
                        : alert.type === "success"
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-blue-500/10 border border-blue-500/20"
                    }`}
                  >
                    {alert.type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                    {alert.type === "success" && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                    {alert.type === "info" && <Clock className="h-5 w-5 text-blue-600 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weather Widget */}
            <Card className="animate-on-scroll animate-delay-600">
              <CardHeader>
                <CardTitle>Clima Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold">{weather.temperature}°C</div>
                    <p className="text-sm text-muted-foreground">{weather.condition}</p>
                  </div>
                  <Sun className="h-12 w-12 text-yellow-500" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Umidade</p>
                    <p className="font-medium">{weather.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vento</p>
                    <p className="font-medium">{weather.windSpeed} km/h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
