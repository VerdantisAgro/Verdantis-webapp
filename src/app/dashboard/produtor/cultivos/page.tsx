"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Leaf, Plus, Calendar, MapPin, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Cultivo, CropStatus } from "@/src/types"

export default function CultivosPage() {
  const cultivos: Cultivo[] = [
    {
      id: "1",
      name: "Milho",
      lot: "Lote A3",
      loteId: "1",
      farm: "Fazenda São José",
      propertyId: "1",
      status: "Em Crescimento",
      plantingDate: "15 de Janeiro, 2025",
      harvestDate: "20 de Maio, 2025",
      area: 25,
      daysUntilHarvest: 15,
      progress: 85,
      irrigation: true,
      weather: true,
      variety: "AG 8088 PRO3",
      expectedYield: 180,
    },
    {
      id: "2",
      name: "Soja",
      lot: "Lote B1",
      loteId: "2",
      farm: "Fazenda Boa Vista",
      propertyId: "2",
      status: "Plantio",
      plantingDate: "10 de Março, 2025",
      harvestDate: "15 de Julho, 2025",
      area: 30,
      daysUntilHarvest: 127,
      progress: 15,
      irrigation: true,
      weather: true,
      variety: "M 6210 IPRO",
      expectedYield: 210,
    },
    {
      id: "3",
      name: "Alface",
      lot: "Lote C2",
      loteId: "3",
      farm: "Fazenda Verde",
      propertyId: "3",
      status: "Pronto",
      plantingDate: "20 de Fevereiro, 2025",
      harvestDate: "05 de Abril, 2025",
      area: 15,
      daysUntilHarvest: 2,
      progress: 98,
      irrigation: true,
      weather: true,
      variety: "Crespa",
      expectedYield: 45,
    },
  ]

  const getStatusColor = (status: CropStatus) => {
    switch (status) {
      case "Em Crescimento":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "Plantio":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "Pronto":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "Colheita":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Meus Cultivos</h2>
          <p className="text-muted-foreground">Acompanhe todos os seus cultivos em andamento</p>
        </div>
        <Link href="/dashboard/produtor/cultivos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cultivo
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {cultivos.map((cultivo) => (
          <Card key={cultivo.id} className="hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {cultivo.name} - {cultivo.lot}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {cultivo.farm}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">Variedade: {cultivo.variety}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(cultivo.status)}>{cultivo.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Data de Plantio
                  </p>
                  <p className="font-medium">{cultivo.plantingDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Previsão de Colheita
                  </p>
                  <p className="font-medium">{cultivo.harvestDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Área Cultivada</p>
                  <p className="font-medium">{cultivo.area} hectares</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Produtividade Esperada
                  </p>
                  <p className="font-medium">{cultivo.expectedYield} sc/ha</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso do Cultivo</span>
                  <span className="font-medium">
                    {cultivo.progress}% • {cultivo.daysUntilHarvest} dias até colheita
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${cultivo.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  Ver Histórico
                </Button>
                <Button size="sm">Ver Detalhes</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
