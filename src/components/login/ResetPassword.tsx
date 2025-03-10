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
import { toast } from "sonner"; // Importando o Sonner corretamente para notificações

// Definindo a interface para as props, incluindo closeModal
interface ResetPasswordProps {
  closeModal: () => void; // Função para fechar o modal
}

export function ResetPassword({ closeModal }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [toastId, setToastId] = useState<string | null>(null); // Estado para controlar o Toast

  const showToast = () => {
    if (newPassword.length !== 8 && !toastId) {
      const id = toast.error("A nova senha deve ter exatamente 8 caracteres.", {
        style: {
          backgroundColor: "white",
          color: "red",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
        },
      });
      setToastId(id as string); // Garantindo que o id é do tipo string
    }
  };

  const removeToast = () => {
    if (toastId) {
      toast.dismiss(toastId); // Remover o toast
      setToastId(null); // Resetar o ID do toast
    }
  };

  useEffect(() => {
    if (newPassword.length === 8) {
      removeToast(); // Remover o toast assim que a senha tiver 8 caracteres
    } else {
      showToast(); // Exibir o toast enquanto a senha não tiver 8 caracteres
    }
  }, [newPassword]);

  // Função para enviar a nova senha para o servidor
  const handleSaveChanges = async () => {
    if (newPassword === confirmPassword && newPassword.length === 8) {
      // Enviar requisição ao backend para alterar a senha
      try {
        const response = await fetch("/api/alterar-senha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            novaSenha: newPassword,
            confirmacaoSenha: confirmPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Fechar o modal
          closeModal();

          // Exibir a notificação de sucesso usando o Sonner
          toast.success("Sua senha foi alterada com sucesso!", {
            style: {
              backgroundColor: "white",
              color: "green",
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            },
          });
        } else {
          toast.error(data.message || "Erro ao alterar a senha.", {
            style: {
              backgroundColor: "white",
              color: "red",
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            },
          });
        }
      } catch (error) {
        toast.error("Erro de rede. Tente novamente.", {
          style: {
            backgroundColor: "white",
            color: "red",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
          },
        });
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

  const isFormValid =
    newPassword.length === 8 &&
    confirmPassword.length === 8 &&
    newPassword === confirmPassword;

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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-right">
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={closeModal}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSaveChanges}
            disabled={!isFormValid}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
