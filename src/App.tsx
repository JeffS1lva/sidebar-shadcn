import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSideBar } from "@/components/AppSideBar";

export function App({ children }: { children: React.ReactNode }) {  
  return (
    <SidebarProvider>
      <AppSideBar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
