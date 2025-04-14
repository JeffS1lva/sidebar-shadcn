// src/utils/axiosConfig.js
import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance
const axiosInstance = axios.create();

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
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
    
    return Promise.reject(error);
  }
);

export default axiosInstance;