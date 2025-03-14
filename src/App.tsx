import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavegationMenu } from "@/components/pages/NavegationMenu";
import { Boletos } from "./components/pages/Boletos";
import { Notes } from "./components/pages/Notes";
import { Pedidos } from "./components/pages/Pedidos";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Home } from "./components/pages/Home";
import { LoginForm } from "./components/login/LoginForm";
import { Toaster } from "sonner"; // Importando Toaster para exibir notificações
import { ThemeProvider } from "./components/Dark-Mode/ThemeProvider";
import { ModeToggle } from "./components/Dark-Mode/ModeToggle";

export function App() {
  const [authData, setAuthData] = useState<{
    login: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  // Verifica se o usuário está autenticado no localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuthData = localStorage.getItem("authData");
    return storedAuthData ? JSON.parse(storedAuthData) : null;
  });

  const handleLoginSuccess = (userData: {
    login: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    // Salva o estado de autenticação no localStorage
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("authData", JSON.stringify(userData)); // Salva os dados do usuário no localStorage
    setIsAuthenticated(userData);
    setAuthData(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authData"); // Remove os dados do usuário do localStorage
    setIsAuthenticated(null);
    setAuthData(null);
  };

  useEffect(() => {
    // Recupera os dados de autenticação do localStorage ao recarregar a página
    const storedAuthData = localStorage.getItem("authData");
    if (storedAuthData) {
      setAuthData(JSON.parse(storedAuthData));
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Rota pública do login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/home" />
              ) : (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Rotas protegidas */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <AuthenticatedLayout
                  authData={authData}
                  onLogout={handleLogout}
                >
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

        {/* Toaster para as notificações do Sonner */}
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

// Componente para o layout após autenticação
function AuthenticatedLayout({
  children,
  onLogout,
  authData,
}: {
  children: React.ReactNode;
  onLogout: () => void;
  authData: {
    login: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}) {
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
      <NavegationMenu onLogout={onLogout} authData={authData} />
      <main className="w-full h-full">
        <SidebarTrigger />
        <ModeToggle />
        {children}
      </main>
    </SidebarProvider>
  );
}
