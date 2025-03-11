import { useState } from "react";
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
}

export function ResetPassword({ closeModal }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSaveChanges = () => {
    if (newPassword === confirmPassword && newPassword.length === 8) {
      closeModal();
      toast.success("Sua senha foi alterada com sucesso!", {
        style: {
          backgroundColor: "white",
          color: "green",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
        },
      });

      setNewPassword("");
      setConfirmPassword("");
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
    newPassword.length !== 8 ||
    confirmPassword.length !== 8 ||
    newPassword !== confirmPassword;

  // Determina o texto do botão com base no estado
  const buttonText = isButtonDisabled ? "Bloqueado" : "Salvar Alterações";
  
  // Determina a mensagem de título para o botão
  const getButtonTitle = () => {
    if (newPassword.length === 0 || confirmPassword.length === 0) {
      return "Preencha ambos os campos de senha";
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

        <DialogFooter>
          <Button type="button" onClick={closeModal}>
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