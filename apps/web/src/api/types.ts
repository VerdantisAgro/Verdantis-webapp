// Request and response shapes of the Verdantis Go API (apps/api).

export interface AuthResponse {
  token: string
  id: number
  name: string
  email: string
}

export interface Me {
  id: number
  nome: string
  email: string
  cpf: string
  criadoEm: string
}

export type LoteStatus = "ativo" | "finalizado"

export interface Lote {
  id: number
  nomeLote: string
  cultura: string
  variedade: string
  areaHectares: number
  dataPlantio: string | null
  previsaoColheita: string | null
  producaoTotal: number
  custoTotal: number
  precoVenda: number
  receita: number
  lucro: number
  status: LoteStatus
  codigoVerificacao: string | null
  hashFinal: string | null
  finalizadoEm: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface LoteInput {
  nomeLote: string
  cultura: string
  variedade?: string
  areaHectares?: number
  dataPlantio?: string | null
  previsaoColheita?: string | null
  producaoTotal: number
  custoTotal: number
  precoVenda: number
}

export interface Evento {
  id: number
  seq: number
  tipoEvento: string
  descricao: string
  ocorridoEm: string
  hashAnterior: string
  hash: string
}

export interface EventoInput {
  tipoEvento: string
  descricao: string
}

export interface Certificado {
  codigoVerificacao: string
  hashFinal: string
  assinatura: string
  finalizadoEm: string
  totalEventos: number
  urlVerificacao: string
}

export interface Verificacao {
  codigoVerificacao: string
  nomeLote: string
  cultura: string
  variedade: string
  areaHectares: number
  dataPlantio: string | null
  previsaoColheita: string | null
  produtor: string
  finalizadoEm: string | null
  hashFinal: string
  assinatura: string
  chavePublica: string
  cadeiaIntegra: boolean
  assinaturaValida: boolean
  eventos: Evento[]
}

export interface DashboardSummary {
  totalLotes: number
  lotesAtivos: number
  lotesFinalizados: number
  receitaTotal: number
  custoTotal: number
  lucroTotal: number
  culturaMaisRentavel: string
  loteMaisRentavel: string
}

export interface TendenciaMensal {
  mes: string
  receita: number
  custo: number
  lucro: number
}
