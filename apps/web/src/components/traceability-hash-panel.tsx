"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Copy, ShieldCheck, Hash } from "lucide-react"
import { useState } from "react"
import type { TraceabilityHash } from "@/src/types"

interface TraceabilityHashPanelProps {
  hash: TraceabilityHash | null
  onGenerate: () => void
  canGenerate: boolean
}

export function TraceabilityHashPanel({ hash, onGenerate, canGenerate }: TraceabilityHashPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!hash) return
    await navigator.clipboard.writeText(hash.hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!hash) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Rastreabilidade nao finalizada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Finalize o cultivo para gerar o hash de rastreabilidade
              </p>
            </div>
            <Button onClick={onGenerate} disabled={!canGenerate} size="sm" className="mt-2">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Finalizar Cultivo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Rastreabilidade Verificada
          </CardTitle>
          <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-700 text-xs">
            Completo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Hash display */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Hash de Verificacao</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono text-foreground break-all">
              {hash.hash}
            </code>
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Copiar hash</span>
            </Button>
          </div>
          {copied && <p className="text-xs text-green-600">Hash copiado!</p>}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-xs text-muted-foreground">Eventos registrados</p>
            <p className="text-sm font-semibold text-foreground">{hash.eventCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gerado em</p>
            <p className="text-sm font-semibold text-foreground">
              {new Date(hash.generatedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
