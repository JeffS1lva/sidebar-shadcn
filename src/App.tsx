import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavegationMenu } from "@/components/pages/NavegationMenu";
import { Boletos } from "./components/pages/Boletos";
import { Cotacao } from "./components/pages/Cotacao";
import { Pedidos } from "./components/pages/Pedidos";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Home } from "./components/pages/Home";
import { LoginForm } from "./components/auth/LoginForm";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/Dark-Mode/ThemeProvider";
import { ModeToggle } from "./components/Dark-Mode/ModeToggle";
import CookieConsent from "./components/auth/cookies/CookieConsent";

// Define a interface para os dados do usuário
interface UserData {
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string;
}

export function App() {
  const [authData, setAuthData] = useState<UserData | null>(null);

  // Verifica se o usuário está autenticado no localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem("token");
    const authFlag = localStorage.getItem("isAuthenticated");
    return token !== null && authFlag === "true";
  });

  const handleLoginSuccess = (userData: UserData) => {
    // O token já deve ter sido salvo pelo hook useAuth
    // Apenas garantindo a consistência dos estados
    setIsAuthenticated(true);
    setAuthData(userData);

    // Não precisamos salvar novamente no localStorage, pois useAuth já faz isso
    // Mas podemos garantir que a flag isAuthenticated existe
    if (!localStorage.getItem("isAuthenticated")) {
      localStorage.setItem("isAuthenticated", "true");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authData");
    localStorage.removeItem("token");
    sessionStorage.clear(); // Limpar qualquer dado de sessão
    setIsAuthenticated(false);
    setAuthData(null);
  };

  // Carrega os dados de autenticação uma vez no início
  useEffect(() => {
    const storedAuthData = localStorage.getItem("authData");
    const token = localStorage.getItem("token");
    const authFlag = localStorage.getItem("isAuthenticated");

    if (storedAuthData && token && authFlag === "true") {
      try {
        const userData = JSON.parse(storedAuthData);
        setAuthData(userData);
        setIsAuthenticated(true);
      } catch (error) {
        handleLogout(); // Limpa dados inválidos
      }
    } else {
      // Se qualquer um dos itens estiver faltando, deslogue
      if (storedAuthData || token || authFlag) {
        handleLogout();
      }
    }
  }, []);

  // Função para lidar com o consentimento de cookies
  const handleCookieConsent = () => {
    localStorage.setItem("cookieConsent", "accepted");
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        {/* Envolver toda a aplicação com CookieConsent */}
        <CookieConsent onConsent={handleCookieConsent}>
          <Routes>
            {/* Rota pública do login */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/inicio" replace />
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
                      <Route path="/inicio" element={<Home />} />
                      <Route path="/pedidos" element={<Pedidos />} />
                      <Route path="/cotacao" element={<Cotacao />} />
                      <Route path="/boletos" element={<Boletos />} />
                      {/* Redireciona para home se a rota não corresponder */}
                      <Route path="*" element={<Navigate to="/inicio" replace />} />
                    </Routes>
                  </AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Redireciona a rota raiz para login ou início conforme autenticação */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/inicio" replace /> : 
                  <Navigate to="/login" replace />
              } 
            />
          </Routes>
          
          {/* Toaster para as notificações do Sonner */}
          <Toaster />
        </CookieConsent>
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
  authData: UserData | null;
}) {
  const navigate = useNavigate();
  
  // Verificação única na montagem inicial do componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";

    if (!token || !isAuth) {
      // Temos uma inconsistência, precisamos deslogar
      onLogout();
      navigate("/login", { replace: true });
    }
  }, [onLogout, navigate]); // Sem dependência de location.pathname

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <NavegationMenu
          onLogout={() => {
            onLogout();
            navigate("/login", { replace: true });
          }}
          authData={authData}
        />
        <main className="flex-1 relative overflow-auto transition-all duration-300 ease-in-out">
          <div className="sticky top-0 z-20 flex justify-between items-center p-2 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger />
            <ModeToggle />
          </div>
          <div className="p-2">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}