// FirstAccess.tsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FirstAccessRequestProps {
  onToggle: (isFirstAccess: boolean) => void;
  isFirstAccess: boolean;
  className?: string; 
}

export function FirstAcess({
  onToggle,
  isFirstAccess,
  className,
}: FirstAccessRequestProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="first-access"
        checked={isFirstAccess}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="first-access" className={`cursor-pointer ${className}`}>
        Primeiro acesso
      </Label>
    </div>
  );
}