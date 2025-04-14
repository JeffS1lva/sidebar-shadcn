import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeCheck, BadgeAlert } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordProps {
  closeModal: () => void;
  userEmail?: string; // Email do usuário atual
}

export function ResetPassword({ closeModal, userEmail = "" }: ResetPasswordProps) {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [email, setEmail] = useState<string>(userEmail || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<string>(""); // Para debugar a resposta da API

  // Atualiza o estado do email se a prop mudar
  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  const handleSaveChanges = async () => {
    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!email || !currentPassword || !newPassword) {
      toast.error("Email, senha atual e nova senha são obrigatórios.", {
        style: {
          backgroundColor: "white",
          color: "red",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
        },
      });
      return;
    }
    
    if (newPassword === confirmPassword && newPassword.length === 8) {
      try {
        setIsLoading(true);
        
        // Definindo o payload de acordo com o formato esperado pela API
        const payload = {
          currentPassword,
          newPassword,
          email
        };
        
        // Log para debug
        console.log("Enviando requisição:", payload);
        
        const response = await fetch('/api/internal/Auth/change-password', { // Removido 'internal' do caminho
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        // Armazena a resposta para debug
        const responseData = await response.text();
        setApiResponse(responseData);
        console.log("Resposta da API:", response.status, responseData);

        if (!response.ok) {
          throw new Error(`Falha ao alterar a senha: ${response.status} - ${responseData}`);
        }

        closeModal();
        toast.success("Sua senha foi alterada com sucesso!", {
          style: {
            backgroundColor: "white",
            color: "green",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
          },
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        
        // Mensagem de erro mais informativa
        toast.error(`Erro ao redefinir a senha: ${error instanceof Error ? error.message : 'Tente novamente mais tarde.'}`, {
          style: {
            backgroundColor: "white",
            color: "red",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
          },
          duration: 5000, // Aumenta a duração para facilitar a leitura
        });
      } finally {
        setIsLoading(false);
      }
    } else if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem. Tente novamente.", {
        style: {
          backgroundColor: "white",
          color: "red",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
        },
      });
    }
  };

  const isPasswordValid = newPassword.length === 8;
  const isPasswordMismatch = newPassword !== confirmPassword;
  const isButtonDisabled = 
    !email ||
    currentPassword.length === 0 ||
    newPassword.length !== 8 ||
    confirmPassword.length !== 8 ||
    newPassword !== confirmPassword ||
    isLoading;

  // Determina o texto do botão com base no estado
  const buttonText = isLoading ? "Processando..." : isButtonDisabled ? "Bloqueado" : "Salvar Alterações";
  
  // Determina a mensagem de título para o botão
  const getButtonTitle = () => {
    if (isLoading) {
      return "Processando sua solicitação";
    } else if (!email) {
      return "Informe seu email";
    } else if (currentPassword.length === 0) {
      return "Preencha sua senha atual";
    } else if (newPassword.length === 0 || confirmPassword.length === 0) {
      return "Preencha todos os campos de senha";
    } else if (newPassword.length !== 8) {
      return "A senha deve ter exatamente 8 caracteres";
    } else if (isPasswordMismatch) {
      return "As senhas não coincidem";
    }
    return "Clique para salvar as alterações";
  };

  // Define o estilo do cursor e opacidade com base no estado
  const buttonStyle = isButtonDisabled
    ? "cursor-not-allowed opacity-50"
    : "cursor-pointer opacity-100";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
          <DialogDescription>
            Preencha as informações para redefinir sua senha.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="col-span-3"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || !!userEmail} // Desabilita se o email foi fornecido via props
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-password" className="text-right">
              Senha Atual
            </Label>
            <Input
              id="current-password"
              type="password"
              className="col-span-3"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-password" className="text-right">
              Nova Senha
            </Label>
            <Input
              id="new-password"
              type="password"
              className="col-span-3"
              placeholder="Digite sua nova senha"
              value={newPassword}
              maxLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-end">
              Confirmar Senha
            </Label>
            <Input
              id="confirm-password"
              type="password"
              className="col-span-3"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              maxLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <hr />

        {(newPassword.length !== 0 && newPassword.length !== 8 || (confirmPassword.length !== 0 && isPasswordMismatch)) && (
          <div className="flex items-center gap-2 text-[0.8rem] text-red-600">
            <BadgeAlert size={16} />
            <span>
              {newPassword.length !== 0 && newPassword.length !== 8
                ? "A senha precisa ter 8 caracteres."
                : "As senhas não coincidem."}
            </span>
          </div>
        )}

        {isPasswordValid && !isPasswordMismatch && confirmPassword.length > 0 && (
          <div className="flex items-center gap-2 text-[0.8rem] text-green-600">
            <BadgeCheck size={16} />
            <span>A senha tem 8 caracteres.</span>
          </div>
        )}

        {apiResponse && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-24">
            <strong>Resposta API (debug):</strong> {apiResponse}
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            onClick={closeModal}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSaveChanges}
            disabled={isButtonDisabled}
            className={buttonStyle}
            title={getButtonTitle()}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}