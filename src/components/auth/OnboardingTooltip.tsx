import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingTooltipProps {
  onClose: () => void;
  email: string;
  onEmailChange: (email: string) => void;
  onRequestAccess: () => void;
  navigateToLoginWithFirstAccess: (email: string) => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  onClose,
  email,
  navigateToLoginWithFirstAccess,
}) => {
  const handleFirstAccessClick = () => {
    onClose();
    navigateToLoginWithFirstAccess(email);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* BACKDROP COM BLUR */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/30"
        onClick={onClose}
      />

      {/* TOOLTIP CENTRALIZADO */}
      <div className="relative z-50 w-[90%] max-w-md bg-background border border-border rounded-xl p-4 shadow-xl animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground ">
            Bem-vindo à plataforma!
          </h4>
          <button
            onClick={onClose}
            className="hover:bg-zinc-500 rounded-xs cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          Utilize esta área para realizar o login ou
          solicitar o seu primeiro acesso.
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>
            Se ainda não possui cadastro, escolha{" "}
            <strong>“Primeiro Acesso”</strong>. Você receberá uma senha
            provisória por e-mail e, após o primeiro login, poderá defini-la
            definitivamente.
          </li>
          <li>
            Caso já tenha concluído o primeiro acesso, clique em{" "}
            <strong>“Entendi”</strong> para continuar.
          </li>
        </ul>

        <div className="flex justify-end gap-2 mt-5">
          <Button
            size="sm"
            onClick={handleFirstAccessClick}
            className="text-xs border-0 cursor-pointer"
          >
            Primeiro Acesso
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-xs bg-slate-200 border-0 cursor-pointer"
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};
