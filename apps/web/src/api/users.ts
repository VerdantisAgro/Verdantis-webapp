import { apiClient } from "./client";
import type { User, Paged } from "./types";

export const getUsers = async (page = 0, size = 10, sort?: string) => {
  const params: any = { page, size };
  if (sort) params.sort = sort;
  const res = await apiClient.get<Paged<User>>("/users", { params });
  return res.data;
};

export const getAllUsers = async () => {
  const res = await apiClient.get<User[]>("/users/all");
  return res.data;
};

export const getUserById = async (id: number) => {
  const res = await apiClient.get<User>(`/users/${id}`);
  return res.data;
};

export const createUser = async (payload: { userName: string; email: string; password: string; cpf: string; }) => {
  const res = await apiClient.post<User>(`/users`, payload);
  return res.data;
};

export default {
  getUsers,
  getAllUsers,
  getUserById,
  createUser,
};
