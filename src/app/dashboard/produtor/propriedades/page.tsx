"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { MapPin, Plus, Edit, Grid3x3 } from "lucide-react"
import Link from "next/link"
import type { FarmPropertyExtended } from "@/src/types"

export default function PropriedadesPage() {
  const properties: FarmPropertyExtended[] = [
    {
      id: "1",
      name: "Fazenda São José",
      area: 120,
      location: "Ribeirão Preto, SP",
      owner: "João Silva",
      registrationDate: "15/01/2024",
      crops: [],
      lotes: [],
      totalLotes: 5,
    },
    {
      id: "2",
      name: "Fazenda Boa Vista",
      area: 85,
      location: "Campinas, SP",
      owner: "João Silva",
      registrationDate: "20/02/2024",
      crops: [],
      lotes: [],
      totalLotes: 4,
    },
    {
      id: "3",
      name: "Fazenda Verde",
      area: 40,
      location: "Piracicaba, SP",
      owner: "João Silva",
      registrationDate: "10/03/2024",
      crops: [],
      lotes: [],
      totalLotes: 3,
    },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Minhas Propriedades</h2>
          <p className="text-muted-foreground">Gerencie todas as suas propriedades rurais</p>
        </div>
        <Link href="/dashboard/produtor/propriedades/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Propriedade
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Área Total</p>
                  <p className="text-lg font-semibold">{property.area} ha</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lotes</p>
                  <p className="text-lg font-semibold">{property.totalLotes}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Proprietário</span>
                  <span className="font-medium">{property.owner}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cadastro</span>
                  <span className="font-medium">{property.registrationDate}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Lotes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
