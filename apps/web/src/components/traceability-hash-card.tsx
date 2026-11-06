"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Copy, ShieldCheck } from "lucide-react"
import { useState } from "react"
import type { TraceabilityHash } from "@/src/types"

interface TraceabilityHashCardProps {
  hash: TraceabilityHash
}

export function TraceabilityHashCard({ hash }: TraceabilityHashCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash.hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Hash de rastreabilidade
          </CardTitle>
          <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-700 text-xs">
            Completo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Hash gerado</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono text-foreground break-all">
              {hash.hash}
            </code>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Copiar hash</span>
            </Button>
          </div>
          {copied && <p className="text-xs text-green-600">Hash copiado!</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
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
