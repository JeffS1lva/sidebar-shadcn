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
  EditIcon,
  TruckIcon,
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
import { ResetPassword } from "../auth/ResetPassword";
import { ProfileSelector } from "./NavegationMenu/ProfileSelector"; // Importando o novo componente

// Função utilitária para obter a chave do localStorage
const getUserStorageKey = (email: string) => `userProfile_${email}`;

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
  {
    title: "Rastrear Pedidos",
    url: "/rastreio-pedidos",
    icon: TruckIcon,
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
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Carregar os dados do usuário do localStorage e da prop authData
  const loadUserData = () => {
    if (authData?.email) {
      const storageKey = getUserStorageKey(authData.email);
      const storedUserData = localStorage.getItem(storageKey);

      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setUserLogin(userData.name);
          setAvatarUrl(userData.avatarUrl);
        } catch (error) {
          // Fallback para dados do authData
          setDefaultUserData();
        }
      } else {
        // Se não existir dados no localStorage, use os dados do authData
        setDefaultUserData();
      }

      // Sempre atualizar o email do usuário
      setUserEmail(authData.email || "default@example.com");
    }
  };

  // Configurar dados padrão baseados no authData
  const setDefaultUserData = () => {
    if (authData) {
      if (authData.firstName && authData.lastName) {
        setUserLogin(`${authData.firstName} ${authData.lastName}`);
      } else if (authData.email) {
        setUserLogin(authData.email.split("@")[0]);
      } else if (authData.login) {
        setUserLogin(authData.login);
      }

      if (authData.avatarUrl) {
        setAvatarUrl(authData.avatarUrl);
      }
    }
  };

  // Carregar os dados do usuário ao iniciar o componente
  useEffect(() => {
    loadUserData();

    // Ouvir por atualizações de perfil
    const handleProfileUpdate = (event: CustomEvent) => {
      const { email, name, avatarUrl } = event.detail;

      // Só atualizar se for o email atual
      if (email === authData?.email) {
        setUserLogin(name);
        setAvatarUrl(avatarUrl);
      }
    };

    // Adicionar event listener para atualizações de perfil
    window.addEventListener(
      "userProfileUpdated",
      handleProfileUpdate as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "userProfileUpdated",
        handleProfileUpdate as EventListener
      );
    };
  }, [authData]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/external/Auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Falha ao fazer logout");
      }

      if (onLogout) {
        onLogout();
      }

      navigate("/login");
    } catch (error) {
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handlePasswordReset = () => {
    setResetPasswordOpen(true);
  };

  const openUserProfileModal = () => {
    setUserProfileOpen(true);
  };

  const closeUserProfileModal = () => {
    setUserProfileOpen(false);
  };

  const handleSaveUserChanges = async (userData: {
    name: string;
    avatarUrl: string | null;
  }) => {
    try {
      setUserLogin(userData.name);
      setAvatarUrl(userData.avatarUrl);

      // Salvar no localStorage para persistência
      if (authData?.email) {
        const storageKey = getUserStorageKey(authData.email);
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            name: userData.name,
            avatarUrl: userData.avatarUrl,
          })
        );
      }

      // Simular um atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 800));

      return true; // Sucesso
    } catch (error) {
      return false; // Falha
    }
  };

  // Fechar o modal de redefinição de senha
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
                  <SidebarMenuItem
                    key={item.title}
                    title={item.title}
                    className="has-checked:bg-indigo-50"
                  >
                    <SidebarMenuButton
                      asChild
                      className="has-checked:bg-indigo-50"
                    >
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
                    className="w-56 flex flex-col text-black dark:text-white gap-2 bg-gray-100 dark:bg-card border-1 border-gray-500 rounded-sm mb-3 px-1 py-1 ml-4"
                  >
                    {/* Item de perfil com clique para abrir o modal */}
                    <DropdownMenuItem
                      className="flex items-center gap-2 pl-2 pt-1 outline-0 hover:bg-zinc-200 dark:hover:bg-sidebar-accent hover:rounded-md py-0.5"
                      onClick={openUserProfileModal} // Aqui adicionamos o handler para abrir o modal
                    >
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
                        <span className="text-lg">
                          {userLogin || "Usuário Desconhecido"}
                        </span>
                        <a className="flex items-center gap-1 text-[12px] text-zinc-700 dark:text-zinc-400 dark:hover:text-sky-700 hover:text-sky-950  rounded-sm cursor-pointer">
                          Editar Perfil <EditIcon size={15} />
                        </a>
                      </div>
                    </DropdownMenuItem>
                    <div className="border w-full border-zinc-300 dark:border-zinc-600"></div>
                    <DropdownMenuItem
                      className="flex items-center gap-2 pl-3 outline-0 hover:bg-zinc-200 dark:hover:bg-sidebar-accent hover:rounded-md py-2 cursor-pointer"
                      onClick={handlePasswordReset}
                    >
                      <Settings size={16} />
                      Alterar senha
                    </DropdownMenuItem>
                    <div className="border w-full border-zinc-300 dark:border-zinc-600"></div>
                    <DropdownMenuItem className="flex justify pt-1 gap-2 pb-1 outline-0 hover:bg-zinc-200 dark:hover:bg-sidebar-accent hover:rounded-md py-0.5">
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

      {/* Modal de Redefinição de Senha */}
      {isResetPasswordOpen && <ResetPassword closeModal={closeModal} />}

      {/* Modal de Perfil do Usuário */}
      <ProfileSelector
        isOpen={isUserProfileOpen}
        onClose={closeUserProfileModal}
        currentUser={{
          name: userLogin,
          email: userEmail,
          avatarUrl: avatarUrl,
        }}
        onSaveChanges={handleSaveUserChanges}
      />
    </>
  );
}
