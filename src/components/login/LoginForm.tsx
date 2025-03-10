import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

interface LoginFormProps {
  className?: string;
  onLoginSuccess: (userData: { login: string, email: string, firstName: string, lastName: string }) => void;
}

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://10.101.200.180:7001/api/Auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const login = email.split('@')[0]; // Pega a parte do email antes do @
        const { firstName, lastName } = response.data; // Assume que esses dados vêm da API

        // Passa os dados do usuário para o componente pai
        onLoginSuccess({
          login,
          email,
          firstName,
          lastName,
        });

        navigate("/home");
      } else {
        throw new Error("Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Falha no login. Verifique suas credenciais e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-6 w-auto px-8 sm:px-16 lg:px-96 py-20"
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

              {error && <p className="text-red-500 text-sm">{error}</p>}

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
