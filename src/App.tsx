import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavegationMenu } from "@/components/pages/NavegationMenu";
import { Boletos } from "./components/pages/Boletos";
import { Notes } from "./components/pages/Notes";
import { Pedidos } from "./components/pages/Pedidos";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Home } from "./components/pages/Home";
import { LoginForm } from "./components/login/LoginForm";

export function App() {
  // Verifica se o usuário está autenticado no localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  
  const handleLoginSuccess = () => {
    // Salva o estado de autenticação no localStorage
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Rota pública do login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" /> : 
              <LoginForm onLoginSuccess={handleLoginSuccess} />
          } 
        />
        
        {/* Rotas protegidas */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout onLogout={handleLogout}>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/pedidos" element={<Pedidos />} />
                  <Route path="/notas-fiscais" element={<Notes />} />
                  <Route path="/boletos" element={<Boletos />} />
                  {/* Redireciona para home se a rota não corresponder */}
                  <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Redireciona a rota raiz para login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

// Componente para o layout após autenticação
function AuthenticatedLayout({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) {
  // Verifica se estamos em uma navegação real (não apenas um remount do componente)
  const location = useLocation();

  useEffect(() => {
    // Verifica a autenticação ao mudar de rota
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuth) {
      onLogout();
    }
  }, [location.pathname, onLogout]);

  return (
    <SidebarProvider>
      <NavegationMenu onLogout={onLogout} />
      <main className="w-full h-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}