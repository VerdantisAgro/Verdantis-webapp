import { apiClient } from "./client";
import type { SimulacaoRequest, SimulacaoResponse } from "./types";

export const postSimulacoes = async (payload: SimulacaoRequest) => {
  const res = await apiClient.post<SimulacaoResponse>("/simulacoes", payload);
  return res.data;
};

export const getLotesExistentes = async () => {
  const res = await apiClient.get<any[]>("/simulacoes/lotes-existentes");
  return res.data;
};

export default { postSimulacoes, getLotesExistentes };
