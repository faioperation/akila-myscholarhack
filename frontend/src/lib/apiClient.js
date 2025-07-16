import axios from "axios";
import { getAccessToken, clearStorage } from "./auth-storage";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (!token) {
    delete apiClient.defaults.headers.common.Authorization;
    return;
  }

  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

// Initialize auth token on client side
if (typeof window !== "undefined") {
  const token = getAccessToken();
  if (token) {
    setAuthToken(token);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response) {
      // Handle 401 Unauthorized - Clear auth and redirect to login
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          clearStorage();
          setAuthToken(null);
          // Only redirect if not already on auth pages AND not explicitly skipped
          if (!window.location.pathname.startsWith("/signin") &&
            !window.location.pathname.startsWith("/register") && 
            !error.config?._skipAuthRedirect) {
            window.location.href = "/signin";
          }
        }
      }

      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || error.message,
      });
    }

    return Promise.reject({
      status: 0,
      data: null,
      message: error?.message || "Network error",
    });
  }
);
