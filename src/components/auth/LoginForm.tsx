import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "../Dark-Mode/ModeToggle";
import LogoDark from "@/assets/logo.png";
import LogoLight from "@/assets/logoBranco.png";
import axios from "@/utils/axiosConfig";
import { FirstAcess } from "./FirstAcess";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TimeoutErrorModal } from "./TimeoutErrorModal";


// Types
interface UserData {
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

interface LoginFormProps {
  className?: string;
  onLoginSuccess: (userData: UserData) => void;
}

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

interface ApiResponse {
  data?: {
    token?: string;
    firstName?: string;
    lastName?: string;
    message?: string;
  };
  status: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status: number;
  };
  code?: string;
  message: string;
}

// Utility functions
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const showErrorToast = (title: string, description: string): void => {
  toast.error(title, {
    description,
    style: {
      backgroundColor: "white",
      color: "red",
      boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
    },
  });
};

const showSuccessToast = (title: string, description: string): void => {
  toast.success(title, {
    description,
    style: {
      backgroundColor: "white",
      color: "green",
      boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
    },
  });
};

// Helper function for API calls with fallback
const makeApiCallWithFallback = async (
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

// Helper function for error handling
const handleApiError = (error: ApiError): string => {
  if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
    return "E-mail ou senha inválidos, tente novamente.";
  } else if (error.response) {
    if (error.response.status === 404) {
      return "E-mail não encontrado no sistema.";
    } else if (error.response.status === 429) {
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    } else {
      return error.response.data?.message || `Erro ${error.response.status}`;
    }
  } else if (error.message.includes("Network Error")) {
    return "Servidor indisponível. Verifique sua conexão.";
  }
  return "Falha ao processar sua solicitação. Por favor, tente novamente.";
};

// Check if error is a timeout or connection error
const isTimeoutOrConnectionError = (error: ApiError): boolean => {
  return (
    error.code === "ECONNABORTED" ||
    error.message.includes("timeout") ||
    error.message.includes("Network Error")
  );
};

const ThemeAwareLogo: React.FC = () => {
  return (
    <div className="relative flex justify-center">
      <img src={LogoDark} alt="logo-login" className="max-w-72 dark:hidden" />
      <img
        src={LogoLight}
        alt="logo-login"
        className="max-w-72 hidden dark:block"
      />
    </div>
  );
};

