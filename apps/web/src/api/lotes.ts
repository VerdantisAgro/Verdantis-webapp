import { apiClient } from "./client"
import type { Certificado, Evento, EventoInput, Lote, LoteInput } from "./types"

export const getLotes = async () => {
  const res = await apiClient.get<Lote[]>("/api/lotes")
  return res.data
}

export const getLoteById = async (id: number | string) => {
  const res = await apiClient.get<Lote>(`/api/lotes/${id}`)
  return res.data
}

export const createLote = async (payload: LoteInput) => {
  const res = await apiClient.post<Lote>("/api/lotes", payload)
  return res.data
}

export const updateLote = async (id: number | string, payload: LoteInput) => {
  const res = await apiClient.put<Lote>(`/api/lotes/${id}`, payload)
  return res.data
}

export const deleteLote = async (id: number | string) => {
  await apiClient.delete(`/api/lotes/${id}`)
}

export const getEventos = async (id: number | string) => {
  const res = await apiClient.get<Evento[]>(`/api/lotes/${id}/eventos`)
  return res.data
}

export const postEvento = async (id: number | string, payload: EventoInput) => {
  const res = await apiClient.post<Evento>(`/api/lotes/${id}/eventos`, payload)
  return res.data
}

export const finalizar = async (id: number | string) => {
  const res = await apiClient.post<Certificado>(`/api/lotes/${id}/finalizar`)
  return res.data
}

// Keeps every field of an existing lote so a partial edit does not erase the others.
export const toLoteInput = (lote: Lote): LoteInput => ({
  nomeLote: lote.nomeLote,
  cultura: lote.cultura,
  variedade: lote.variedade,
  areaHectares: lote.areaHectares,
  dataPlantio: lote.dataPlantio,
  previsaoColheita: lote.previsaoColheita,
  producaoTotal: lote.producaoTotal,
  custoTotal: lote.custoTotal,
  precoVenda: lote.precoVenda,
})
