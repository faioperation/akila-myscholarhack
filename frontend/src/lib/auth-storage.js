export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_DATA_KEY = "userData";
export const USER_ROLE_KEY = "userRole";
export const ACTIVE_PLAN_KEY = "activePlan";

/**
 * Set a cookie with the given name, value, and expiration days
 */
export const setCookie = (name, value, days = 7) => {
    if (typeof window === "undefined") return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name) => {
    if (typeof window === "undefined") return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name) => {
    if (typeof window === "undefined") return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Set item in localStorage
 */
export const setLocalStorage = (key, value) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) { }
};

/**
 * Get item from localStorage
 */
export const getLocalStorage = (key) => {
    if (typeof window === "undefined") return null;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        return null;
    }
};

/**
 * Remove item from localStorage
 */
export const removeLocalStorage = (key) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(key);
    } catch (error) { }
};

/**
 * Get access token from storage
 */
export const getAccessToken = () => {
    return getLocalStorage(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from storage
 */
export const getRefreshToken = () => {
    return getLocalStorage(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
};

/**
 * Get user data from storage
 */
export const getUserData = () => {
    return getLocalStorage(USER_DATA_KEY);
};

/**
 * Clear all authentication storage and all cookies
 */
export const clearStorage = () => {
    removeLocalStorage(ACCESS_TOKEN_KEY);
    removeLocalStorage(REFRESH_TOKEN_KEY);
    removeLocalStorage(USER_DATA_KEY);

    if (typeof window !== "undefined") {
        const cookies = document.cookie.split(";");
        const domain = window.location.hostname;
        const mainDomain = domain.split('.').slice(-2).join('.');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

            if (name) {
                // Try multiple ways to clear the cookie to be sure
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${domain};`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${domain};`;

                if (mainDomain && mainDomain !== domain) {
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${mainDomain};`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${mainDomain};`;
                }
            }
        }
    }
};
