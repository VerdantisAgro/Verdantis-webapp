"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { StatCard } from "@/src/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { User, Mail, Calendar, Grid3x3, CheckCircle2, DollarSign, IdCard } from "lucide-react"
import { analyticsApi, authApi, getErrorMessage, type DashboardSummary, type Me } from "@/src/api"
import { formatCurrency, formatDate } from "@/src/lib/format"

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {value || "—"}
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [meRes, summaryRes] = await Promise.allSettled([authApi.getMe(), analyticsApi.getDashboard()])
      if (meRes.status === "fulfilled") setMe(meRes.value)
      else toast.error(getErrorMessage(meRes.reason, "Nao foi possivel carregar o perfil."))
      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <>
        <Topbar title="Perfil" description="Carregando..." />
        <PageContainer>
          <div className="h-48 rounded-lg bg-muted animate-pulse" />
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Topbar title="Perfil" description="Suas informacoes de conta" />
      <PageContainer>
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="flex flex-col items-center pt-8 pb-6 gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {initials(me?.nome ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground">{me?.nome ?? "Usuario"}</h3>
                  <p className="text-sm text-muted-foreground">Produtor Rural</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Dados da conta</CardTitle>
                <CardDescription>Informacoes informadas no cadastro</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <InfoRow icon={<User className="h-4 w-4 text-muted-foreground" />} label="Nome completo" value={me?.nome ?? ""} />
                <InfoRow icon={<Mail className="h-4 w-4 text-muted-foreground" />} label="E-mail" value={me?.email ?? ""} />
                <InfoRow icon={<IdCard className="h-4 w-4 text-muted-foreground" />} label="CPF" value={me?.cpf ?? ""} />
                <InfoRow
                  icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                  label="Membro desde"
                  value={me ? formatDate(me.criadoEm) : ""}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title="Lotes ativos"
              value={String(summary?.lotesAtivos ?? 0)}
              icon={<Grid3x3 className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Lotes finalizados"
              value={String(summary?.lotesFinalizados ?? 0)}
              icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Lucro acumulado"
              value={formatCurrency(summary?.lucroTotal ?? 0)}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              variant={(summary?.lucroTotal ?? 0) >= 0 ? "success" : "danger"}
            />
          </div>
        </div>
      </PageContainer>
    </>
  )
}
