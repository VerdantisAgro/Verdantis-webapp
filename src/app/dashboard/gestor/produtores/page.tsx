"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Search, MapPin, TrendingUp, Sprout, Award, Phone, Mail, Calendar } from "lucide-react"
import { useState } from "react"

interface Producer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalArea: number
  properties: number
  activeCrops: number
  mainCrop: string
  productivity: number
  joinDate: string
  status: "Ativo" | "Inativo" | "Pendente"
  certifications: string[]
}

const producersData: Producer[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    location: "São Paulo, SP",
    totalArea: 450,
    properties: 3,
    activeCrops: 8,
    mainCrop: "Soja",
    productivity: 95,
    joinDate: "2023-01-15",
    status: "Ativo",
    certifications: ["Orgânico", "Rainforest Alliance"],
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(41) 99876-5432",
    location: "Curitiba, PR",
    totalArea: 380,
    properties: 2,
    activeCrops: 6,
    mainCrop: "Milho",
    productivity: 92,
    joinDate: "2023-02-20",
    status: "Ativo",
    certifications: ["Fair Trade"],
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    phone: "(31) 97654-3210",
    location: "Belo Horizonte, MG",
    totalArea: 520,
    properties: 4,
    activeCrops: 10,
    mainCrop: "Café",
    productivity: 98,
    joinDate: "2022-11-10",
    status: "Ativo",
    certifications: ["Orgânico", "UTZ", "Fair Trade"],
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(51) 96543-2109",
    location: "Porto Alegre, RS",
    totalArea: 290,
    properties: 2,
    activeCrops: 5,
    mainCrop: "Trigo",
    productivity: 88,
    joinDate: "2023-03-05",
    status: "Ativo",
    certifications: ["Rainforest Alliance"],
  },
  {
    id: "5",
    name: "Pedro Almeida",
    email: "pedro.almeida@email.com",
    phone: "(62) 95432-1098",
    location: "Goiânia, GO",
    totalArea: 610,
    properties: 5,
    activeCrops: 12,
    mainCrop: "Soja",
    productivity: 96,
    joinDate: "2022-09-18",
    status: "Ativo",
    certifications: ["Orgânico"],
  },
  {
    id: "6",
    name: "Juliana Ferreira",
    email: "juliana.ferreira@email.com",
    phone: "(85) 94321-0987",
    location: "Fortaleza, CE",
    totalArea: 180,
    properties: 1,
    activeCrops: 3,
    mainCrop: "Algodão",
    productivity: 85,
    joinDate: "2023-04-12",
    status: "Pendente",
    certifications: [],
  },
]

export default function ProdutoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null)

  const filteredProducers = producersData.filter(
    (producer) =>
      producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producer.mainCrop.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: Producer["status"]) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "Inativo":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      case "Pendente":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    }
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtores</h1>
          <p className="text-muted-foreground mt-1">Gerencie e acompanhe todos os produtores cadastrados</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">Adicionar Produtor</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{producersData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+3 este mês</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Área Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {producersData.reduce((sum, p) => sum + p.totalArea, 0).toLocaleString()} ha
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sob gestão</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtividade Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(producersData.reduce((sum, p) => sum + p.productivity, 0) / producersData.length).toFixed(1)}%
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.3% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {producersData.reduce((sum, p) => sum + p.certifications.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, localização ou cultura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardHeader>
      </Card>

      {/* Producers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducers.map((producer) => (
          <Card
            key={producer.id}
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedProducer(producer)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {producer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{producer.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {producer.location}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(producer.status)}>
                  {producer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{producer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{producer.phone}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">{producer.totalArea}</div>
                  <div className="text-xs text-muted-foreground">Hectares</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{producer.properties}</div>
                  <div className="text-xs text-muted-foreground">Propriedades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{producer.activeCrops}</div>
                  <div className="text-xs text-muted-foreground">Cultivos</div>
                </div>
              </div>

              {/* Main Crop and Productivity */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{producer.mainCrop}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{producer.productivity}% produtividade</span>
                </div>
              </div>

              {/* Certifications */}
              {producer.certifications.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-4 border-t">
                  <Award className="h-4 w-4 text-yellow-600" />
                  {producer.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Join Date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Calendar className="h-3 w-3" />
                Cadastrado em {new Date(producer.joinDate).toLocaleDateString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredProducers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum produtor encontrado com os critérios de busca.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
