import { useState, useEffect } from "react";
import {
  Home,
  ShoppingBag,
  ScanBarcode,
  Settings,
  ChevronUp,
  User2,
  LogOut,
  Landmark,
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
import LogoDark from "@/assets/logo.png";
import LogoLight from "@/assets/logoBranco.png"; 
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ResetPassword } from "../login/ResetPassword";

// Componente de logo que muda com o tema
const ThemeAwareLogo = () => {
  return (
    <>
      {/* Logo para tema claro - escondido no tema escuro */}
      <img src={LogoDark} alt="logo polar fix" className="pr-24 dark:hidden" />
      {/* Logo para tema escuro - escondido no tema claro */}
      <img
        src={LogoLight}
        alt="logo polar fix"
        className="pr-24 hidden dark:block"
      />
    </>
  );
};

const items = [
  {
    title: "Inicio",
    url: "/inicio",
    icon: Home,
  },
  {
    title: "Cotações",
    url: "/cotacao",
    icon: Landmark,
  },
  {
    title: "Pedidos",
    url: "/pedidos",
    icon: ShoppingBag,
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
  const [isResetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const response = await fetch('/api/external/Auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao fazer logout');
      }

      if (onLogout) {
        onLogout();
      }
      
      navigate("/login");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handlePasswordReset = () => {
    setResetPasswordOpen(true);
  };

  const closeModal = () => {
    setResetPasswordOpen(false);
  };

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <ThemeAwareLogo />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title} title={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
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
                    <SidebarMenuButton
                      title="Usuário"
                      className="cursor-pointer"
                    >
                      <User2 /> {userLogin || "Usuário Desconhecido"}
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="left"
                    className="w-56 flex flex-col text-black dark:text-white gap-2 bg-gray-100 dark:bg-card border-1 border-gray-500 rounded-sm mb-3 px-1 py-1 cursor-pointer ml-4"
                  >
                    <DropdownMenuItem className="flex items-center gap-2 pl-2 pt-1 outline-0 hover:bg-zinc-200 dark:hover:bg-sidebar-accent hover:rounded-md py-0.5">
                      <div className="h-9 w-9 overflow-hidden rounded-sm">
                        <Avatar className="h-full w-full">
                          {avatarUrl ? (
                            <AvatarImage
                              src={avatarUrl}
                              alt="Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="h-full w-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                              <User2 className="text-gray-600 dark:text-gray-200 h-6 w-6" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      <div className="flex flex-col">
                        <span>{userLogin || "Usuário Desconhecido"}</span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {userEmail}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <div className="border w-full border-zinc-300 dark:border-zinc-600"></div>
                    <DropdownMenuItem
                      className="flex items-center gap-2 pl-3 outline-0 hover:bg-zinc-200 dark:hover:bg-sidebar-accent  hover:rounded-md py-2"
                      onClick={handlePasswordReset}
                    >
                      <Settings size={16} />
                      Alterar senha
                    </DropdownMenuItem>
                    <div className="border w-full border-zinc-300 dark:border-zinc-600"></div>
                    <DropdownMenuItem className="flex justify pt-1 gap-2 pb-1 outline-0 hover:bg-zinc-200 dark:hover:bg-sidebar-accent  hover:rounded-md py-0.5" >
                      <Button 
                        variant={"bottomSide"} 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="dark:text-white dark:hover:text-white"
                      >
                        <LogOut size={15} />
                        {isLoggingOut ? "Saindo..." : "Sair"}
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>

      {isResetPasswordOpen && <ResetPassword closeModal={closeModal} />}
    </>
  );
}