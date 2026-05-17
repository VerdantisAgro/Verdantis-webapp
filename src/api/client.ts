import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://vitsapi.onrender.com/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default apiClient;
