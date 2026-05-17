import { apiClient } from "./client";
import type { Lote, Evento } from "./types";

export const createLote = async (payload: { nomeLote: string; cultura: string; producaoTotal: number; custoTotal: number; precoVenda: number; }) => {
  const res = await apiClient.post("/lotes", payload);
  return res.status === 204 ? null : res.data;
};

export const getLotes = async () => {
  const res = await apiClient.get<Lote[]>("/lotes");
  return res.data;
};

export const getLoteById = async (id: number) => {
  const res = await apiClient.get<any>(`/lotes/${id}`);
  return res.data;
};

export const updateLote = async (id: number, payload: { nomeLote: string; cultura: string; producaoTotal: number; custoTotal: number; precoVenda: number }) => {
  const res = await apiClient.put(`/lotes/${id}`, payload);
  return res.data;
};

export const deleteLote = async (id: number) => {
  const res = await apiClient.delete(`/lotes/${id}`);
  return res.data;
};

export const getEventos = async (id: number) => {
  const res = await apiClient.get<Evento[]>(`/lotes/${id}/eventos`);
  return res.data;
};

export const postEvento = async (id: number, payload: Evento) => {
  const res = await apiClient.post(`/lotes/${id}/eventos`, payload);
  return res.status;
};

export const finalizarCultivo = async (id: number, payload: { nomeLote: string; cultura: string; producaoTotal: number; custoTotal: number; precoVenda: number; }) => {
  const res = await apiClient.post(`/lotes/${id}/finalizar-cultivo`, payload);
  return res.data;
};

export default {
  createLote,
  updateLote,
  getLotes,
  getLoteById,
  deleteLote,
  getEventos,
  postEvento,
  finalizarCultivo,
};
