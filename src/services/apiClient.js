import axios from "axios";

/**
 * Axios instance for making API calls.
 * Automatically includes base URL and JSON headers.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — adds token dynamically if available
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Optional: Global response interceptor for automatic logout on 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      // You can also redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
