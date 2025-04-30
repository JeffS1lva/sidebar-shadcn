import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Info, Target, Shield } from "lucide-react";
import { FirstAcess } from "../FirstAcess";
import ThemeAwareScreen from "./ThemeAwareScreen";
import { ModeToggle } from "@/components/Dark-Mode/ModeToggle";
import { Button } from "@/components/ui/button";

interface LargeScreenLayoutProps {
  children: React.ReactNode;
  isFirstAccess: boolean;
  handleFirstAccessToggle: (value: boolean) => void;
  loading: boolean;
}

export const LargeScreenLayout: React.FC<LargeScreenLayoutProps> = ({
  children,
  isFirstAccess,
  handleFirstAccessToggle,
  loading,
}) => {
  const [activeInfo, setActiveInfo] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const modeToggleRef = useRef<HTMLDivElement>(null);

  // Company information with corresponding icons
  const companyInfo = [
    {
      title: "Sobre Nós",
      description:
        "Somos uma empresa especializada em soluções inovadoras para gestão de processos empresariais.",
      icon: <Info className="h-6 w-6" />,
    },
    {
      title: "Nossa Missão",
      description:
        "Produzir, distribuir e inovar uma linha completa de alta qualidade; Promover a garantia da qualidade de seus produtos destinados ao setor médico-hospitalar. Atender aos mais rigorosos padrões de exigências, igualando-se ao que existe de melhor no mercado internacional.",
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: "Nossos Valores",
      description:
        "Manter uma equipe de colaboradores motivada e qualificada; Estabelecer sólidas parcerias com fornecedores; Garantir a satisfação dos Clientes.",
      icon: <Shield className="h-6 w-6" />,
    },
  ];

  // Header content for form
  const renderHeaderContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={isFirstAccess ? "first-access" : "login"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-semibold">
          {isFirstAccess ? "Primeiro Acesso" : "Login"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFirstAccess
            ? "Digite seu e-mail abaixo para solicitar acesso"
            : "Digite seu e-mail abaixo para fazer login em sua conta"}
        </p>
      </motion.div>
    </AnimatePresence>
  );

  // Company info section for large screens
  const renderCompanyInfo = () => (
    <div className="space-y-8 text-white/90 relative min-h-[200px]">
      {companyInfo.map((info, index) => (
        <AnimatePresence key={index} mode="wait">
          {activeInfo === index && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-start space-x-4 absolute w-full"
            >
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {info.icon}
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white">
                  {info.title}
                </h3>
                <p className="mt-2 text-lg">{info.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="absolute right-4 top-7" ref={modeToggleRef}>
        <div className="relative">
          <div>
            <ModeToggle/>
          </div>
          {showTooltip && (
            <div className="absolute right-0 top-12 w-64 bg-background border border-border rounded-lg p-4 shadow-lg z-50">
              <div className="absolute -top-2 right-4 w-4 h-4 bg-background border-t border-l border-border transform rotate-45"></div>
              <div className="text-lg font-medium mb-1">Alternar Tema</div>
              <div className="text-lg text-muted-foreground">
                Este botão permite mudar entre o tema claro e escuro do site.
              </div>
              <div className="mt-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTooltip(false)}
                  className="text-lg"
                >
                  Entendi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`w-full max-w-7xl flex rounded-lg overflow-hidden shadow-2xl shadow-black dark:shadow-2xl dark:shadow-amber-400 transition-all duration-300 relative ${
          loading ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        {/* FirstAccess toggle positioned at the top of the container */}
        <div className="absolute top-4 right-4 z-50">
          <div className="relative">
            <FirstAcess
              onToggle={handleFirstAccessToggle}
              isFirstAccess={isFirstAccess}
              className="text-lg"
            />
          </div>
        </div>

        {/* Company information section - visible only on larger screens */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/2 bg-gradient-to-br from-primary/80 to-primary dark:from-primary/10 dark:to-primary/80 p-12 flex-col justify-between relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="mb-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ThemeAwareScreen />
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl font-bold text-white mb-12"
            >
              Bem-vindo à Nossa Plataforma
            </motion.h2>

            {renderCompanyInfo()}

            {/* Navigation indicators */}
            <div className="flex space-x-2 mt-36">
              {companyInfo.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveInfo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeInfo === index
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Ver informação ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Decorative animated elements */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-white/10"
          />

          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10"
          />

          {/* Image with animated border */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="absolute bottom-12 right-12 border-4 border-white/30 rounded-lg overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end">
              <div className="p-4 text-white">
                <p className="font-medium">Interface intuitiva</p>
                <div className="flex items-center text-sm mt-1">
                  <span>Explore</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Login form section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-1/2 bg-background flex flex-col justify-center items-center"
        >
          {/* Centered login content without Card/borders */}
          <div className="p-6 w-full max-w-md">
            <div className="relative">
              <div className="mb-6">{renderHeaderContent()}</div>
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
