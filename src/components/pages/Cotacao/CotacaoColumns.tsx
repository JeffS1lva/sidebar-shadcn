import * as React from "react";
import axios from "axios";
import { useNavigate, NavigateFunction } from "react-router-dom"; // Correct import for NavigateFunction
import { toast } from "sonner";
import { Circle, Eye, Package, PackageOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Add the missing numericFilter function
const numericFilter = (row: any, columnId: string, filterValue: string) => {
  const rowValue = row.getValue(columnId);
  if (rowValue === null || rowValue === undefined || rowValue === "") {
    return false;
  }
  
  const numericValue = rowValue.toString();
  return numericValue.includes(filterValue);
};

// Hook for cotacao viewer functionality
// Enhanced useCotacaoViewer hook with Android PDF support
export const useCotacaoViewer = () => {
  const navigate = useNavigate();

  const showCotacaoViewer = async (cotacaoNumero: number | string, cotacaoId?: number | string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const loadingId = `loading-cotacao-${cotacaoNumero}`;
      const cotacaoIdStr = (cotacaoId || cotacaoNumero).toString();

      // Remover qualquer visualizador existente para evitar duplicações
      const existingViewer = document.getElementById(
        `cotacao-viewer-${cotacaoIdStr}`
      );
      if (existingViewer) {
        existingViewer.remove();
      }

      // Mostrar loading com design aprimorado
      const loadingEl = document.createElement("div");
      loadingEl.id = loadingId;
      loadingEl.className =
        "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50";
      loadingEl.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center max-w-md">
          <div class="relative mb-4">
            <div class="h-16 w-16 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
          </div>
          <p class="font-medium text-gray-900 dark:text-white">Carregando cotação...</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Aguarde um momento</p>
        </div>
      `;
      document.body.appendChild(loadingEl);

      try {
        // Definir o endpoint para a API
        const apiUrl = `/api/external/Pedidos/imprime-cotacao/${cotacaoNumero}`;

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        });

        // Remover o loading
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        // Verificar o content-type retornado
        const contentType = response.headers["content-type"] || "application/pdf";

        if (!contentType.includes("application/pdf")) {
          throw new Error("Resposta não é um PDF válido");
        }

        // Criar blob e URL para visualização
        const blob = new Blob([response.data], { type: "application/pdf" });
        const fileUrl = URL.createObjectURL(blob);

        // Detectar se é Android
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        // Criar container do visualizador
        const viewerContainer = document.createElement("div");
        viewerContainer.id = `cotacao-viewer-${cotacaoIdStr}`;
        viewerContainer.className =
          "fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50";

        // Adicionar HTML para o visualizador com design aprimorado
        viewerContainer.innerHTML = `
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 opacity-0 scale-95" id="viewer-container-${cotacaoIdStr}">
            <!-- Cabeçalho com gradiente -->
            <div class="bg-gradient-to-r from-sky-900 to-slate-900 p-5 text-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="bg-white/20 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">Cotação #${cotacaoNumero}</h3>
                    <div class="text-sm text-white/80">
                      Documento oficial de cotação
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <a href="${fileUrl}" download="cotacao-${cotacaoNumero}.pdf" 
                    class="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white text-blue-800 hover:bg-blue-50 shadow-sm gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download
                  </a>
                  
                  <button id="close-viewer-${cotacaoIdStr}" 
                    class="inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all bg-white/10 hover:bg-white/20 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Área do conteúdo -->
            <div class="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative" id="iframe-container-${cotacaoIdStr}">
              <!-- Gradiente superior -->
              <div class="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-400 dark:from-gray-800 to-transparent z-10"></div>
              
              <!-- Barra de informações inferior -->
              <div class="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 py-2 px-4 flex items-center justify-between backdrop-blur-sm z-10">
                <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2 text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>Documento oficial • Cotação de produtos</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  ID: ${cotacaoNumero}
                </div>
              </div>
            </div>
          </div>
        `;

        // Adicionar ao corpo do documento
        document.body.appendChild(viewerContainer);
        
        // Animar a entrada após um pequeno delay
        setTimeout(() => {
          const viewerEl = document.getElementById(`viewer-container-${cotacaoIdStr}`);
          if (viewerEl) {
            viewerEl.classList.remove('opacity-0', 'scale-95');
            viewerEl.classList.add('opacity-100', 'scale-100');
          }
        }, 50);

        // Obter o container do iframe
        const iframeContainer = document.getElementById(`iframe-container-${cotacaoIdStr}`);
        
        if (iframeContainer) {
          if (isAndroid) {
            // Para Android: usar object em vez de iframe como na DANFE
            const objectElement = document.createElement("object");
            objectElement.setAttribute("data", fileUrl);
            objectElement.setAttribute("type", "application/pdf");
            objectElement.className = "w-full h-full";

            // Mensagem para navegadores que não suportam PDF embutido
            objectElement.innerHTML = `
              <div class="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800 p-6">
                <div class="text-center max-w-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-gray-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <p class="text-lg font-semibold mb-2">Este navegador não suporta PDFs embutidos</p>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">Clique no botão abaixo para baixar o documento e visualizá-lo.</p>
                  <a href="${fileUrl}" download="cotacao-${cotacaoNumero}.pdf" class="inline-flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Baixar PDF
                  </a>
                </div>
              </div>
            `;

            iframeContainer.appendChild(objectElement);

            // Fallback adicional para Android: adicionar link direto para abrir em nova guia
            const fallbackLink = document.createElement("div");
            fallbackLink.className = "absolute top-0 right-0 p-2 z-20";
            fallbackLink.innerHTML = `
              <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" 
                 class="inline-flex items-center justify-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Abrir em nova guia
              </a>
            `;
            iframeContainer.appendChild(fallbackLink);
          } else {
            // Para outros dispositivos: usar o iframe padrão
            const iframe = document.createElement("iframe");
            iframe.src = fileUrl;
            iframe.className = "w-full h-full";
            iframe.frameBorder = "0";
            iframe.setAttribute("allow", "fullscreen");

            // Monitorar carregamento
            iframe.onload = () => {};
            iframe.onerror = () => {
              // Adicionar mensagem de erro no container
              iframeContainer.innerHTML += `
                <div class="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-black/95 z-10 p-6">
                  <div class="text-center max-w-md">
                    <div class="bg-red-100 dark:bg-red-900/30 p-4 rounded-full inline-flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Não foi possível carregar a cotação
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">
                      Estamos com dificuldades para acessar este documento no momento. 
                      Você pode fazer o download do arquivo e visualizá-lo localmente.
                    </p>
                    <a href="${fileUrl}" download="cotacao-${cotacaoNumero}.pdf" 
                      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Baixar Cotação
                    </a>
                  </div>
                </div>
              `;
            };

            iframeContainer.appendChild(iframe);
          }
        }

        // Adicionar evento de fechamento com animação de saída
        const closeButton = document.getElementById(`close-viewer-${cotacaoIdStr}`);
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            const viewerElement = document.getElementById(`viewer-container-${cotacaoIdStr}`);
            if (viewerElement) {
              // Animar saída
              viewerElement.classList.remove('opacity-100', 'scale-100');
              viewerElement.classList.add('opacity-0', 'scale-95');
              
              // Remover após animação
              setTimeout(() => {
                const containerElement = document.getElementById(`cotacao-viewer-${cotacaoIdStr}`);
                if (containerElement) {
                  containerElement.remove();
                }
                URL.revokeObjectURL(fileUrl);
              }, 300);
            } else {
              // Fallback se o elemento não for encontrado
              const containerElement = document.getElementById(`cotacao-viewer-${cotacaoIdStr}`);
              if (containerElement) {
                containerElement.remove();
              }
              URL.revokeObjectURL(fileUrl);
            }
          });
        }
      } catch (error) {
        // Remover loading
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        handleCotacaoError(error, navigate);
      }
    } catch (error) {
      toast.error("Erro ao visualizar cotação", {
        description: "Não foi possível carregar a cotação. Tente novamente mais tarde.",
      });
    }
  };

  return { showCotacaoViewer };
};

export const getStatusConfig = (status: string) => {
  const config = {
    classes: "",
    icon: React.createElement(Circle, { className: "h-3 w-3 mr-1" }),
  };

  switch (status) {
    case "Aberto":
      config.classes = "bg-yellow-100 text-yellow-800";
      config.icon = React.createElement(PackageOpen, { className: "h-3 w-3 mr-1" });
      break;
    case "Fechado":
      config.classes = "bg-green-100 text-green-800";
      config.icon = React.createElement(Package, { className: "h-3 w-3 mr-1" });
      break;
    case "Rejeitada":
      config.classes = "bg-red-100 text-red-800";
      break;
    default:
      config.classes = "bg-zinc-300 text-gray-800 px-7";
  }

  return config;
};

// Funções auxiliares
const handleCotacaoError = (error: unknown, navigate: NavigateFunction) => {
  // Mostrar erro específico com base na resposta
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 404) {
      toast.error("Cotação não encontrada", {
        description:
          "O sistema não conseguiu localizar esta cotação. Verifique se o código está correto.",
      });
    } else if (status === 401 || status === 403) {
      toast.error("Acesso não autorizado", {
        description:
          "Sua sessão pode ter expirado. Tente fazer login novamente.",
      });
      navigate("/login");
    } else {
      toast.error(
        `Erro ao acessar a cotação (${status || "desconhecido"})`,
        {
          description:
            "Houve um problema ao tentar acessar a cotação. Tente novamente mais tarde.",
        }
      );
    }
  } else {
    toast.error("Erro ao acessar a cotação", {
      description:
        "Houve um problema de conexão. Verifique sua internet e tente novamente.",
    });
  }
};

// Componente de botão reutilizável para visualizar cotações
interface CotacaoViewerButtonProps {
  cotacaoNumero: number | string;
  cotacaoId?: number | string;
  disabled?: boolean;
  className?: string;
}

export const CotacaoViewerButton: React.FC<CotacaoViewerButtonProps> = ({
  cotacaoNumero,
  cotacaoId,
  disabled = false,
  className = ""
}) => {
  const { showCotacaoViewer } = useCotacaoViewer();
  
  const handleViewCotacao = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    showCotacaoViewer(cotacaoNumero, cotacaoId);
  };

  return (
    <button
      title={disabled ? "Cotação não disponível" : "Visualizar Cotação"}
      onClick={handleViewCotacao}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <Eye className="h-4 w-4 mr-2" />
      Visualizar
    </button>
  );
};

// Hook para gerar colunas de tabela que incluem a funcionalidade de visualização
export const useCotacaoColumns = () => {
  const { showCotacaoViewer } = useCotacaoViewer();

  return [
    {
      accessorKey: "n_Cotacao",
      header: "Nº Cotação",
      filterFn: numericFilter,
      cell: ({ row }: { row: any }) => {
        const numeroCotacao = row.getValue("n_Cotacao");
        const cotacaoId = row.original.id;

        const hasCotacao =
          numeroCotacao !== null &&
          numeroCotacao !== undefined &&
          numeroCotacao !== "";

        const handleViewCotacao = async (e: React.MouseEvent) => {
          e.preventDefault();
          if (!hasCotacao) return;
          
          // Usa o hook reutilizável para visualizar a cotação
          showCotacaoViewer(numeroCotacao, cotacaoId);
        };

        return (
          <div className="flex items-center gap-2">
            {/* Número da cotação com tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block text-center font-medium min-w-[50px]">
                    {hasCotacao ? numeroCotacao.toString() : "N/A"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {hasCotacao 
                    ? `Cotação #${numeroCotacao} - Clique no ícone para visualizar` 
                    : "Cotação não disponível"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex gap-1">
              {/* Botão de visualização com tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleViewCotacao}
                      disabled={!hasCotacao}
                      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0 cursor-pointer ${
                        !hasCotacao ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Visualizar</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasCotacao 
                      ? `Visualizar Cotação ` 
                      : "Cotação não disponível"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "data_Cotacao",
      header: "Data Cotação",
      cell: ({ row }: { row: any }) => {
        const dateString = row.getValue("data_Cotacao");
        if (!dateString) return "";
        // Formato YYYY-MM-DD para DD/MM/YYYY
        const [year, month, day] = (dateString as string)
          .split("T")[0]
          .split("-");
        return `${day}/${month}/${year}`;
      },
      filterFn: (row: any, columnId: string, filterValue: any) => {
        if (!filterValue?.start || !filterValue?.end) return true;
        const dateString = row.getValue(columnId) as string;
        if (!dateString) return false;

        const datePart = dateString.split("T")[0];
        const [year, month, day] = datePart.split("-").map(Number);
        const cellDate = new Date(Date.UTC(year, month - 1, day));

        const [startYear, startMonth, startDay] = filterValue.start
          .split("-")
          .map(Number);
        const startDate = new Date(
          Date.UTC(startYear, startMonth - 1, startDay)
        );

        const [endYear, endMonth, endDay] = filterValue.end
          .split("-")
          .map(Number);
        const endDate = new Date(
          Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
        );
        return cellDate >= startDate && cellDate <= endDate;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("status") as string;
        const { classes, icon } = getStatusConfig(status);
        return (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classes}`}
          >
            {icon}
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "nome_Cliente",
      header: "Cliente",
      cell: ({ row }: { row: any }) => (
        <div
          className="whitespace-nowrap overflow-hidden text-ellipsis flex w-56"
          title={row.getValue("nome_Cliente")}
        >
          {row.getValue("nome_Cliente")}
        </div>
      ),
    },
    {
      accessorKey: "uf",
      header: "UF",
    },
    {
      accessorKey: "valor_Total_Cotacao",
      header: "Valor Total",
      cell: ({ row }: { row: any }) => {
        const value = parseFloat(row.getValue("valor_Total_Cotacao") as string);
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
        return formatted;
      },
    },
    {
      accessorKey: "vendedor1",
      header: "Vendedor",
      cell: ({ row }: { row: any }) => {
        const vendedor1 = row.getValue("vendedor1");
        const vendedor2 = row.original.vendedor2;
        const vendedor3 = row.original.vendedor3;

        let displayText = vendedor1 as string;

        if (vendedor2) {
          displayText += `, ${vendedor2}`;
        }
        if (vendedor3) {
          displayText += `, ${vendedor3}`;
        }

        return (
          <div
            className="whitespace-nowrap overflow-hidden text-ellipsis flex w-40"
            title={displayText}
          >
            {displayText}
          </div>
        );
      },
    },
  ];
};