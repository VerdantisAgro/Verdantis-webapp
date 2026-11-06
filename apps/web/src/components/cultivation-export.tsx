"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { FileText, QrCode, CheckCircle, Loader2, ExternalLink } from "lucide-react"
import { publicApi } from "@/src/api"
import type { Cultivo } from "@/src/types"

interface CultivationExportProps {
  cultivo: Cultivo
  farmerName: string
  onFinish: () => Promise<void>
}

function verificationPath(code: string) {
  return `/verificar/${code}`
}

function generateDocumentContent(cultivo: Cultivo, farmerName: string): string {
  const events = cultivo.events || []
  const eventList = events
    .map((e, i) => `${i + 1}. [${new Date(e.timestamp).toLocaleDateString("pt-BR")}] ${e.type}: ${e.description}`)
    .join("\n")
  const hash = cultivo.traceabilityHash
  const verificationUrl = hash ? `${window.location.origin}${verificationPath(hash.verificationCode)}` : ""

  return `
DOCUMENTO DE RASTREABILIDADE - CULTIVO
======================================

Cultivo
-------
Cultura: ${cultivo.name}
Variedade: ${cultivo.variety || "-"}
Lote: ${cultivo.lot}
Area: ${cultivo.area} hectares
Data de Plantio: ${cultivo.plantingDate || "-"}
Previsao de Colheita: ${cultivo.harvestDate || "-"}

Produtor
--------
Nome: ${farmerName}

Historico de Eventos (${events.length} registros)
-------------------------------------------------
${eventList || "Nenhum evento registrado"}

Certificado
-----------
Codigo: ${hash?.verificationCode ?? "Nao gerado"}
Hash final: ${hash?.hash ?? "Nao gerado"}
Finalizado em: ${hash ? new Date(hash.generatedAt).toLocaleDateString("pt-BR") : "-"}
Verifique em: ${verificationUrl || "-"}

======================================
Documento gerado pelo Verdantis
  `.trim()
}

function downloadAsText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function CultivationExport({ cultivo, farmerName, onFinish }: CultivationExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const events = cultivo.events || []
  const hash = cultivo.traceabilityHash

  const handleFinish = async () => {
    setIsGenerating(true)
    try {
      await onFinish()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    const content = generateDocumentContent(cultivo, farmerName)
    const filename = `rastreabilidade_${cultivo.lot.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`
    downloadAsText(content, filename)
  }

  if (cultivo.isComplete && hash) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Cultivo Finalizado</CardTitle>
          </div>
          <CardDescription>Certificado {hash.verificationCode}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicApi.qrCodeUrl(hash.verificationCode)}
                alt="QR Code de verificacao do lote"
                className="w-40 h-40"
              />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            O QR Code abre a pagina publica onde o comprador confere a origem do lote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={verificationPath(hash.verificationCode)} target="_blank" className="flex-1">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir verificacao
              </Button>
            </Link>
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <FileText className="h-4 w-4 mr-2" />
              Baixar relatorio (.txt)
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Registre pelo menos um evento antes de finalizar o cultivo.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Finalizar Cultivo
        </CardTitle>
        <CardDescription>Gere o certificado de origem com QR Code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Eventos registrados</span>
            <span className="font-medium text-foreground">{events.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Data de plantio</span>
            <span className="font-medium text-foreground">{cultivo.plantingDate || "-"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Produtor</span>
            <span className="font-medium text-foreground">{farmerName}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-700">
            Ao finalizar, a cadeia de eventos e selada e assinada. Nenhum evento podera ser adicionado depois.
          </p>
        </div>

        <Button className="w-full" onClick={handleFinish} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Cultivo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
