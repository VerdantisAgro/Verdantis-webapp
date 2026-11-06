import { apiClient } from "./client"
import type { Verificacao } from "./types"

export const getVerificacao = async (codigo: string) => {
  const res = await apiClient.get<Verificacao>(`/api/public/verificacao/${encodeURIComponent(codigo)}`)
  return res.data
}

export const qrCodeUrl = (codigo: string) =>
  `${apiClient.defaults.baseURL}/api/public/verificacao/${encodeURIComponent(codigo)}/qrcode.png`
