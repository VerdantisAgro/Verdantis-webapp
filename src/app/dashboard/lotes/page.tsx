"use client"

import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Plus, Eye, Pencil, Trash2, Leaf } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { lotesApi } from "@/src/api"
import { cn } from "@/src/lib/utils"

type UILote = {
  id: string
  name: string
  crop: string
  production: number
  cost: number
  salePrice: number
  revenue: number
  profit: number
  margin: number
  status: string
}

const STATUS_MAP: Record<string, string> = {
  ativo: "Ativo",
  finalizado: "Finalizado",
  "em preparo": "Em Preparo",
  em_preparo: "Em Preparo",
}

function normalizeStatus(status: string): string {
  return STATUS_MAP[status.toLowerCase()] ?? status
}

function mapApiLote(item: any): UILote {
  const production = item.producao ?? item.producaoTotal ?? 0
  const cost = item.custo ?? item.custoTotal ?? 0
  const salePrice = item.precoVenda ?? 0
  const revenue = item.receita ?? production * salePrice
  const profit = item.lucroEstimado ?? item.lucro ?? revenue - cost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  return {
    id: String(item.id),
    name: item.nomeLote || item.lote || `Lote ${item.id}`,
    crop: item.cultura || "",
    production,
    cost,
    salePrice,
    revenue,
    profit,
    margin,
    status: item.status ? normalizeStatus(item.status) : "",
  }
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const STATUS_CLASSES: Record<string, string> = {
  Ativo: "border-green-500/30 bg-green-500/10 text-green-700",
  Finalizado: "border-muted-foreground/30 bg-muted text-muted-foreground",
  "Em Preparo": "border-amber-500/30 bg-amber-500/10 text-amber-700",
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-b border-border/50">
          {Array.from({ length: 8 }).map((__, j) => (
            <td key={j} className="py-3 px-3">
              <div className="h-4 rounded bg-muted animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function LotesPage() {
  const [lots, setLots] = useState<UILote[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await lotesApi.getLotes()
        setLots((res || []).map(mapApiLote))
      } catch (err) {
        console.error("Failed to load lotes", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await lotesApi.deleteLote(Number(id))
      setLots((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      console.error("Failed to delete lote", err)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const totalProfit = lots.reduce((sum, l) => sum + l.profit, 0)
  const totalRevenue = lots.reduce((sum, l) => sum + l.revenue, 0)

  return (
    <>
      <Topbar title="Lotes" description="Gerencie seus lotes e acompanhe a lucratividade" />
      <PageContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Carregando..."
                  : `${lots.length} lote${lots.length !== 1 ? "s" : ""} cadastrado${lots.length !== 1 ? "s" : ""}`}
              </p>
              {!loading && lots.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receita total:{" "}
                  <span className="font-medium text-foreground">{formatCurrency(totalRevenue)}</span>
                  {" · "}Lucro total:{" "}
                  <span className={cn("font-medium", totalProfit >= 0 ? "text-green-600" : "text-red-600")}>
                    {formatCurrency(totalProfit)}
                  </span>
                </p>
              )}
            </div>
            <Link href="/dashboard/lotes/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Button>
            </Link>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Todos os Lotes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lote</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cultura</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Producao</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Custo</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Receita</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Lucro</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <SkeletonRows />
                    ) : lots.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-20 text-center">
                          <Leaf className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm font-medium text-foreground mb-1">Nenhum lote cadastrado</p>
                          <p className="text-xs text-muted-foreground mb-4">Crie seu primeiro lote para comecar</p>
                          <Link href="/dashboard/lotes/novo">
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Criar Lote
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      lots.map((lot) => (
                        <tr
                          key={lot.id}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-foreground">{lot.name}</p>
                          </td>
                          <td className="py-3 px-4 text-foreground">{lot.crop}</td>
                          <td className="py-3 px-4 text-right text-foreground tabular-nums">
                            {lot.production} sc
                          </td>
                          <td className="py-3 px-4 text-right text-foreground tabular-nums">
                            {formatCurrency(lot.cost)}
                          </td>
                          <td className="py-3 px-4 text-right text-foreground tabular-nums">
                            {formatCurrency(lot.revenue)}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            <span
                              className={cn(
                                "font-semibold",
                                lot.profit >= 0 ? "text-green-600" : "text-red-600"
                              )}
                            >
                              {formatCurrency(lot.profit)}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {lot.margin >= 0 ? "+" : ""}
                              {lot.margin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {lot.status ? (
                              <Badge
                                variant="outline"
                                className={
                                  STATUS_CLASSES[lot.status] ??
                                  "border-muted-foreground/30 bg-muted text-muted-foreground"
                                }
                              >
                                {lot.status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {confirmId === lot.id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  disabled={deletingId === lot.id}
                                  onClick={() => handleDelete(lot.id)}
                                >
                                  {deletingId === lot.id ? "..." : "Confirmar"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => setConfirmId(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-0.5">
                                <Link href={`/dashboard/lotes/${lot.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    title="Ver detalhes"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver detalhes</span>
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/lotes/${lot.id}/editar`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    title="Editar"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  title="Excluir"
                                  onClick={() => setConfirmId(lot.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Excluir</span>
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}
