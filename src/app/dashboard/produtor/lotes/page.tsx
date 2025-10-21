"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Grid3x3, Plus, Edit, MapPin, Droplets } from "lucide-react"
import Link from "next/link"
import type { Lote } from "@/src/types"

export default function LotesPage() {
  const lotes: Lote[] = [
    {
      id: "1",
      name: "Lote A3",
      propertyId: "1",
      propertyName: "Fazenda São José",
      area: 25,
      soilType: "Argiloso",
      irrigationSystem: true,
      status: "Em Uso",
      currentCrop: "Milho",
    },
    {
      id: "2",
      name: "Lote B1",
      propertyId: "2",
      propertyName: "Fazenda Boa Vista",
      area: 30,
      soilType: "Arenoso",
      irrigationSystem: true,
      status: "Em Uso",
      currentCrop: "Soja",
    },
    {
      id: "3",
      name: "Lote C2",
      propertyId: "3",
      propertyName: "Fazenda Verde",
      area: 15,
      soilType: "Humoso",
      irrigationSystem: true,
      status: "Em Uso",
      currentCrop: "Alface",
    },
    {
      id: "4",
      name: "Lote A1",
      propertyId: "1",
      propertyName: "Fazenda São José",
      area: 20,
      soilType: "Argiloso",
      irrigationSystem: false,
      status: "Disponível",
    },
    {
      id: "5",
      name: "Lote B2",
      propertyId: "2",
      propertyName: "Fazenda Boa Vista",
      area: 18,
      soilType: "Arenoso",
      irrigationSystem: true,
      status: "Em Preparo",
    },
  ]

  const getStatusColor = (status: Lote["status"]) => {
    switch (status) {
      case "Em Uso":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "Disponível":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "Em Preparo":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Meus Lotes</h2>
          <p className="text-muted-foreground">Gerencie todos os lotes das suas propriedades</p>
        </div>
        <Link href="/dashboard/produtor/lotes/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lote
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotes.map((lote) => (
          <Card key={lote.id} className="hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Grid3x3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{lote.name}</CardTitle>
                    <CardDescription className="flex items-center text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {lote.propertyName}
                    </CardDescription>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(lote.status)}>{lote.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Área</p>
                  <p className="text-lg font-semibold">{lote.area} ha</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solo</p>
                  <p className="text-lg font-semibold">{lote.soilType}</p>
                </div>
              </div>

              {lote.currentCrop && (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cultivo Atual</p>
                  <p className="font-semibold">{lote.currentCrop}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm">
                {lote.irrigationSystem ? (
                  <>
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Sistema de irrigação</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Sem irrigação</span>
                )}
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
