"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { FileText, FileDown, QrCode, CheckCircle, Loader2 } from "lucide-react"
import type { Cultivo, TraceabilityEvent } from "@/src/types"

interface CultivationExportProps {
  cultivo: Cultivo
  farmerName: string
  onFinish: () => void
}

// Simple QR Code generation using a free API
function generateQRCodeUrl(data: string): string {
  const encodedData = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`
}

// Generate document content
function generateDocumentContent(cultivo: Cultivo, farmerName: string): string {
  const events = cultivo.events || []
  const eventList = events.map((e, i) => {
    const date = new Date(e.timestamp)
    return `${i + 1}. [${date.toLocaleDateString("pt-BR")}] ${e.type}: ${e.description}`
  }).join("\n")

  return `
DOCUMENTO DE RASTREABILIDADE - CULTIVO
======================================

Informacoes do Cultivo
----------------------
Cultura: ${cultivo.name}
Variedade: ${cultivo.variety}
Lote: ${cultivo.lot}
Area: ${cultivo.area} hectares
Produtividade Esperada: ${cultivo.expectedYield} sc/ha

Datas
-----
Data de Plantio: ${cultivo.plantingDate}
Data Prevista de Colheita: ${cultivo.harvestDate}
${cultivo.actualYield ? `Produtividade Real: ${cultivo.actualYield} sc/ha` : ""}

Produtor
--------
Nome: ${farmerName}

Historico de Eventos (${events.length} registros)
-------------------------------------------------
${eventList || "Nenhum evento registrado"}

Hash de Rastreabilidade
-----------------------
${cultivo.traceabilityHash?.hash || "Nao gerado"}
Gerado em: ${cultivo.traceabilityHash ? new Date(cultivo.traceabilityHash.generatedAt).toLocaleDateString("pt-BR") : "N/A"}

======================================
Documento gerado automaticamente pelo Verdantis
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
  const [isGenerated, setIsGenerated] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const events = cultivo.events || []
  const hasEvents = events.length > 0

  const handleGenerateDocument = async () => {
    setIsGenerating(true)
    
    // Generate QR code data from events chain
    const eventChain = events.map(e => `${e.type}:${e.description}:${new Date(e.timestamp).getTime()}`).join("|")
    const qrData = JSON.stringify({
      cultivation: cultivo.name,
      lot: cultivo.lot,
      variety: cultivo.variety,
      plantingDate: cultivo.plantingDate,
      harvestDate: cultivo.harvestDate,
      eventCount: events.length,
      hash: cultivo.traceabilityHash?.hash || "pending",
      eventChain: eventChain.slice(0, 500) // Limit for QR code
    })
    
    setQrCodeUrl(generateQRCodeUrl(qrData))
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsGenerating(false)
    setIsGenerated(true)
    onFinish()
  }

  const handleDownload = () => {
    const content = generateDocumentContent(cultivo, farmerName)
    const filename = `rastreabilidade_${cultivo.lot.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`
    downloadAsText(content, filename)
  }

  if (!hasEvents) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Registre pelo menos um evento antes de finalizar o cultivo.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isGenerated) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Cultivo Finalizado</CardTitle>
          </div>
          <CardDescription>
            Documento de rastreabilidade gerado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCodeUrl && (
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code de Rastreabilidade"
                  className="w-40 h-40"
                />
              </div>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            <p>QR Code contendo o historico de eventos</p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleDownload("pdf")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleDownload("docx")}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Baixar DOCX
            </Button>
          </div>
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
        <CardDescription>
          Gere o documento de rastreabilidade com QR Code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Eventos registrados</span>
            <span className="font-medium text-foreground">{events.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Data de plantio</span>
            <span className="font-medium text-foreground">{cultivo.plantingDate}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Previsao de colheita</span>
            <span className="font-medium text-foreground">{cultivo.harvestDate}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Produtor</span>
            <span className="font-medium text-foreground">{farmerName}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-700">
            Ao finalizar, sera gerado um documento com todo o historico de eventos, 
            datas e um QR Code para verificacao. Esta acao nao pode ser desfeita.
          </p>
        </div>

        <Button 
          className="w-full" 
          onClick={handleGenerateDocument}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando documento...
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
