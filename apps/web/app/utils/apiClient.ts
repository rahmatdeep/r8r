import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const token = session?.accessToken || (session as any)?.token;

    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access - redirecting to login");
      // You could redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
