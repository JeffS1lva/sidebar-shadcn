import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CustomCard,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "../Dark-Mode/ModeToggle";
import { FirstAcess } from "./FirstAcess";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TimeoutErrorModal } from "./TimeoutErrorModal";
import { LoginFormProps } from "./types/auth.types";
import ForgotPasswordModal from "./ForgotPasswordModal";
import ThemeAwareLogo from "./ThemeAwareLogo";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "next-themes";
import { LargeScreenLayout } from "./Screen/LargeScreen";
import { OnboardingTooltip } from "./OnboardingTooltip";

export const LoginForm: React.FC<LoginFormProps> = ({
  className,
  onLoginSuccess,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const modeToggleRef = useRef<HTMLDivElement>(null);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  useTheme();
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const seenTooltip = localStorage.getItem("seen-onboarding-tooltip");
    if (seenTooltip) {
      setShowOnboarding(false);
    }
  }, []);

  const handleCloseTooltip = () => {
    localStorage.setItem("seen-onboarding-tooltip", "true");
    setShowOnboarding(false);
  };

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1800);
    };

    checkScreenSize(); // Check on load
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    isFirstAccess,
    forgotPasswordOpen,
    setForgotPasswordOpen,
    showTimeoutModal,
    handleLogin,
    handleRequestAccess,
    handleFirstAccessToggle,
    handleCloseTimeoutModal,
    handleRequestAccessFromModal,
    handleForgotPasswordFromModal,
    navigateToLoginWithFirstAccess,
  } = useAuth(onLoginSuccess);

  // Form components for both first access and login
  const renderForm = () => {
    if (isFirstAccess) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRequestAccess(false);
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <motion.div
                whileTap={{ scale: 0.98 }}
                whileFocus={{ scale: 1.02 }}
              >
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="m@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/40"
                />
              </motion.div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm animate-pulse"
              >
                {error}
              </motion.p>
            )}

            <div className="w-full">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full relative"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="opacity-0">Enviar Solicitação</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    </>
                  ) : (
                    "Enviar Solicitação"
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Input
                id="email"
                type="email"
                value={email}
                placeholder="m@example.com"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/40"
              />
            </motion.div>
          </div>
          <div className="grid">
            <div className="flex justify-between">
              <Label htmlFor="password">Senha</Label>
              <Dialog
                open={forgotPasswordOpen}
                onOpenChange={setForgotPasswordOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="px-0 font-normal cursor-pointer"
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Esqueceu sua senha?
                  </Button>
                </DialogTrigger>
                <ForgotPasswordModal
                  isOpen={forgotPasswordOpen}
                  onClose={() => setForgotPasswordOpen(false)}
                  defaultEmail={email}
                />
              </Dialog>
            </div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                placeholder="Digite sua senha.."
                disabled={loading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/40"
              />
            </motion.div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm animate-pulse"
            >
              {error}
            </motion.p>
          )}

          <div className="w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full relative cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="opacity-0">Login</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
                    </div>
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    );
  };

  // Small screen layout
  const renderSmallScreenLayout = () => (
    <div
      className={`flex flex-col gap-6 w-auto px-8 sm:px-16 lg:px-96 py-10 ${
        loading ? "opacity-70 pointer-events-none" : ""
      }`}
      {...props}
    >
      <div className="absolute right-4" ref={modeToggleRef}>
        <div className="relative">
          <div>
            <ModeToggle />
          </div>
          {showTooltip && (
            <div className="absolute right-0 top-12 w-64 bg-background border border-border rounded-lg p-4 shadow-lg">
              <div className="absolute -top-2 right-4 w-4 h-4 bg-background border-t border-l border-border transform rotate-45"></div>
              <div className="text-base font-medium mb-1">Alternar Tema</div>
              <div className="text-sm text-muted-foreground">
                Este botão permite mudar entre o tema claro e escuro do site.
              </div>
              <div className="mt-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTooltip(false)}
                  className="text-xs"
                >
                  Entendi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-15">
        <ThemeAwareLogo />
      </div>

      <CustomCard>
        <div className="absolute top-42 right-95 mt-11 mr-4">
          <FirstAcess
            onToggle={handleFirstAccessToggle}
            isFirstAccess={isFirstAccess}
          />
          {showOnboarding && (
            <OnboardingTooltip
              onClose={handleCloseTooltip}
              email={email}
              onEmailChange={(newEmail) => setEmail(newEmail)}
              onRequestAccess={() => console.log("Solicitando acesso...")}
              navigateToLoginWithFirstAccess={navigateToLoginWithFirstAccess}
            />
          )}
        </div>

        <CardHeader>
          <CardTitle className="text-2xl">
            {isFirstAccess ? "Primeiro Acesso" : "Login"}
          </CardTitle>
          <CardDescription>
            {isFirstAccess
              ? "Digite seu e-mail abaixo para solicitar acesso"
              : "Digite seu e-mail abaixo para fazer login em sua conta"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={isFirstAccess ? "first-access-form" : "login-form"}
              initial={{ opacity: 0, x: isFirstAccess ? -100 : 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isFirstAccess ? 100 : -100 }}
              transition={{ duration: 0.3 }}
            >
              {renderForm()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </CustomCard>
    </div>
  );

  // Main form content for large screen
  const renderFormContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={isFirstAccess ? "first-access-form" : "login-form"}
        initial={{ opacity: 0, x: isFirstAccess ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isFirstAccess ? 100 : -100 }}
        transition={{ duration: 0.3 }}
      >
        {renderForm()}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      {/* Timeout Error Modal */}
      <TimeoutErrorModal
        isOpen={showTimeoutModal}
        onClose={handleCloseTimeoutModal}
        email={email}
        onEmailChange={setEmail}
        onRequestAccess={handleRequestAccessFromModal}
        onForgotPassword={handleForgotPasswordFromModal}
        loading={loading}
        navigateToLoginWithFirstAccess={navigateToLoginWithFirstAccess}
      />

      {/* Render layout based on screen size */}
      {!isLargeScreen ? (
        renderSmallScreenLayout()
      ) : (
        <LargeScreenLayout
          isFirstAccess={isFirstAccess}
          handleFirstAccessToggle={handleFirstAccessToggle}
          loading={loading}
        >
          <div className="relative flex flex-col gap-4">
            <div className="relative">
              {showOnboarding && (
                <OnboardingTooltip
                  onClose={handleCloseTooltip}
                  email={email}
                  onEmailChange={(newEmail) => setEmail(newEmail)}
                  onRequestAccess={() => console.log("Solicitando acesso...")}
                  navigateToLoginWithFirstAccess={
                    navigateToLoginWithFirstAccess
                  }
                />
              )}
            </div>
            {renderFormContent()}
          </div>
        </LargeScreenLayout>
      )}
    </>
  );
};
