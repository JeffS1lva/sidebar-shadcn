#Acesso administrativo pelo dominio do e-mail.


import { useState, useRef, useEffect } from "react";
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

const ThemeAwareLogo = () => {
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

// Componente de Modal para Esqueceu Senha
const ForgotPasswordModal = ({
  onClose,
  defaultEmail = "",
  validateEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  validateEmail: (email: string) => boolean;
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleForgotPassword = async () => {
    let emailToReset = email;

    // Validate email
    if (!emailToReset || !validateEmail(emailToReset)) {
      toast.error("E-mail inválido", {
        description: "Por favor, insira um e-mail válido para continuar",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Tentativa na API interna
      try {
        const response = await axios.post(
          "/api/internal/Auth/reset-password",
          { email: emailToReset },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          }
        );

        if (response.status === 200) {
          toast.success("Solicitação enviada", {
            description:
              "Link de acesso enviado com sucesso. Verifique seu e-mail.",
            style: {
              backgroundColor: "white",
              color: "green",
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            },
          });
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
            timeout: 30000,
          }
        );

        if (response.status === 200) {
          toast.success("Solicitação enviada", {
            description:
              "Link de redefinição de senha enviado com sucesso. Verifique seu e-mail.",
            style: {
              backgroundColor: "white",
              color: "green",
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            },
          });
          onClose();
        } else {
          throw new Error("Resposta inesperada do servidor");
        }
      }
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);

      let errorMessage =
        "Falha ao enviar e-mail de redefinição. Tente novamente mais tarde.";

      if (error.response) {
        // Tratamento de códigos de erro específicos
        if (error.response.status === 404) {
          errorMessage = "E-mail não encontrado no sistema.";
        } else if (error.response.status === 429) {
          errorMessage =
            "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Tempo de conexão esgotado. Verifique sua internet.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Servidor indisponível. Verifique sua conexão.";
      }

      toast.error("Falha na solicitação", {
        description: errorMessage,
        style: {
          backgroundColor: "white",
          color: "red",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
        },
      });
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

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(true);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isAdminAccess, setIsAdminAccess] = useState(false);
  const modeToggleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Verificar se é um e-mail administrativo cada vez que o e-mail muda
  useEffect(() => {
    const isAdmin = email.toLowerCase().endsWith("@polarfix.com.br");
    setIsAdminAccess(isAdmin);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      toast.error("Email inválido", {
        description: "Por favor, insira um email válido para continuar",
      });
      return;
    }

    if (!password) {
      setError("Por favor, insira sua senha");
      toast.error("Senha requerida", {
        description: "Por favor, insira sua senha para continuar",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Primeiro tentamos a API interna
      let response;
      try {
        response = await axios.post(
          "/api/internal/Auth/login",
          { email, password },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 20000, // Timeout curto para tentativa interna
          }
        );
      } catch (internalError) {
        // Fallback para API externa
        response = await axios.post(
          "/api/external/Auth/login",
          { email, password },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 20000,
          }
        );
      }

      if (response.data?.token) {
        const { token, firstName = "", lastName = "" } = response.data;

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
        throw new Error();
      }
    } catch (error: any) {
      console.error("Erro completo:", {
        message: error.message,
        config: error.config,
        response: error.response?.data,
      });

      let errorMessage = "Falha no login, tente novamente";

      if (error.response) {
        // Erros 4xx/5xx
        errorMessage =
          error.response.data?.message || `Erro ${error.response.status}`;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Tempo de conexão esgotado";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Servidor indisponível. Verifique sua conexão.";
      }

      setError(errorMessage);
      toast.error("Falha no login", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Lógica de primeiro acesso
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      toast.error("Email inválido", {
        description: "Por favor, insira um email válido para solicitar acesso",
      });
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
        // Usar toast ao invés de alert
        toast.success("Solicitação enviada com sucesso!", {
          description:
            "Verifique seu e-mail para continuar. Redirecionando para o login...",
          style: {
            backgroundColor: "white",
            color: "green",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
          },
          duration: 5000,
        });

        // Limpar o campo de email
        setEmail("");

        // Volta para o formulário de login normal após um breve delay para que o usuário veja o toast
        setTimeout(() => {
          setIsFirstAccess(false);
        }, 1000);
      }
    } catch (requestError: any) {
      let errorMessage = "E-mail inválido";

      if (requestError.response) {
        if (requestError.response.status === 404) {
          errorMessage = "E-mail não cadastrado ou incorreto.";
        } else {
          errorMessage =
            requestError.response.data?.message ||
            `Erro ${requestError.response.status}`;
        }
      } else if (requestError.code === "ECONNABORTED") {
        errorMessage = "Tempo de conexão esgotado";
      } else if (requestError.message.includes("Network Error")) {
        errorMessage = "Servidor indisponível. Verifique sua conexão.";
      }

      setError(errorMessage);
      toast.error("Falha na solicitação", {
        description: errorMessage,
        style: {
          backgroundColor: "white",
          color: "red",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAccessToggle = (value: boolean) => {
    setIsFirstAccess(value);
    setError(""); // Limpa erros ao alternar modos
  };

  // Determine o título e a descrição com base no estado isAdminAccess
  const getTitle = () => {
    if (isFirstAccess) return "Primeiro Acesso";
    if (isAdminAccess) return "Acesso Administrativo";
    return "Login";
  };

  const getDescription = () => {
    if (isFirstAccess) return "Digite seu e-mail abaixo para solicitar acesso";
    if (isAdminAccess) return "Área restrita para administradores do sistema";
    return "Digite seu e-mail abaixo para fazer login em sua conta";
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

      <div
        className={`flex flex-col gap-6 w-auto px-8 sm:px-16 lg:px-96 py-10  ${
          loading ? "opacity-70 pointer-events-none" : ""
        }`}
        {...props}
      >
        <div className="flex justify-center mt-7">
          <ThemeAwareLogo />
        </div>
        <Card>
          {/* Mode switch moved to top of card */}
          <div className="absolute top-42 right-95 mt-4 mr-4">
            <FirstAcess
              onToggle={handleFirstAccessToggle}
              isFirstAccess={isFirstAccess}
            />
          </div>

          <CardHeader>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${isFirstAccess ? "first-access" : "login"}-${isAdminAccess ? "admin" : "normal"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardTitle className="text-2xl">
                  {getTitle()}
                </CardTitle>
                <CardDescription>
                  {getDescription()}
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
                  <form onSubmit={handleRequestAccess}>
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
                          placeholder={isAdminAccess ? "admin@polarfix.com.br" : "m@example.com"}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          className={isAdminAccess ? "border-blue-500 focus:ring-blue-500" : ""}
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
                              validateEmail={validateEmail}
                            />
                          </Dialog>
                        </div>
                        <Input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          id="password"
                          type="password"
                          placeholder="Digite sua senha.."
                          required
                          disabled={loading}
                          className={isAdminAccess ? "border-blue-500 focus:ring-blue-500" : ""}
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
                          className={`w-full relative cursor-pointer ${
                            isAdminAccess ? "bg-blue-600 hover:bg-blue-700" : ""
                          }`}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="opacity-0">
                                {isAdminAccess ? "Acessar" : "Login"}
                              </span>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
                              </div>
                            </>
                          ) : (
                            isAdminAccess ? "Acessar Sistema" : "Login"
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
}