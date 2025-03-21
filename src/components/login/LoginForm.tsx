import { useState, useEffect, useRef } from "react";
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
import axios from "axios";

interface LoginFormProps {
  className?: string;
  onLoginSuccess: (userData: {
    login: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => void;
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
  const [showTooltip, setShowTooltip] = useState(true); // Iniciar como true para mostrar sempre
  const modeToggleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Removido o useEffect que controlava a exibição automática

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/Auth/login", // Agora usa o proxy configurado
        { email, password },
        { 
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.status === 200) {
        const { token, firstName, lastName } = response.data;
        localStorage.setItem("token", token);
        const login = email.split("@")[0];
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
    <>
      <div className="absolute right-4 " ref={modeToggleRef}>
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
                <div className={`w-full ${loading ? "cursor-progress" : ""}`}>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Carregando..." : "Login"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
