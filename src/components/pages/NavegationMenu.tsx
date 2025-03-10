import { useState, useEffect } from "react";
import {
  ScrollText,
  Home,
  ShoppingBag,
  ScanBarcode,
  Settings,
  ChevronUp,
  User2,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "../../assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ResetPassword } from "../login/ResetPassword";

const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Pedidos",
    url: "/pedidos",
    icon: ShoppingBag,
  },
  {
    title: "Notas Fiscais",
    url: "/notas-fiscais",
    icon: ScrollText,
  },
  {
    title: "Boletos",
    url: "/boletos",
    icon: ScanBarcode,
  },
];

export function NavegationMenu({
  onLogout,
  authData,
}: {
  onLogout?: () => void;
  authData?: {
    firstName: string;
    lastName: string;
    login?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
}) {
  const [userLogin, setUserLogin] = useState("");
  const [userEmail, setUserEmail] = useState("users@test.com");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isResetPasswordOpen, setResetPasswordOpen] = useState(false); // Estado para controle do modal
  const navigate = useNavigate();

  useEffect(() => {
    if (authData) {
      if (authData.firstName && authData.lastName) {
        setUserLogin(`${authData.firstName} ${authData.lastName}`);
      } else if (authData.email) {
        setUserLogin(authData.email.split("@")[0]);
      } else if (authData.login) {
        setUserLogin(authData.login);
      }
      setUserEmail(authData.email || "default@example.com");
      setAvatarUrl(authData.avatarUrl || null);
    }
  }, [authData]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      navigate("/login");
    }
  };

  const handlePasswordReset = () => {
    setResetPasswordOpen(true); // Abre o modal
  };

  const closeModal = () => {
    setResetPasswordOpen(false); // Fecha o modal
  };

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <img src={Logo} alt="logo polar fix" className="pr-24" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title} title={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton title="Usuário" className="cursor-pointer">
                      <User2 /> {userLogin || "Usuário Desconhecido"}
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="left"
                    className="w-56 flex flex-col text-white gap-2 bg-gray-500 border-1 border-gray-500 rounded-sm mb-3 px-1 py-1 cursor-pointer ml-3"
                  >
                    <DropdownMenuItem className="flex items-center gap-2 pl-2 pt-1 outline-0 hover:bg-zinc-600 hover:rounded-md py-0.5">
                      <Avatar className="size-9">
                        {avatarUrl ? (
                          <AvatarImage
                            src={avatarUrl}
                            alt="Avatar"
                            className="rounded-sm"
                          />
                        ) : (
                          <AvatarFallback>
                            <User2 className="text-white size-9" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{userLogin || "Usuário Desconhecido"}</span>
                        <span className="text-sm text-zinc-300">{userEmail}</span>
                      </div>
                    </DropdownMenuItem>
                    <div className="border w-full border-zinc-600"></div>
                    <DropdownMenuItem
                      className="flex items-center gap-2 pl-3 outline-0 hover:bg-zinc-600 hover:rounded-md py-2"
                      onClick={handlePasswordReset}
                    >
                      <Settings size={16} />
                      Alterar senha
                    </DropdownMenuItem>
                    <div className="border w-full border-zinc-600"></div>
                    <DropdownMenuItem className="flex items-center pt-1 gap-2 pb-1 outline-0 hover:bg-zinc-600 hover:rounded-md py-0.5">
                      <Button variant={"logout"} onClick={handleLogout}>
                        <LogOut size={15} />
                        Sair
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>

      {/* Renderizar o modal de reset de senha quando o estado for verdadeiro */}
      {isResetPasswordOpen && <ResetPassword closeModal={closeModal} />}
    </>
  );
}
