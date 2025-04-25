// ForgotPassword.tsx
import { useState, Fragment } from "react";
import axios from "axios";

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  validateEmail: (email: string) => boolean;
}

export function ChangePassword({ 
  isOpen,
  onClose,
  currentEmail, 
  validateEmail
}: ChangePasswordProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  
  // Set initial email when modal opens
  useState(() => {
    if (isOpen && currentEmail) {
      setEmail(currentEmail);
    }
  });

  const handleForgotPassword = async () => {
    let emailToReset = email || currentEmail;
    
    // Validate email
    if (!emailToReset || !validateEmail(emailToReset)) {
      alert("E-mail inválido ou vazio.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Tentativa na API interna
      try {
        const response = await axios.post(
          "/api/external/Auth/reset-password", 
          { email: emailToReset },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000
          }
        );
        
        if (response.status === 200) {
          alert("Link de redefinição de senha enviado com sucesso. Verifique seu e-mail.");
          onClose();
        } else {
          throw new Error("Resposta inesperada do servidor");
        }
      } catch (internalError) {
        // Fallback para API externa
        const response = await axios.post(
          "/api/external/Auth/reset-password", 
          { email: emailToReset },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000
          }
        );
        
        if (response.status === 200) {
          alert("Link de redefinição de senha enviado com sucesso. Verifique seu e-mail.");
          onClose();
        } else {
          throw new Error("Resposta inesperada do servidor");
        }
      }
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      
      let errorMessage = "Falha ao enviar e-mail de redefinição. Tente novamente mais tarde.";
      
      if (error.response) {
        // Tratamento de códigos de erro específicos
        if (error.response.status === 404) {
          errorMessage = "E-mail não encontrado no sistema.";
        } else if (error.response.status === 429) {
          errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Tempo de conexão esgotado. Verifique sua internet.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Servidor indisponível. Verifique sua conexão.";
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Modal backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Modal content */}
        <div 
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">Recuperação de Senha</h2>
          
          <p className="mb-4">
            Informe seu e-mail para receber um link de redefinição de senha.
          </p>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email || currentEmail}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? "Processando..." : "Enviar Link"}
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}