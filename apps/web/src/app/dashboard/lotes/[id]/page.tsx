"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { StatCard } from "@/src/components/stat-card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Pencil,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { lotesApi, getErrorMessage } from "@/src/api"
import { cn } from "@/src/lib/utils"
import { formatCurrency } from "@/src/lib/format"
import { mapApiLote, STATUS_CLASSES, type UILote } from "@/src/lib/lotes"


export default function LoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [lot, setLot] = useState<UILote | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLot(mapApiLote(await lotesApi.getLoteById(id)))
      } catch (err) {
        toast.error(getErrorMessage(err, "Nao foi possivel carregar o lote."))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await lotesApi.deleteLote(id)
      router.push("/dashboard/lotes")
    } catch (err) {
      toast.error(getErrorMessage(err, "Nao foi possivel excluir o lote."))
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <>
        <Topbar title="Lote" description="Carregando..." />
        <PageContainer>
          <div className="space-y-4">
            <div className="h-8 w-24 rounded bg-muted animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 rounded-lg bg-muted animate-pulse" />
              <div className="h-40 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </PageContainer>
      </>
    )
  }

  if (!lot) {
    return (
      <>
        <Topbar title="Lote" description="Nao encontrado" />
        <PageContainer>
          <div className="py-20 text-center">
            <p className="text-muted-foreground mb-4">Lote nao encontrado ou foi removido.</p>
            <Link href="/dashboard/lotes">
              <Button>Voltar para Lotes</Button>
            </Link>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Topbar title={lot.name} description={`${lot.crop}${lot.status ? ` · ${lot.status}` : ""}`} />
      <PageContainer>
        <div className="space-y-6">
          {/* Top actions bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Link href="/dashboard/lotes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Lotes
              </Button>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              {lot.status && (
                <Badge
                  variant="outline"
                  className={STATUS_CLASSES[lot.status] ?? "border-muted-foreground/30 bg-muted text-muted-foreground"}
                >
                  {lot.status}
                </Badge>
              )}
              <Link href={`/dashboard/lotes/${id}/editar`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
              {confirmDelete ? (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? "Excluindo..." : "Confirmar exclusao"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Lucro"
              value={formatCurrency(lot.profit)}
              icon={
                <DollarSign
                  className={cn("h-5 w-5", lot.profit >= 0 ? "text-green-600" : "text-red-600")}
                />
              }
              variant={lot.profit >= 0 ? "success" : "danger"}
            />
            <StatCard
              title="Receita"
              value={formatCurrency(lot.revenue)}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Custo Total"
              value={formatCurrency(lot.cost)}
              icon={<TrendingDown className="h-5 w-5 text-amber-600" />}
            />
            <StatCard
              title="Margem"
              value={`${lot.margin >= 0 ? "+" : ""}${lot.margin.toFixed(1)}%`}
              icon={
                <Percent
                  className={cn("h-5 w-5", lot.margin >= 0 ? "text-green-600" : "text-red-600")}
                />
              }
              variant={lot.margin >= 0 ? "success" : "danger"}
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Producao</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cultura</span>
                  <span className="font-medium text-foreground">{lot.crop || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Producao Total</span>
                  <span className="font-medium text-foreground">{lot.production} sacas</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preco de Venda</span>
                  <span className="font-medium text-foreground">
                    {lot.salePrice > 0 ? `${formatCurrency(lot.salePrice)}/saca` : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Custo Total</span>
                  <span className="font-medium text-foreground">{formatCurrency(lot.cost)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Receita</span>
                  <span className="font-medium text-foreground">{formatCurrency(lot.revenue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <span className="font-semibold text-foreground">Lucro Liquido</span>
                  <span
                    className={cn(
                      "font-bold text-base",
                      lot.profit >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(lot.profit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
