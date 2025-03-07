import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Necessário para navegação
import { cn } from "@/lib/utils";
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
import axios from "axios"; // Importando o axios

interface LoginFormProps {
  className?: string;
  onLoginSuccess: () => void; // Função de sucesso após login
}

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Para indicar o carregamento
  const [error, setError] = useState(""); // Para capturar erros
  const navigate = useNavigate(); // Usado para navegação programática

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Inicia o carregamento

    try {
      // Envia as credenciais de login para a API usando axios
      const response = await axios.post(
        "https://10.101.200.180:7001/api/Auth/login",
        {
          email,
          password, // Corpo da requisição com email e senha
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Se a resposta for bem-sucedida, pode acessar a resposta da API
      const data = response.data;

      if (data.token) { // Supondo que a API retorne um token se o login for bem-sucedido
        onLoginSuccess(); // Chama a função para marcar como autenticado
        navigate("/home"); // Redireciona para a página de home
      } else {
        throw new Error("Credenciais inválidas.");
      }
    } catch (error: unknown) {
      // Aqui tratamos o erro de forma mais robusta
      if (axios.isAxiosError(error)) {
        // Se for erro do Axios, mostra detalhes da resposta
        console.error("Erro da API:", error.response?.data); // Log do erro para depuração
        setError(error.response?.data?.message || "Erro de rede. Tente novamente.");
      } else if (error instanceof Error) {
        // Se for erro do tipo JavaScript
        console.error("Erro JavaScript:", error.message); // Log do erro para depuração
        setError(error.message);
      } else {
        // Caso o erro seja de um tipo desconhecido
        console.error("Erro desconhecido");
        setError("Ocorreu um erro desconhecido. Tente novamente.");
      }
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 w-auto px-8 sm:px-16 lg:px-96 py-20", className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Digite seu e-mail abaixo para fazer login em sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="m@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                />
              </div>

              {/* Exibindo o erro, se houver */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Botão de login com carregamento */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Carregando..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
