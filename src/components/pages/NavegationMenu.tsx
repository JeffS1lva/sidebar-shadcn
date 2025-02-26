import { useState } from "react"; // Importando hooks para gerenciamento de estado
import {
  ScrollText,
  Home,
  ShoppingBag,
  ScanBarcode,
  Settings,
  ChevronUp,
  User2,
  LogOut,
  BadgeCheck,
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

// Menu items.
const items = [
  {
    title: "Home",
    url: "/", // Atualize a URL para a rota correta
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

export function NavegationMenu() {
  // Estado para armazenar o nome do usuário
  const [username] = useState("Usuário Off");

  return (
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
                    <User2 /> {username || "Carregando..."}{" "}
                    {/* Exibindo o nome do usuário ou 'Carregando...' */}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="left"
                  className="w-56 flex flex-col text-white gap-2 bg-gray-800 border-1 border-gray-500 rounded-sm mb-3 px-1 py-1 cursor-pointer ml-3"
                >
                  <DropdownMenuItem className="flex  items-center gap-2 pl-2 pt-1 outline-0 hover:bg-zinc-600 hover:rounded-md py-0.5">
                    <Avatar className="size-9 ">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        className="rounded-sm"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ">
                      <span>Usuário</span>
                      <span className="text-sm text-zinc-400">
                        users@test.com
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <div className="border w-full border-zinc-600"></div>
                  <DropdownMenuItem className="flex items-center gap-2 pl-3 outline-0 hover:bg-zinc-600 hover:rounded-md py-0.5">
                    <BadgeCheck size={16} />
                    <span>Conta</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 pl-3 outline-0 hover:bg-zinc-600 hover:rounded-md py-0.5">
                    <Settings size={16} />
                    <span>Configuração</span>
                  </DropdownMenuItem>
                  <div className="border w-full border-zinc-600"></div>
                  <DropdownMenuItem className="flex items-center gap-2 pl-3 pb-1  outline-0 hover:bg-zinc-600 hover:rounded-md py-0.5">
                    <LogOut size={15} />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
