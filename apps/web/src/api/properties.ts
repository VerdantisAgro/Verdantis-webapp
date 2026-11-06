import { apiClient } from "./client";
import type { Property, Paged } from "./types";

export const getProperties = async (page = 0, size = 10) => {
  const res = await apiClient.get<Paged<Property>>("/properties", { params: { page, size } });
  return res.data;
};

export const getAllProperties = async () => {
  const res = await apiClient.get<Property[]>("/properties/all");
  return res.data;
};

export const getPropertyById = async (id: number) => {
  const res = await apiClient.get<Property>(`/properties/${id}`);
  return res.data;
};

export const createProperty = async (userId: number, payload: { propertyName: string }) => {
  const res = await apiClient.post<Property>(`/properties`, payload, { params: { userId } });
  return res.data;
};

export default { getProperties, getAllProperties, getPropertyById, createProperty };
