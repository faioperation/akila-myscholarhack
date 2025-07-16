import { apiClient } from "@/lib/apiClient";

/**
 * Fetch student settings
 * @returns {Promise<Object>} The settings data
 */
export const getStudentSettings = async () => {
    const response = await apiClient.get("/student-settings");
    return response.data;
};

/**
 * Update/Upsert student settings
 * @param {Object} payload - The settings to update
 * @returns {Promise<Object>} The updated settings data
 */
export const updateStudentSettings = async (payload) => {
    const response = await apiClient.post("/student-settings/upsert", payload);
    return response.data;
};
