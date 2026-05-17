"use client"

import { Topbar } from "@/src/components/topbar"
import { PageContainer } from "@/src/components/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Plus, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Lote as ApiLote } from "@/src/api/types"
import { lotesApi } from "@/src/api"

function mapApiLote(item: any) {
  return {
    id: String(item.id),
    name: item.nomeLote || item.lote || `Lote ${item.id}`,
    crop: item.cultura || item.crop || "",
    production: item.producao || item.producaoTotal || 0,
    cost: item.custo || item.custoTotal || 0,
    salePrice: item.precoVenda || item.precoEstimado || 0,
    revenue: item.receita || 0,
    profit: item.lucroEstimado || item.lucro || (item.receita || 0) - (item.custo || 0),
    margin: 0,
    status: item.status || "",
    area: item.area || 0,
  }
}


const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function getStatusBadge(status: Lote["status"]) {
  const map = {
    "Ativo": "border-green-500/30 bg-green-500/10 text-green-700",
    "Finalizado": "border-muted-foreground/30 bg-muted text-muted-foreground",
    "Em Preparo": "border-amber-500/30 bg-amber-500/10 text-amber-700",
  }
  return map[status]
}

export default function LotesPage() {
  const [lots, setLots] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await lotesApi.getLotes()
        setLots((res || []).map(mapApiLote))
      } catch (err) {
        console.error("Failed to load lotes", err)
      }
    })()
  }, [])

  return (
    <>
      <Topbar title="Lotes" description="Gerencie seus lotes e acompanhe a lucratividade" />
      <PageContainer>
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{lots.length} lotes cadastrados</p>
            </div>
            <Link href="/dashboard/lotes/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Button>
            </Link>
          </div>

          {/* Lots Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Todos os Lotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Lote</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Cultura</th>
                      <th className="text-right py-3 px-3 font-medium text-muted-foreground">Producao</th>
                      <th className="text-right py-3 px-3 font-medium text-muted-foreground">Custo</th>
                      <th className="text-right py-3 px-3 font-medium text-muted-foreground">Receita</th>
                      <th className="text-right py-3 px-3 font-medium text-muted-foreground">Lucro</th>
                      <th className="text-center py-3 px-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-3 font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot) => (
                      <tr key={lot.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium text-foreground">{lot.name}</p>
                            <p className="text-xs text-muted-foreground">{lot.area} ha</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-foreground">{lot.crop}</td>
                        <td className="py-3 px-3 text-right text-foreground">{lot.production} sc</td>
                        <td className="py-3 px-3 text-right text-foreground">{formatCurrency(lot.cost)}</td>
                        <td className="py-3 px-3 text-right text-foreground">{formatCurrency(lot.revenue)}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${lot.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(lot.profit)}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {lot.margin >= 0 ? "+" : ""}{lot.margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant="outline" className={getStatusBadge(lot.status)}>
                            {lot.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/dashboard/lotes/${lot.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver detalhes</span>
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
