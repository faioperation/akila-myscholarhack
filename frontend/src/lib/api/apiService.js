import { apiClient } from "@/lib/apiClient";
/**
 * Generic GET request
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @param {Object} config - Axios config
 * @returns {Promise} API response
 */
export const apiGet = async (endpoint, params = {}, config = {}) => {
    const response = await apiClient.get(endpoint, { params, ...config });
    return response.data;
};

/**
 * Generic POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} config - Axios config
 * @returns {Promise} API response
 */
export const apiPost = async (endpoint, body = {}, config = {}) => {
    const response = await apiClient.post(endpoint, body, config);
    return response.data;
};

/**
 * Generic PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} config - Axios config
 * @returns {Promise} API response
 */
export const apiPut = async (endpoint, body = {}, config = {}) => {
    const response = await apiClient.put(endpoint, body, config);
    return response.data;
};

/**
 * Generic UPDATE request (PUT alias)
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} config - Axios config
 * @returns {Promise} API response
 */
export const apiUpdate = async (endpoint, body = {}, config = {}) => {
    const response = await apiClient.put(endpoint, body, config);
    return response.data;
};

/**
 * Generic PATCH request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} config - Axios config
 * @returns {Promise} API response
 */
export const apiPatch = async (endpoint, body = {}, config = {}) => {

    const response = await apiClient.patch(endpoint, body, config);
    return response.data;
};

/**
 * Generic DELETE request
 * @param {string} endpoint - API endpoint
 * @param {Object} config - Axios config
 * @returns {Promise} API response
 */
export const apiDelete = async (endpoint, config = {}) => {
    const response = await apiClient.delete(endpoint, config);
    return response.data;
};
