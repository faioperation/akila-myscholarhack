import { apiClient } from "@/lib/apiClient";

export const registerUser = async (payload) => {
  const response = await apiClient.post("/user/register", payload);
  return response.data;
};
