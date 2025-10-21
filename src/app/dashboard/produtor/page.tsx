"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { MapPin, Leaf, TrendingUp, Grid3x3 } from "lucide-react"
import Link from "next/link"
import type { ProducerStats } from "@/src/types"

export default function ProdutorDashboard() {
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-2">Bem-vindo, Produtor</h2>
        <p className="text-muted-foreground">Gerencie suas propriedades e acompanhe o cultivo em tempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Total</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArea} ha</div>
            <p className="text-xs text-muted-foreground">{stats.properties} propriedades registradas</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultivos Ativos</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCrops}</div>
            <p className="text-xs text-muted-foreground">Em diferentes lotes</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lotes Cadastrados</CardTitle>
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Distribuídos em 3 fazendas</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
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

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Cadastre novas propriedades, lotes e cultivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/produtor/propriedades/nova">
              <Button
                className="w-full h-24 flex flex-col items-center justify-center space-y-2 bg-transparent"
                variant="outline"
              >
                <MapPin className="h-8 w-8" />
                <span>Nova Propriedade</span>
              </Button>
            </Link>
            <Link href="/dashboard/produtor/lotes/novo">
              <Button
                className="w-full h-24 flex flex-col items-center justify-center space-y-2 bg-transparent"
                variant="outline"
              >
                <Grid3x3 className="h-8 w-8" />
                <span>Novo Lote</span>
              </Button>
            </Link>
            <Link href="/dashboard/produtor/cultivos/novo">
              <Button
                className="w-full h-24 flex flex-col items-center justify-center space-y-2 bg-transparent"
                variant="outline"
              >
                <Leaf className="h-8 w-8" />
                <span>Novo Cultivo</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Propriedades Recentes</CardTitle>
            <CardDescription>Suas últimas propriedades cadastradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Fazenda São José", area: 120, lotes: 5 },
              { name: "Fazenda Boa Vista", area: 85, lotes: 4 },
              { name: "Fazenda Verde", area: 40, lotes: 3 },
            ].map((property, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.area} ha • {property.lotes} lotes
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Ver
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cultivos Ativos</CardTitle>
            <CardDescription>Acompanhe seus cultivos em andamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Milho - Lote A3", progress: 85, days: 15 },
              { name: "Soja - Lote B1", progress: 45, days: 67 },
              { name: "Alface - Lote C2", progress: 98, days: 2 },
            ].map((crop, index) => (
              <div key={index} className="p-4 border rounded-lg hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{crop.name}</p>
                  <span className="text-sm text-muted-foreground">{crop.days} dias</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{crop.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${crop.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
