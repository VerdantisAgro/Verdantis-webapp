import { apiClient } from "./client"
import type { AuthResponse, Me } from "./types"

export const login = async (payload: { email: string; senha: string }) => {
  const res = await apiClient.post<AuthResponse>("/api/auth/login", payload)
  return res.data
}

export const register = async (payload: { nomeCompleto: string; email: string; cpf: string; senha: string }) => {
  const res = await apiClient.post<AuthResponse>("/api/auth/register", payload)
  return res.data
}

export const getMe = async () => {
  const res = await apiClient.get<Me>("/api/me")
  return res.data
}
