// src/utils/axiosConfig.ts
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create();

// Define error response interface
interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError): Promise<never> => {
    // Handle expired token (usually 401 Unauthorized)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      toast.error("Sessão expirada", {
        description: "Sua sessão expirou. Por favor, faça login novamente."
      });

      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authData");

      // Redirect to login page
      window.location.href = "/login";
    }

    // Special handling for 500 errors with empty responses
    if (error.response?.status === 500) {
      const hasValidErrorMessage =
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof (error.response.data as ErrorResponse).message === 'string';

      if (!hasValidErrorMessage) {
        // Create a valid error response object
        error.response.data = {
          message: "E-mail ou senha inválidos, tente novamente."
        } as ErrorResponse;
      }
    }



    return Promise.reject(error);
  }
);

export default axiosInstance;