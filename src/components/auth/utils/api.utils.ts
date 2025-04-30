// src/features/auth/utils/api.utils.ts

import axios from "@/utils/axiosConfig";
import { ApiResponse } from "../types/auth.types";

/**
 * Faz uma chamada API com fallback para uma URL externa caso a interna falhe
 */
export const makeApiCallWithFallback = async (
  internalEndpoint: string,
  externalEndpoint: string,
  data: Record<string, any>,
  timeout: number = 20000
): Promise<ApiResponse> => {
  try {
    // Try internal API first
    const response = await axios.post(internalEndpoint, data, {
      headers: { "Content-Type": "application/json" },
      timeout,
    });
    return response;
  } catch (internalError) {
    // Fallback to external API
    const response = await axios.post(externalEndpoint, data, {
      headers: { "Content-Type": "application/json" },
      timeout,
    });
    return response;
  }
};