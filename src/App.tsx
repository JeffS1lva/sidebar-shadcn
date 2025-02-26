import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavegationMenu } from "@/components/pages/NavegationMenu";
import { Boletos } from "./components/pages/Boletos";
import { Notes } from "./components/pages/Notes";
import { Pedidos } from "./components/pages/Pedidos";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export function App({ children }: { children: React.ReactNode }) {  
  return (
    <Router>
      <SidebarProvider>
        <NavegationMenu />{" "}
        <main>
          <SidebarTrigger />
          {children}
        </main>
        <Routes>
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/notas-fiscais" element={<Notes />} />
          <Route path="/boletos" element={<Boletos />} />
          {/* Adicione outras rotas conforme necessário */}
        </Routes>
      </SidebarProvider>
    </Router>
  );
}
