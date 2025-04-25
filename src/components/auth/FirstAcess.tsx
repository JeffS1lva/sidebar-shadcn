// FirstAccess.tsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FirstAccessRequestProps {
  onToggle: (isFirstAccess: boolean) => void;
  isFirstAccess: boolean;
}

export function FirstAcess({
  onToggle,
  isFirstAccess,
}: FirstAccessRequestProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="first-access"
        checked={isFirstAccess}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="first-access" className="cursor-pointer">
        Primeiro acesso
      </Label>
    </div>
  );
}