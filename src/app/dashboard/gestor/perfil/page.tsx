"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { User, Mail, Phone, Building, Calendar, Edit } from "lucide-react"
import { useState } from "react"

export default function GestorPerfil() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Meu Perfil</h2>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src="/placeholder.svg?height=128&width=128" />
              <AvatarFallback className="text-2xl">MS</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-bold">Maria Santos</h3>
              <p className="text-sm text-muted-foreground">Gestor de Operações</p>
              <Badge className="mt-2">Conta Verificada</Badge>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              <Edit className="h-4 w-4 mr-2" />
              Alterar Foto
            </Button>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de contato</CardDescription>
            </div>
            <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Salvar" : "Editar"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input id="name" defaultValue="Maria Santos" disabled={!isEditing} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue="maria.santos@verdantis.com" disabled={!isEditing} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input id="phone" defaultValue="(11) 91234-5678" disabled={!isEditing} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joined">Membro desde</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input id="joined" defaultValue="Março 2023" disabled />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <Input id="company" defaultValue="Verdantis Agro Solutions" disabled={!isEditing} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Sobre</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você e sua experiência..."
                defaultValue="Gestora com 10 anos de experiência em operações agrícolas e análise de dados."
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Produtores Gerenciados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,247</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Relatórios Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">342</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Área Total Monitorada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">45,892 ha</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
