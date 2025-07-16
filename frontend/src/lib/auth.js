import { setAuthToken } from "./apiClient";
import {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    USER_DATA_KEY,
    setCookie,
    getCookie,
    deleteCookie,
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    getAccessToken,
    getRefreshToken,
    clearStorage,
    ACTIVE_PLAN_KEY,
    USER_ROLE_KEY
} from "./auth-storage";

/**
 * Store authentication tokens and user data
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @param {Object} userData - User data object
 * @param {boolean} userData.isPlan - Plan status
 */
export const storeAuthData = (accessToken, refreshToken, userData) => {
    // Store tokens in localStorage (primary storage)
    setLocalStorage(ACCESS_TOKEN_KEY, accessToken);
    setLocalStorage(REFRESH_TOKEN_KEY, refreshToken);
    
    // Store user data in cookies (JSON stringified)
    if (userData) {
        setCookie(USER_DATA_KEY, JSON.stringify(userData), 7);
        if (userData.role) {
             setCookie(USER_ROLE_KEY, userData.role, 7);
        }
        // Handle plan status
        // Ensure strictly boolean or string representation
        const isPlan = userData.isPlan === true || userData.isPlan === "true";
        setCookie(ACTIVE_PLAN_KEY, isPlan, 7);
    }

    // Also store tokens in cookies (for SSR compatibility if needed)
    setCookie(ACCESS_TOKEN_KEY, accessToken, 7); // 7 days
    setCookie(REFRESH_TOKEN_KEY, refreshToken, 30); // 30 days for refresh token

    // Set token in axios headers
    setAuthToken(accessToken);
};

// Re-export getters for convenience
export { getAccessToken, getRefreshToken };

/**
 * Get user data from cookies
 * @returns {Object|null} User data object or null if not found
 */
export const getUserData = () => {
    const data = getCookie(USER_DATA_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

/**
 * Check if user is authenticated
 * Strictly requires the presence of an access token.
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    const token = getAccessToken();
    return !!token;
};

/**
 * Check if user has an active plan
 * Reads from cookie
 * @returns {boolean} 
 */
export const hasActivePlan = () => {
    const isPlan = getCookie(ACTIVE_PLAN_KEY);
    // Handle both boolean and string "true"/"false" from cookies
    return isPlan === true || isPlan === "true";
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
    clearStorage();
    // Specifically clear user data cookies
    deleteCookie(USER_DATA_KEY);
    deleteCookie(USER_ROLE_KEY);
    deleteCookie(ACTIVE_PLAN_KEY);
    
    // Clear axios headers
    setAuthToken(null);
};

/**
 * Initialize auth token on app load
 * This should be called when the app initializes
 */
export const initializeAuth = () => {
    const token = getAccessToken();
    if (token) {
        setAuthToken(token);
    }
};

/**
 * Get user role from cookie
 * @returns {string|null} 
 */
export const getUserRole = () => {
    return getCookie(USER_ROLE_KEY);
};

/**
 * Check if user is admin
 * @returns {boolean} 
 */
export const isAdmin = () => {
    return getUserRole() === "ADMIN";
};

/**
 * Check if user is student
 * @returns {boolean} 
 */
export const isStudent = () => {
    return getUserRole() === "STUDENT";
};

/**
 * Get dashboard route based on user role - needs role passed in or will default
 * @returns {string} Dashboard route
 */
export const getDashboardRoute = (role = null) => {
    const userRole = role || getUserRole();
    if (userRole === "ADMIN") {
        return "/dashboard/admin";
    } else if (userRole === "STUDENT") {
        return "/dashboard/student";
    }
    // Default fallback
    return "/dashboard/student"; 
};

/**
 * Logout user - Clear auth data and redirect to login
 * @param {Function} router - Next.js router (optional, for programmatic navigation)
 */
export const logout = (router = null) => {
    clearAuthData();

    if (typeof window !== "undefined") {
        if (router) {
            router.push("/signin");
        } else {
            window.location.href = "/signin";
        }
    }
};
