// src/features/auth/utils/error.utils.ts

import { ApiError } from "../types/auth.types";

/**
 * Processa erros de API e retorna mensagens amigáveis
 */
export const handleApiError = (error: ApiError): string => {
  if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
    return "E-mail ou senha inválidos, tente novamente.";
  } else if (error.response) {
    // Handle 500 error
    if (error.response.status === 500) {
      // Check if data exists and has a message
      if (
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        return error.response.data.message;
      }
      // If data is empty or not an object with message
      return "E-mail ou senha inválidos, tente novamente.";
    } else if (error.response.status === 404) {
      return "E-mail não encontrado no sistema.";
    } else if (error.response.status === 429) {
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    } else {
      // Safely check if data has a message
      if (
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        return error.response.data.message;
      }
      return `Erro ${error.response.status}`;
    }
  } else if (error.message.includes("Network Error")) {
    return "Servidor indisponível. Verifique sua conexão.";
  }
  return "Falha ao processar sua solicitação. Por favor, tente novamente.";
};

/**
 * Processa erros específicos de primeiro acesso
 */
export const handleFirstAccessError = (error: ApiError): string => {
  // Erros específicos para o primeiro acesso
  if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
    return "Seu e-mail não foi encontrado no sistema, verifique se digitou corretamente e tente novamente.";
  } else if (error.response) {
    if (error.response.status === 404) {
      return "E-mail não encontrado no sistema. Verifique se digitou corretamente.";
    } else if (error.response.status === 409) {
      return "Este e-mail já possui acesso. Por favor, use a opção 'Esqueceu sua senha?' se necessário.";
    } else if (error.response.status === 429) {
      return "Muitas solicitações. Por favor, aguarde alguns minutos antes de tentar novamente.";
    } else if (error.response.status === 500) {
      return "Erro interno ao processar sua solicitação de primeiro acesso. Por favor, tente novamente mais tarde.";
    }
    
    // Verificação segura para mensagens customizadas da API
    if (
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
    ) {
      return error.response.data.message;
    }
  } else if (error.message.includes("Network Error")) {
    return "Servidor indisponível. Verifique sua conexão e tente novamente mais tarde.";
  }
  
  return "Não foi possível processar sua solicitação de primeiro acesso. Por favor, tente novamente.";
};

/**
 * Verifica se o erro requer exibição do modal de timeout
 */
export const isErrorRequiringModal = (error: ApiError): boolean => {
  return (
    error.code === "ECONNABORTED" ||
    error.message.includes("timeout") ||
    error.message.includes("Network Error") ||
    !!(error.response && error.response.status === 500)
  );
};