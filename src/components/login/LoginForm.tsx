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
  const navigate = useNavigate(); // Usado para navegação programática

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulando a validação de login
    if (email === "user@example.com" && password === "password123") {
      onLoginSuccess(); // Chama a função para marcar como autenticado
      navigate("/home"); // Redireciona para a página de home
    } else {
      alert("Credenciais inválidas. Tente novamente.");
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
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
