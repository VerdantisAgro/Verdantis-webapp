import { apiClient } from "./client";
import type { Dashboard } from "./types";

export const getDashboard = async () => {
  const res = await apiClient.get<Dashboard>("/dashboard");
  return res.data;
};

export default { getDashboard };
