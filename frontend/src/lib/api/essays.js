import { apiClient } from "@/lib/apiClient";

export const getEssays = async () => {
  const response = await apiClient.get("/essays");
  return response.data;
};

export const getEssayById = async (id) => {
  const response = await apiClient.get(`/essays/${id}`);
  return response.data;
};

export const saveEssay = async (payload) => {
  const response = await apiClient.post("/essays", payload);
  return response.data;
};
