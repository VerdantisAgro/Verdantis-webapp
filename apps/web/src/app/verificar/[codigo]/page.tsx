"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { Leaf, ShieldCheck, ShieldAlert, Calendar, Sprout, User } from "lucide-react"
import { publicApi, type Verificacao } from "@/src/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { TraceabilityTimeline } from "@/src/components/traceability-timeline"
import { formatDate } from "@/src/lib/format"
import { mapApiEvento } from "@/src/lib/lotes"

type State =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error" }
  | { kind: "ok"; data: Verificacao }

function Check({ ok, okLabel, failLabel }: { ok: boolean; okLabel: string; failLabel: string }) {
  return (
    <Badge
      variant="outline"
      className={
        ok
          ? "border-green-500/30 bg-green-500/10 text-green-700"
          : "border-red-500/30 bg-red-500/10 text-red-700"
      }
    >
      {ok ? <ShieldCheck className="h-3.5 w-3.5 mr-1" /> : <ShieldAlert className="h-3.5 w-3.5 mr-1" />}
      {ok ? okLabel : failLabel}
    </Badge>
  )
}

export default function VerificarPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const [state, setState] = useState<State>({ kind: "loading" })

  useEffect(() => {
    ;(async () => {
      try {
        setState({ kind: "ok", data: await publicApi.getVerificacao(codigo) })
      } catch (err) {
        const notFound = axios.isAxiosError(err) && err.response?.status === 404
        setState({ kind: notFound ? "not-found" : "error" })
      }
    })()
  }, [codigo])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Verdantis</span>
          <span className="text-sm text-muted-foreground">· Verificacao de origem</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {state.kind === "loading" && <div className="h-48 rounded-lg bg-muted animate-pulse" />}

        {state.kind === "not-found" && (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <ShieldAlert className="h-10 w-10 text-red-600 mx-auto" />
              <p className="font-semibold text-foreground">Certificado nao encontrado</p>
              <p className="text-sm text-muted-foreground">Confira o codigo {codigo} ou escaneie o QR Code novamente.</p>
            </CardContent>
          </Card>
        )}

        {state.kind === "error" && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Nao foi possivel consultar o certificado agora. Tente novamente em instantes.
            </CardContent>
          </Card>
        )}

        {state.kind === "ok" && <Certificate data={state.data} />}
      </main>
    </div>
  )
}

function Certificate({ data }: { data: Verificacao }) {
  const valid = data.cadeiaIntegra && data.assinaturaValida
  const events = data.eventos.map((e) => mapApiEvento(e, data.codigoVerificacao))

  return (
    <>
      <Card className={valid ? "border-green-500/30" : "border-red-500/30"}>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Certificado {data.codigoVerificacao}</p>
              <h1 className="text-2xl font-bold text-foreground">
                {data.nomeLote} · {data.cultura}
              </h1>
              {data.variedade && <p className="text-sm text-muted-foreground">Variedade: {data.variedade}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Check ok={data.cadeiaIntegra} okLabel="Historico integro" failLabel="Historico alterado" />
              <Check ok={data.assinaturaValida} okLabel="Assinatura valida" failLabel="Assinatura invalida" />
            </div>
          </div>

          <p className={valid ? "text-sm text-green-700" : "text-sm text-red-700"}>
            {valid
              ? "Os registros abaixo sao os mesmos que o produtor selou ao finalizar o lote."
              : "Os registros nao conferem com o que foi selado. Nao confie neste certificado."}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" /> Produtor: <span className="text-foreground font-medium">{data.produtor}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sprout className="h-4 w-4" /> Plantio:{" "}
              <span className="text-foreground font-medium">
                {data.dataPlantio ? formatDate(`${data.dataPlantio}T00:00:00`) : "-"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> Finalizado:{" "}
              <span className="text-foreground font-medium">
                {data.finalizadoEm ? formatDate(data.finalizadoEm) : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historico do cultivo ({events.length} eventos)</CardTitle>
        </CardHeader>
        <CardContent>
          <TraceabilityTimeline events={events} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados tecnicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Hash final (SHA-256)</p>
            <code className="block bg-muted px-3 py-2 rounded-md break-all text-foreground">{data.hashFinal}</code>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Assinatura (Ed25519)</p>
            <code className="block bg-muted px-3 py-2 rounded-md break-all text-foreground">{data.assinatura}</code>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Chave publica</p>
            <code className="block bg-muted px-3 py-2 rounded-md break-all text-foreground">{data.chavePublica}</code>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
