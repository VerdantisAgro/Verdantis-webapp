"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { StatCard } from "@/src/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { AppButton } from "@/src/components/app-button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, Edit, Grid3x3, Sprout } from "lucide-react"
import { usersApi } from "@/src/api"

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ id?: number; userName?: string; email?: string; phone?: string; location?: string; bio?: string; memberSince?: string } | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const id = Number(localStorage.getItem("userId") || "0")
        if (id) {
          const user = await usersApi.getUserById(id)
          setProfile({ id: user.id, userName: user.userName, email: user.email, phone: "", location: "", bio: "", memberSince: "" })
        } else {
          // Fallback to stored auth info
          const name = localStorage.getItem("userName") || ""
          const email = localStorage.getItem("userEmail") || ""
          setProfile({ userName: name, email })
        }
      } catch (err) {
        console.error("Failed to load profile", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSave = () => {
    // No update endpoint implemented; persist locally for now.
    if (profile?.userName) localStorage.setItem("userName", profile.userName)
    if (profile?.email) localStorage.setItem("userEmail", profile.email)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <>
        <Topbar title="Perfil" description="Carregando..." />
        <PageContainer>
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">Carregando perfil...</CardContent>
          </Card>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Topbar title="Perfil" description="Gerencie suas informacoes pessoais" />
      <PageContainer>
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="flex flex-col items-center pt-8 pb-6 gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">{(profile?.userName || "").split(" ").map(s => s[0]).slice(0,2).join("") || "U"}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground">{profile?.userName || "Usuário"}</h3>
                  <p className="text-sm text-muted-foreground">Produtor Rural</p>
                  <Badge className="mt-2 border-green-500/30 bg-green-500/10 text-green-700" variant="outline">
                    Conta Verificada
                  </Badge>
                </div>
                <AppButton variant="secondary" size="md" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Alterar Foto
                </AppButton>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Dados Pessoais</CardTitle>
                  <CardDescription>Atualize suas informacoes de contato</CardDescription>
                </div>
                <AppButton
                  variant={isEditing ? "primary" : "secondary"}
                  size="md"
                  onClick={() => {
                    if (isEditing) handleSave()
                    else setIsEditing(true)
                  }}
                >
                  {isEditing ? "Salvar" : "Editar"}
                </AppButton>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input id="name" value={profile?.userName || ""} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...(p||{}), userName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input id="email" type="email" value={profile?.email || ""} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...(p||{}), email: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input id="phone" value={profile?.phone || ""} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...(p||{}), phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joined">Membro desde</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input id="joined" value={profile?.memberSince || ""} disabled />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereco</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input id="address" value={profile?.location || ""} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...(p||{}), location: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre voce..."
                    value={profile?.bio || ""}
                    disabled={!isEditing}
                    rows={3}
                    onChange={(e) => setProfile(p => ({ ...(p||{}), bio: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title="Lotes Ativos"
              value="--"
              icon={<Grid3x3 className="h-5 w-5 text-primary" />}
              description="Carregando..."
            />
            <StatCard
              title="Cultivos em Andamento"
              value="--"
              icon={<Sprout className="h-5 w-5 text-primary" />}
              description="Carregando..."
            />
            <StatCard
              title="Lucro Acumulado"
              value="--"
              icon={<User className="h-5 w-5 text-primary" />}
              variant="success"
              description="Carregando..."
            />
          </div>
        </div>
      </PageContainer>
    </>
  )
}
