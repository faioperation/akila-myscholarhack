import { apiClient } from "@/lib/apiClient";

export const getScholarships = async () => {
  const response = await apiClient.get("/scholarships");
  return response.data;
};

export const getScholarshipById = async (id) => {
  const response = await apiClient.get(`/scholarships/${id}`);
  return response.data;
};

export const createScholarship = async (payload) => {
  const response = await apiClient.post("/scholarships", payload);
  return response.data;
};
