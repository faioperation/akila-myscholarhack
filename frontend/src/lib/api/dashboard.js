import { apiClient } from "@/lib/apiClient";

/**
 * Fetch student dashboard statistics
 * @returns {Promise<Object>} The dashboard stats data
 */
export const getDashboardStats = async () => {
    const response = await apiClient.get("/dashboard-stats");
    return response.data;
};
