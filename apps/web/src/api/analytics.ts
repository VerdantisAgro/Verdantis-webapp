import { apiClient } from "./client";

export const getCotacoes = async () => {
  const res = await apiClient.get("/analytics/cotacoes");
  return res.data;
};

export const postComparativoLotes = async (payload: { lotIds: number[] }) => {
  const res = await apiClient.post("/analytics/comparativo-lotes", payload);
  return res.data;
};

export const postComparativoCulturas = async (payload: { culturas: string[] }) => {
  const res = await apiClient.post("/analytics/comparativo-culturas", payload);
  return res.data;
};

export const getCustoReceita = async () => {
  const res = await apiClient.get("/analytics/custo-receita");
  return res.data;
};

export const getTendenciaLucro = async () => {
  const res = await apiClient.get("/analytics/tendencia-lucro");
  return res.data;
};

export default { getCotacoes, postComparativoLotes, postComparativoCulturas, getCustoReceita, getTendenciaLucro };
