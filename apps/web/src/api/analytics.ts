import { apiClient } from "./client"
import type { DashboardSummary, TendenciaMensal } from "./types"

export const getDashboard = async () => {
  const res = await apiClient.get<DashboardSummary>("/api/dashboard")
  return res.data
}

export const getTendenciaLucro = async () => {
  const res = await apiClient.get<TendenciaMensal[]>("/api/analytics/tendencia-lucro")
  return res.data
}