// Componente de Modal para Esqueceu Senha
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  defaultEmail = "",
}) => {
  const [email, setEmail] = useState<string>(defaultEmail);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleForgotPassword = async (): Promise<void> => {
    let emailToReset = email;

    // Validate email
    if (!emailToReset || !validateEmail(emailToReset)) {
      showErrorToast("E-mail inválido", "Por favor, insira um e-mail válido para continuar");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await makeApiCallWithFallback(
        "/api/internal/Auth/reset-password",
        "/api/external/Auth/reset-password",
        { email: emailToReset },
        30000
      );

      if (response.status === 200) {
        showSuccessToast(
          "Solicitação enviada",
          "Link de acesso enviado com sucesso. Verifique seu e-mail."
        );
        onClose();
      } else {
        throw new Error("Resposta inesperada do servidor");
      }
    } catch (error) {
      const errorMessage = handleApiError(error as ApiError);
      showErrorToast("Falha na solicitação", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Recuperar Senha</DialogTitle>
        <DialogDescription>
          Digite seu e-mail para receber uma senha provisória.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            placeholder="m@example.com"
            onChange={(e) => setEmail(e.target.value)}
            disabled={isProcessing}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant={"bottomPassword"}
          onClick={handleForgotPassword}
          disabled={isProcessing}
          className="relative"
        >
          {isProcessing ? (
            <>
              <span className="opacity-0">Enviar</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            "Enviar Solicitação"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export const LoginForm: React.FC<LoginFormProps> = ({
  className,
  onLoginSuccess,
  ...props
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const [isFirstAccess, setIsFirstAccess] = useState<boolean>(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);
  const [timeoutErrorCount, setTimeoutErrorCount] = useState<number>(0);
  const [showSuggestionAlert, setShowSuggestionAlert] = useState<boolean>(false);
  // Novo estado para controlar o modal de timeout
  const [showTimeoutModal, setShowTimeoutModal] = useState<boolean>(false);
  const modeToggleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Reset timeout error count after 10 minutes
  useEffect(() => {
    if (timeoutErrorCount > 2) {
      const timer = setTimeout(() => {
        setTimeoutErrorCount(0);
      }, 10 * 60 * 1000); // 10 minutes
      return () => clearTimeout(timer);
    }
  }, [timeoutErrorCount]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      showErrorToast("Email inválido", "Por favor, insira um email válido para continuar");
      return;
    }

    if (!password) {
      setError("Por favor, insira sua senha");
      showErrorToast("Senha requerida", "Por favor, insira sua senha para continuar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await makeApiCallWithFallback(
        "/api/internal/Auth/login",
        "/api/external/Auth/login",
        { email, password }
      );

      if (response.data?.token) {
        const { token, firstName = "", lastName = "" } = response.data;

        // Reset error count on successful login
        setTimeoutErrorCount(0);
        setShowSuggestionAlert(false);
        
        // Armazenamento seguro do token
        localStorage.setItem("token", token);

        const login = email.split("@")[0];
        onLoginSuccess({
          login,
          email,
          firstName,
          lastName,
          token,
        });

        navigate("/inicio");
      } else {
        throw new Error("Token não encontrado na resposta");
      }
    } catch (error) {
      const typedError = error as ApiError;
      const errorMessage = handleApiError(typedError);
      setError(errorMessage);
      showErrorToast("Falha no login", errorMessage);
      
      // Check if it's a timeout or connection error
      if (isTimeoutOrConnectionError(typedError)) {
        const newCount = timeoutErrorCount + 1;
        setTimeoutErrorCount(newCount);
        
        // Mostrar modal somente após 3 erros consecutivos de timeout
        if (newCount >= 3) {
          setShowTimeoutModal(true);
        } else {
          // Para menos de 3 erros, mostrar apenas o alerta de sugestão
          setShowSuggestionAlert(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLoginWithFirstAccess = (email: string) => {
    // Em uma aplicação com roteamento, você poderia usar um hook de navegação aqui
    // Por exemplo: router.push('/login?firstAccess=true&email=' + encodeURIComponent(email));
    
    // Como este é um exemplo simplificado, vamos apenas definir os estados:
    setEmail(email);
    setIsFirstAccess(true);
    setShowTimeoutModal(false);
  };

  // Lógica de primeiro acesso - modificada para fechar o modal de timeout
  const handleRequestAccess = async (fromModal: boolean = false): Promise<void> => {
    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      showErrorToast("Email inválido", "Por favor, insira um email válido para solicitar acesso");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/external/Auth/reset-password",
        { email },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 20000,
        }
      );

      if (response.status === 200) {
        setError("");
        showSuccessToast(
          "Solicitação enviada com sucesso!",
          "Verifique seu e-mail para continuar. Redirecionando para o login..."
        );

        // Reset error count on successful request
        setTimeoutErrorCount(0);
        setShowSuggestionAlert(false);
        
        // Fechar o modal de timeout se estiver visível
        if (fromModal) {
          setShowTimeoutModal(false);
        }

        // Limpar o campo de email
        setEmail("");

        // Volta para o formulário de login normal após um breve delay
        setTimeout(() => {
          setIsFirstAccess(false);
        }, 1000);
      }
    } catch (error) {
      const typedError = error as ApiError;
      const errorMessage = handleApiError(typedError);
      setError(errorMessage);
      showErrorToast("Falha na solicitação", errorMessage);
      
      // Check if it's a timeout or connection error
      if (isTimeoutOrConnectionError(typedError)) {
        setTimeoutErrorCount(timeoutErrorCount + 1);
        // Se estiver no modal, mantém o modal aberto
        if (fromModal) {
          setShowTimeoutModal(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAccessToggle = (value: boolean): void => {
    setIsFirstAccess(value);
    setError(""); // Limpa erros ao alternar modos
    
    // Hide suggestion alert and timeout modal when toggling
    setShowSuggestionAlert(false);
    setShowTimeoutModal(false);
  };

  // Helper to handle opening the password recovery dialog
  const openForgotPassword = (fromModal: boolean = false): void => {
    setForgotPasswordOpen(true);
    setShowSuggestionAlert(false);
    
    // Fechar o modal de timeout se chamado a partir dele
    if (fromModal) {
      setShowTimeoutModal(false);
    }
  };

  // Função para lidar com o fechamento do modal de timeout
  const handleCloseTimeoutModal = (): void => {
    setShowTimeoutModal(false);
  };

  // Função para processar requisição de acesso do modal
  const handleRequestAccessFromModal = (): void => {
    handleRequestAccess(true);
  };

  // Função para abrir a recuperação de senha do modal
  const handleForgotPasswordFromModal = (): void => {
    openForgotPassword(true);
  };

  return (
    <>
      <div className="absolute right-4" ref={modeToggleRef}>
        <div className="relative">
          <div className="mt-5 ml-12">
            <ModeToggle />
          </div>
          {showTooltip && (
            <div className="absolute right-0 top-12 w-64 bg-background border border-border rounded-lg p-4 shadow-lg z-50">
              <div className="absolute -top-2 right-4 w-4 h-4 bg-background border-t border-l border-border transform rotate-45"></div>
              <div className="text-base font-medium mb-1">Alternar Tema</div>
              <div className="text-sm text-muted-foreground">
                Este botão permite mudar entre o tema claro e escuro do site.
              </div>
              <div className="mt-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTooltip(false)}
                  className="text-xs"
                >
                  Entendi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Timeout Error */}
      <TimeoutErrorModal
        isOpen={showTimeoutModal}
        onClose={handleCloseTimeoutModal}
        email={email}
        onEmailChange={setEmail}
        onRequestAccess={handleRequestAccessFromModal}
        onForgotPassword={handleForgotPasswordFromModal}
        loading={loading}
        navigateToLoginWithFirstAccess={navigateToLoginWithFirstAccess}
      />

      <div
        className={`flex flex-col gap-6 w-auto px-8 sm:px-16 lg:px-96 py-10  ${
          loading ? "opacity-70 pointer-events-none" : ""
        }`}
        {...props}
      >
        <div className="flex justify-center mt-7">
          <ThemeAwareLogo />
        </div>
        
        {/* Alert agora só aparece em situações não relacionadas a timeout */}
        {showSuggestionAlert && !showTimeoutModal && (
          <Alert variant="destructive" className="mb-2 animate-in fade-in duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dificuldades para acessar?</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Estamos com dificuldades para conectar. Você tem algumas opções:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                {!isFirstAccess && (
                  <li>Se este é seu primeiro acesso, clique no botão 
                    <Button 
                      variant="link" 
                      className="px-1 py-0 h-auto text-white underline"
                      onClick={() => handleFirstAccessToggle(true)}
                    >
                      Primeiro Acesso
                    </Button>
                    no canto superior direito
                  </li>
                )}
                <li>Verifique se o e-mail e senha estão corretos</li>
                <li>
                  <Button 
                    variant="link" 
                    className="px-0 py-0 h-auto text-white underline"
                    onClick={() => openForgotPassword()}
                  >
                    Clique aqui
                  </Button> para solicitar uma senha provisória
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Resto do código permanece o mesmo */}
        <Card>
          <div className="absolute top-42 right-95 mt-4 mr-4">
            <FirstAcess
              onToggle={handleFirstAccessToggle}
              isFirstAccess={isFirstAccess}
            />
          </div>

          <CardHeader>
            <AnimatePresence mode="wait">
              <motion.div
                key={isFirstAccess ? "first-access" : "login"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardTitle className="text-2xl">
                  {isFirstAccess ? "Primeiro Acesso" : "Login"}
                </CardTitle>
                <CardDescription>
                  {isFirstAccess
                    ? "Digite seu e-mail abaixo para solicitar acesso"
                    : "Digite seu e-mail abaixo para fazer login em sua conta"}
                </CardDescription>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={isFirstAccess ? "first-access-form" : "login-form"}
                initial={{ opacity: 0, x: isFirstAccess ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isFirstAccess ? 100 : -100 }}
                transition={{ duration: 0.3 }}
              >
                {isFirstAccess ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleRequestAccess(false); }}>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          placeholder="m@example.com"
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm animate-pulse">
                          {error}
                        </p>
                      )}

                      <div className="w-full">
                        <Button
                          type="submit"
                          className="w-full relative"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="opacity-0">
                                Enviar Solicitação
                              </span>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              </div>
                            </>
                          ) : (
                            "Enviar Solicitação"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          placeholder="m@example.com"
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="grid">
                        <div className="flex justify-between">
                          <Label htmlFor="password">Senha</Label>
                          <Dialog
                            open={forgotPasswordOpen}
                            onOpenChange={setForgotPasswordOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="link"
                                className="px-0 font-norma cursor-pointer"
                                type="button"
                                onClick={() => setForgotPasswordOpen(true)}
                              >
                                Esqueceu sua senha?
                              </Button>
                            </DialogTrigger>
                            <ForgotPasswordModal
                              isOpen={forgotPasswordOpen}
                              onClose={() => setForgotPasswordOpen(false)}
                              defaultEmail={email}
                            />
                          </Dialog>
                        </div>
                        <Input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          id="password"
                          type="password"
                          placeholder="Digite sua senha.."
                          disabled={loading}
                        />
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm animate-pulse">
                          {error}
                        </p>
                      )}

                      <div className="w-full">
                        <Button
                          type="submit"
                          className="w-full relative cursor-pointer"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="opacity-0">Login</span>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
                              </div>
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </>
  );
};