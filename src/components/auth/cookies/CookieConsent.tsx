import React, { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cookie, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Definir período de validade do consentimento (em dias)
const CONSENT_VALIDITY_DAYS = 7;

// Cookie Consent Context
const CookieConsentContext = React.createContext({
  consentGiven: false,
  setConsentGiven: (_value: boolean) => {},
});

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [initialCheck, setInitialCheck] = useState<boolean>(false);
  
  // Check for existing consent when component mounts
  useEffect(() => {
    checkStoredConsent();
    setInitialCheck(true);
  }, []);
  
  // Verifica se o consentimento armazenado ainda é válido
  const checkStoredConsent = () => {
    const storedConsent = localStorage.getItem("cookieConsent");
    if (storedConsent) {
      try {
        const consentData = JSON.parse(storedConsent);
        const expiryDate = new Date(consentData.expiry);
        
        // Verifica se o consentimento ainda é válido
        if (expiryDate > new Date()) {
          setConsentGiven(true);
        } else {
          // Se expirou, remove o consentimento armazenado
          localStorage.removeItem("cookieConsent");
          setConsentGiven(false);
        }
      } catch (error) {
        // Se houver erro ao analisar o JSON, remove o item inválido
        localStorage.removeItem("cookieConsent");
        setConsentGiven(false);
      }
    }
  };
  
  // Update localStorage when consent changes
  useEffect(() => {
    if (initialCheck) {
      if (consentGiven) {
        // Calcula a data de expiração para CONSENT_VALIDITY_DAYS dias a partir de agora
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + CONSENT_VALIDITY_DAYS);
        
        // Salva o consentimento com a data de expiração
        localStorage.setItem("cookieConsent", JSON.stringify({
          accepted: true,
          expiry: expiryDate.toISOString()
        }));
      } else {
        localStorage.removeItem("cookieConsent");
      }
    }
  }, [consentGiven, initialCheck]);
  
  return (
    <CookieConsentContext.Provider value={{ consentGiven, setConsentGiven }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => React.useContext(CookieConsentContext);

// Cookie Types Definition
const cookieTypes = [
  {
    id: "necessary",
    title: "Cookies Necessários",
    description: "Estes cookies são essenciais para o funcionamento básico do site. Eles permitem recursos fundamentais como autenticação, segurança e preferências de uso.",
    required: true
  },
  {
    id: "analytics",
    title: "Cookies Analíticos",
    description: "Ajudam a entender como você interage com o site, permitindo melhorar a experiência do usuário. Coletam informações anônimas sobre páginas visitadas e interações.",
    required: false
  },
  {
    id: "marketing",
    title: "Cookies de Marketing",
    description: "Usados para rastrear visitantes em diferentes sites para exibir anúncios relevantes. Estes cookies podem compartilhar informações com terceiros para este propósito.",
    required: false
  }
];

interface CookieConsentBannerProps {
  onAccept: () => void;
  onReject: () => void;
  onOpenSettings: () => void;
}

interface CookieConsentProps {
  children: ReactNode;
  // Adicionando uma prop de callback para notificar quando o consentimento é dado
  onConsent?: () => void;
  // Opcionalmente permitir configurar o período de validade (em dias)
  validityDays?: number;
}

// Componente de modal de aviso
interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAnyway: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onClose, onContinueAnyway }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center p-2">
          <AlertCircle className="text-destructive w-16 h-16 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Atenção!</h2>
          <p className="text-muted-foreground mb-6">
            Se não aceitar os cookies, não será possível acessar o site. 
            Os cookies são necessários para fornecer uma experiência completa.
          </p>
          <div className="flex flex-wrap gap-3 w-full justify-center">
            <Button onClick={onClose} variant="default" className="flex-1">
              Tentar novamente
            </Button>
            <Button 
              onClick={onContinueAnyway} 
              variant="outline" 
              className="flex-1"
            >
              Continuar mesmo assim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onAccept, onReject, onOpenSettings }) => {
  return (
    <motion.div 
      className="fixed bottom-4 left-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50 max-w-xl mx-auto" 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="flex items-start mb-3">
        <Cookie className="text-primary mr-2 flex-shrink-0 mt-1" size={20} />
        <h3 className="text-lg font-semibold">Este site utiliza cookies</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e analisar tráfego. 
        Ao continuar navegando, você concorda com nossa política de privacidade e uso de cookies.
      </p>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onReject} className="flex-1 sm:flex-none">
          Rejeitar não essenciais
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenSettings} className="flex-1 sm:flex-none">
          Personalizar
        </Button>
        <Button size="sm" onClick={onAccept} className="flex-1 sm:flex-none">
          Aceitar todos
        </Button>
      </div>
    </motion.div>
  );
};

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (preferences: Record<string, boolean>) => void;
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    return cookieTypes.reduce((acc, type) => {
      acc[type.id] = type.required;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const handleToggle = (id: string) => {
    if (id === "necessary") return; // Can't toggle necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleSave = () => {
    onAccept(preferences);
    onClose();
  };
  
  const handleAcceptAll = () => {
    const allAccepted = cookieTypes.reduce((acc, type) => {
      acc[type.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    onAccept(allAccepted);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Cookie className="text-primary mr-2" size={20} />
            <h2 className="text-xl font-semibold">Configurações de Cookies</h2>
          </div>
        </div>
        
        <Tabs defaultValue="cookies" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cookies" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione quais cookies você deseja aceitar. Cookies necessários não podem ser desativados pois são essenciais para o funcionamento do site.
            </p>
            
            <div className="space-y-4 mt-4">
              {cookieTypes.map((cookieType) => (
                <motion.div 
                  key={cookieType.id}
                  className="border border-border rounded-lg p-4"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <h3 className="font-medium">{cookieType.title}</h3>
                      {cookieType.required && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Necessário
                        </span>
                      )}
                    </div>
                    <Button
                      variant={preferences[cookieType.id] ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggle(cookieType.id)}
                      disabled={cookieType.required}
                      className={`min-w-20 ${preferences[cookieType.id] ? "bg-primary" : ""}`}
                    >
                      {preferences[cookieType.id] ? (
                        <CheckCircle2 className="mr-1" size={16} />
                      ) : (
                        <XCircle className="mr-1" size={16} />
                      )}
                      {preferences[cookieType.id] ? "Ativo" : "Inativo"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{cookieType.description}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <div className="flex items-start mb-3">
              <Shield className="text-primary mr-2 flex-shrink-0 mt-1" size={20} />
              <h3 className="text-lg font-semibold">Nossa política de privacidade</h3>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Estamos comprometidos em proteger sua privacidade e garantir que suas informações pessoais estejam seguras.
              </p>
              <p>
                Coletamos apenas os dados necessários para fornecer nossos serviços e melhorar sua experiência. Nunca compartilhamos suas informações pessoais com terceiros sem seu consentimento explícito.
              </p>
              <p>
                Ao utilizar nosso site, você tem direito a:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir informações imprecisas</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar seu consentimento a qualquer momento</li>
              </ul>
              <p>
                Para mais informações sobre como processamos seus dados, consulte nossa política de privacidade completa.
              </p>
              <p className="text-xs mt-4">
                Seu consentimento tem validade de {CONSENT_VALIDITY_DAYS} dias e precisará ser renovado após esse período.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-wrap gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSave} className="flex-1 sm:flex-none">
            Salvar preferências
          </Button>
          <Button onClick={handleAcceptAll} className="flex-1 sm:flex-none">
            Aceitar todos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente de layout protegido
const ProtectedContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { consentGiven, setConsentGiven } = useCookieConsent();
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  
  useEffect(() => {
    // Show banner after a small delay for better UX
    const timer = setTimeout(() => {
      if (!consentGiven) {
        setShowBanner(true);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [consentGiven]);
  
  const handleAccept = () => {
    setConsentGiven(true);
    setShowBanner(false);
  };
  
  const handleReject = () => {
    // Mostrar modal de aviso em vez de aceitar apenas os cookies necessários
    setShowWarningModal(true);
    setShowBanner(false);
  };
  
  const handleSettingsAccept = (_preferences: Record<string, boolean>) => {
    // If at least necessary cookies are accepted, allow login
    setConsentGiven(true);
    setShowBanner(false);
  };

  const handleContinueAnyway = () => {
    // Redirecionar para polarfix.com.br
    window.location.href = "https://polarfix.com.br";
  };

  const handleRetryConsent = () => {
    setShowWarningModal(false);
    setShowBanner(true);
  };
  
  return (
    <div className="relative h-full">
      {/* Overlay to block interaction when consent not given */}
      {!consentGiven && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40" />
      )}
      
      {/* Content with blur effect when consent not given */}
      <div className={!consentGiven ? "filter blur-sm pointer-events-none h-full" : "h-full"}>
        {children}
      </div>
      
      {/* Cookie consent banner */}
      <AnimatePresence>
        {showBanner && (
          <CookieConsentBanner 
            onAccept={handleAccept}
            onReject={handleReject}
            onOpenSettings={() => {
              setShowBanner(false);
              setShowSettings(true);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Settings modal */}
      <CookieSettingsModal 
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          if (!consentGiven) setShowBanner(true);
        }}
        onAccept={handleSettingsAccept}
      />

      {/* Warning modal para quando o usuário rejeitar cookies */}
      <WarningModal 
        isOpen={showWarningModal}
        onClose={handleRetryConsent}
        onContinueAnyway={handleContinueAnyway}
      />
    </div>
  );
};

// Export default component that combines everything
export default function CookieConsent({ children, validityDays }: CookieConsentProps) {
  const [, setCustomValidityDays] = useState<number>(
    validityDays || CONSENT_VALIDITY_DAYS
  );

  useEffect(() => {
    if (validityDays) {
      setCustomValidityDays(validityDays);
    }
  }, [validityDays]);

  return (
    <CookieConsentProvider>
      <ProtectedContent>
        {children}
      </ProtectedContent>
    </CookieConsentProvider>
  );
}