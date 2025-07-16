import { apiClient } from "@/lib/apiClient";

/**
 * Fetch student subscriptions
 * @returns {Promise<Object>} The subscriptions data
 */
export const getStudentSubscriptions = async () => {
    const response = await apiClient.get("/subscription-student/me");
        
    return response.data;
};
/**
 * Fetch all subscription plans
 * @returns {Promise<Object>} The plans data
 */
export const getAllPlans = async () => {
    const response = await apiClient.get("/subscription-student/all-plan");
    return response.data;
};
