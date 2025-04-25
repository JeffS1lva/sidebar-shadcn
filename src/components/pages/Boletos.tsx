"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
  VisibilityState,
  FilterFn,
} from "@tanstack/react-table";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Paginacao } from "../pages/Paginacao";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BoletoFilter } from "../pages/Boletos/BoletosFilter";
import { useState, useEffect } from "react";
import { Parcela } from "../../types/parcela";
import EmptyBoletosError from "./Boletos/EmptyBoletosError";

// Função para verificar se o token está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Converte para milissegundos
    return Date.now() > expirationTime;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return true; // Em caso de erro, considerar o token como expirado
  }
};

const numericFilter: FilterFn<Parcela> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  if (typeof value === "number") {
    return value.toString().includes(filterValue);
  }
  return false;
};

export const Boletos: React.FC = () => {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [allParcelas, setAllParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchType] = useState<"codigoPN" | "numNF" | "codigoBoleto">(
    "codigoPN"
  );
  // Estado para controlar o debounce da busca
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>("");
  // Manter o estado da paginação atual
  const [currentPage, setCurrentPage] = useState<number>(0);

  const navigate = useNavigate();

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  
  const formatCNPJ = (cnpj: string): string => {
    if (!cnpj || cnpj.length !== 14) return cnpj;
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  };

  // Aplicar debounce ao valor de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300); // Atraso de 300ms para evitar muitas requisições

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Efeito para buscar quando o valor com debounce mudar
  useEffect(() => {
    fetchParcelas(debouncedSearchValue);
  }, [debouncedSearchValue, searchType]);

  React.useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }
  }, [navigate]);

  function formatDatePtBr(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR");
  }

  function parseDate(str: string): Date {
    // Aceita dd/MM/yyyy ou yyyy-MM-dd
    if (str.includes("/")) {
      const [day, month, year] = str.split("/").map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    } else {
      const [year, month, day] = str.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    }
  }

  const columns: ColumnDef<Parcela>[] = [
    {
      accessorKey: "codigoBoleto",
      header: "Código",
      filterFn: numericFilter,
      cell: ({ row }) => {
        const codigoBoleto = row.getValue("codigoBoleto") as
          | string
          | number
          | null
          | undefined;
        // Acessar o id diretamente do objeto original
        const id = row.original.id;
        // Acessar a data de vencimento
        const dataVencimento = row.getValue("dataVencimento") as string;
        // Acessar o status para verificar se foi pago
        const status = row.getValue("status") as string;

        const hasCodigoBoleto =
          codigoBoleto !== null &&
          codigoBoleto !== undefined &&
          codigoBoleto !== "";

        const hasId = id !== null && id !== undefined;

        // Verificar se o boleto está vencido
        const vencimento = parseDate(dataVencimento);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isExpired = vencimento < today;

        const isPaid = ["baixado", "pago"].includes(
          status?.toLowerCase() || ""
        );

        const boletoAvailable = hasId && !isExpired && !isPaid;

        const buttonTitle = !hasId
          ? "Boleto não disponível"
          : isExpired
          ? isPaid
            ? "Este boleto já foi quitado e não está mais disponível para visualização."
            : "Boleto vencido - não pode ser visualizado"
          : isPaid
          ? "Este boleto já foi quitado e não está mais disponível para visualização."
          : "Visualizar boleto para pagamento";

        const handleViewBoleto = async (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }

            const boletoId = hasCodigoBoleto ? String(codigoBoleto) : "";
            const parcelaId = String(id);
            const loadingId = `loading-boleto-${boletoId}`;

            console.log(
              `Tentando acessar boleto: ID=${boletoId}, ParcelaID=${parcelaId}`
            );

            // Remover qualquer visualizador existente para evitar duplicações
            const existingViewer = document.getElementById(
              `boleto-viewer-${boletoId}`
            );
            if (existingViewer) {
              existingViewer.remove();
            }

            // Mostrar loading
            const loadingEl = document.createElement("div");
            loadingEl.id = loadingId;
            loadingEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            loadingEl.innerHTML = `
              <div class="dark:bg-gray-800 bg-white dark:text-white rounded-md p-4 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>Carregando Boleto ${boletoId}...</p>
              </div>
            `;
            document.body.appendChild(loadingEl);

            const apiUrl = `/api/external/Boletos/${boletoId}/pdf`;

            console.log(`Fazendo requisição para: ${apiUrl}`);

            try {
              // Configurar cabeçalhos de depuração
              const headers = {
                Authorization: `Bearer ${token}`,
                Accept: "application/pdf, application/octet-stream", // Aceitar diferentes tipos de conteúdo
              };

              console.log("Headers da requisição:", headers);

              const response = await axios.get(apiUrl, {
                headers,
                responseType: "blob",
              });

              console.log("Resposta recebida:", response.status);
              console.log("Content-Type:", response.headers["content-type"]);
              console.log(
                "Content-Length:",
                response.headers["content-length"]
              );

              // Remover o loading
              const loadingElement = document.getElementById(loadingId);
              if (loadingElement) {
                loadingElement.remove();
              }

              // Verificar se o conteúdo retornado é PDF ou stream de bytes
              const contentType =
                response.headers["content-type"] || "application/pdf";

              // Criar blob mesmo se o content-type não for exatamente application/pdf
              const blob = new Blob([response.data], {
                type: contentType.includes("pdf")
                  ? "application/pdf"
                  : contentType,
              });

              console.log("Blob criado:", blob.size, "bytes, tipo:", blob.type);

              // Criar objeto URL para uso no iframe e download
              const fileUrl = URL.createObjectURL(blob);
              console.log("URL do blob:", fileUrl);

              // Criar container do visualizador
              const viewerContainer = document.createElement("div");
              viewerContainer.id = `boleto-viewer-${boletoId}`;
              viewerContainer.className =
                "fixed inset-0 bg-black/75 flex flex-col items-center justify-center z-50";

              // Adicionar HTML para o visualizador com estilos dark mode
              viewerContainer.innerHTML = `
                <div class="dark:bg-gray-900 bg-white text-black dark:text-white rounded-md w-4/5 h-4/5 flex flex-col overflow-hidden">
                  <div class="flex justify-between items-center p-3 border-b border-gray-700">
                    <h3 class="font-medium">Boleto #${boletoId}</h3>
                    <div class="flex gap-2">
                      <a href="${fileUrl}" download="boleto-${
                boletoId || parcelaId
              }.pdf" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 w-full p-0  dark:text-black  px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download
                      </a>
                      <button id="close-viewer-${boletoId}" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background borde border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 bg-zinc-300 h-8 px-3">
                        Fechar
                      </button>
                    </div>
                  </div>
                  <div class="flex-1 overflow-hidden dark:bg-gray-900" id="iframe-container-${boletoId}">
                    <!-- O iframe será inserido aqui via JavaScript -->
                  </div>
                </div>
              `;

              // Adicionar ao corpo do documento
              document.body.appendChild(viewerContainer);

              // Criar e adicionar o iframe
              const iframeContainer = document.getElementById(
                `iframe-container-${boletoId}`
              );
              if (iframeContainer) {
                const iframe = document.createElement("iframe");
                iframe.src = fileUrl;
                iframe.className = "w-full h-full";
                iframe.frameBorder = "0";
                iframe.setAttribute("allow", "fullscreen");
                iframe.setAttribute("data-content-type", contentType);

                // Monitorar carregamento
                iframe.onload = () =>
                  console.log("iframe carregado com sucesso");
                iframe.onerror = (err) => {
                  console.error("Erro ao carregar iframe:", err);
                  // Adicionar mensagem de erro no container
                  iframeContainer.innerHTML += `
                    <div class="absolute inset-0 flex items-center justify-center dark:bg-gray-800/80">
                      <div class="dark:bg-gray-900 p-4 rounded shadow-md text-center">
                        <p class="text-red-400 font-medium">Erro ao exibir o PDF</p>
                        <p class="mt-2 text-gray-300">Você ainda pode baixar o arquivo usando o botão "Download"</p>
                      </div>
                    </div>
                  `;
                };

                iframeContainer.appendChild(iframe);
                console.log("iframe adicionado ao container");
              }

              // Adicionar evento de fechamento
              document
                .getElementById(`close-viewer-${boletoId}`)
                ?.addEventListener("click", () => {
                  const viewerElement = document.getElementById(
                    `boleto-viewer-${boletoId}`
                  );
                  if (viewerElement) {
                    viewerElement.remove();
                  }
                  URL.revokeObjectURL(fileUrl);
                });
            } catch (error) {
              console.error("Erro na requisição axios:", error);

              // Remover loading
              document.getElementById(loadingId)?.remove();

              // Mostrar erro específico com base na resposta
              if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                console.log("Erro HTTP:", status);
                console.log("Resposta de erro:", error.response?.data);

                if (status === 404) {
                  toast.error("Boleto não encontrado", {
                    description:
                      "O sistema não conseguiu localizar este boleto. Verifique se o código está correto.",
                  });
                } else if (status === 401 || status === 403) {
                  toast.error("Acesso não autorizado", {
                    description:
                      "Sua sessão pode ter expirado. Tente fazer login novamente.",
                  });
                  navigate("/login");
                } else {
                  toast.error(
                    `Erro ao acessar o boleto (${status || "desconhecido"})`,
                    {
                      description:
                        "Houve um problema ao tentar acessar o boleto. Tente novamente mais tarde.",
                    }
                  );
                }
              } else {
                toast.error("Erro ao acessar o boleto", {
                  description:
                    "Houve um problema de conexão. Verifique sua internet e tente novamente.",
                });
              }
            }
          } catch (error) {
            console.error("Erro geral ao exibir boleto:", error);
            const loadingId = `loading-boleto-${
              hasCodigoBoleto ? String(codigoBoleto) : "-"
            }`;
            document.getElementById(loadingId)?.remove();

            toast.error("Erro ao visualizar boleto", {
              description:
                "Não foi possível carregar o boleto. Tente novamente mais tarde.",
            });
          }
        };

        return (
          <div className="flex items-center gap-1">
            <span className="block text-center font-medium min-w-[50px]">
              {hasCodigoBoleto ? String(codigoBoleto) : "-"}
            </span>
            <div className="flex gap-1">
              <button
                title={buttonTitle}
                onClick={handleViewBoleto}
                disabled={!boletoAvailable}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0 ${
                  !boletoAvailable
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <Eye className="h-4 w-4 dark:text-black" />
                <span className="sr-only">
                  {!boletoAvailable
                    ? isPaid
                      ? "Boleto indisponível: já está pago"
                      : "Boleto indisponível"
                    : "Visualizar boleto para pagamento"}
                </span>
              </button>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "nomePN",
      header: "Nome",
      cell: ({ row }) => (
        <div
          className="whitespace-nowrap overflow-hidden text-ellipsis flex w-56 dark:text-gray-200"
          title={row.getValue("nomePN")}
        >
          {row.getValue("nomePN")}
        </div>
      ),
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">
          {formatCNPJ(row.getValue("cnpj"))}
        </span>
      ),
    },
    {
      accessorKey: "numNF",
      header: "NF",
      filterFn: "includesString",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">{row.getValue("numNF")}</span>
      ),
    },
    {
      accessorKey: "parcela",
      header: "Parcela",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">{row.getValue("parcela")}</span>
      ),
    },
    {
      accessorKey: "valorParcela",
      header: "Valor",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">
          {formatCurrency(row.getValue("valorParcela"))}
        </span>
      ),
    },
    {
      accessorKey: "dataVencimento",
      header: "Vencimento",
      cell: ({ row }) => {
        const value = row.getValue("dataVencimento") as string;
        return (
          <span className="dark:text-gray-200">{formatDatePtBr(value)}</span>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue?.start || !filterValue?.end) return true;

        const cellValue = row.getValue(columnId) as string;
        if (!cellValue) return false;

        const cellDate = parseDate(cellValue);
        const startDate = parseDate(filterValue.start);
        const endDate = parseDate(filterValue.end);

        // Para considerar o dia inteiro do "end"
        endDate.setUTCHours(23, 59, 59, 999);

        return cellDate >= startDate && cellDate <= endDate;
      },
    },
    // Nova coluna para Status
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const dataVencimento = row.getValue("dataVencimento") as string;
        const dataPagamento = row.getValue("dataPagamento") as string;

        // Definir cores, rótulos e ícones baseados no status
        let statusColor = "";
        let statusLabel = status || "N/A";
        let statusIcon = null;

        switch (status?.toLowerCase()) {
          case "baixado":
            statusColor =
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            statusLabel = "Pago";
            statusIcon = (
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            );
            break;
          case "gerado":
          case "confirmado":
          case "remessa":  // Adicionado o caso para "remessa"
            statusColor =
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
            statusLabel = "Pendente";
            statusIcon = (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            );
            break;
          case "pago":
            statusColor =
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            statusLabel = "Pago";
            statusIcon = (
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            );
            break;
          case "pendente":
            // Verifica se está atrasado baseado na data de vencimento
            const hoje = new Date();
            const vencimento = parseDate(dataVencimento);
            if (vencimento < hoje && !dataPagamento) {
              statusColor =
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
              statusLabel = "Atrasado";
              statusIcon = (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              );
            } else {
              statusColor =
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
              statusLabel = "Pendente";
              statusIcon = (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              );
            }
            break;
          case "atrasado":
            statusColor =
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            statusLabel = "Atrasado";
            statusIcon = (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            );
            break;
          case "cancelado":
            statusColor =
              "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            statusLabel = "Cancelado";
            statusIcon = (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            );
            break;
          default:
            statusColor =
              "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }

        return (
          <div className="flex justify-start">
            <span
              className={`w-24 py-1 pl-3 rounded-md text-xs font-medium flex items-center justify-start ${statusColor}`}
            >
              {statusIcon}
              {statusLabel}
            </span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const status = String(row.getValue(columnId)).toLowerCase();
        return filterValue.toLowerCase() === status;
      },
    },
    // Nova coluna para Data de Pagamento
    {
      accessorKey: "dataPagamento",
      header: "Data Pagamento",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const dataPagamento = row.getValue("dataPagamento") as string;

        // Função para formatar a data no padrão pt-BR
        const formatarDataPtBr = (data: string) => {
          if (!data) return "";

          try {
            const dataObj = new Date(data);
            return dataObj.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
          } catch (error) {
            return data; // Retorna a string original em caso de erro
          }
        };

        // Lógica baseada no status
        if (status?.toLowerCase() === "baixado") {
          // Se for "baixado", mostrar data de pagamento formatada
          return dataPagamento ? (
            <span className="text-zinc-500">
              {formatarDataPtBr(dataPagamento)}
            </span>
          ) : (
            <span>Pago</span>
          );
        } else if (
          status?.toLowerCase() === "gerado" ||
          status?.toLowerCase() === "confirmado" ||
          status?.toLowerCase() === "remessa"  // Adicionado o caso para "remessa" aqui também
        ) {
          // Se for "gerado", "confirmado" ou "remessa", mostrar "aguardando pagamento"
          return <span className="text-zinc-400">Aguardando pagamento</span>;
        } else if (status?.toLowerCase() === "pago") {
          // Para status "pago", mostrar a data de pagamento formatada
          return dataPagamento ? (
            <span> {formatarDataPtBr(dataPagamento)}</span>
          ) : (
            <span> Pago</span>
          );
        } else if (status?.toLowerCase() === "pendente") {
          // Para status "pendente", mostrar "aguardando pagamento"
          return <span>Aguardando pagamento</span>;
        } else if (status?.toLowerCase() === "atrasado") {
          // Para status "atrasado"
          return <span>Em atraso</span>;
        } else {
          // Para qualquer outro status
          return <span className="text-zinc-400">Aguardando pagamento</span>;
        }
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue?.start || !filterValue?.end) return true;

        const cellValue = row.getValue(columnId) as string;
        if (!cellValue) return false;

        const cellDate = parseDate(cellValue);
        const startDate = parseDate(filterValue.start);
        const endDate = parseDate(filterValue.end);

        // Para considerar o dia inteiro do "end"
        endDate.setUTCHours(23, 59, 59, 999);

        return cellDate >= startDate && cellDate <= endDate;
      },
    },
  ];

  const table = useReactTable({
    data: parcelas,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage,
        pageSize: 6,
      },
    },
    // Adicionado para corrigir o problema de paginação
    autoResetPageIndex: false, // Impede o reset da página quando os dados/filtros mudam

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      // Verifica se updater é uma função ou um objeto
      if (typeof updater === "function") {
        const newPaginationState = updater(table.getState().pagination);
        setCurrentPage(newPaginationState.pageIndex);
      } else {
        // Se for um objeto PaginationState direto
        setCurrentPage(updater.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  // Função para buscar as parcelas usando axios
  const fetchParcelas = async (searchValue: string = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      // Armazenar estado de paginação atual antes de atualizar os dados
      const currentPaginationState = table.getState().pagination;

      // Determine o parâmetro correto com base no tipo de pesquisa
      const params: Record<string, string> = {};
      if (searchValue) {
        params[searchType] = searchValue;
      }

      const response = await axios.get("/api/external/Parcelas/parcelas", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extrair os dados da resposta, considerando diferentes estruturas possíveis
      let parcelasData = [];
      console.log(response);
      if (response.data && Array.isArray(response.data.parcelas)) {
        parcelasData = response.data.parcelas;
      } else if (Array.isArray(response.data.value)) {
        parcelasData = response.data.value;
      } else if (Array.isArray(response.data.data)) {
        parcelasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        parcelasData = response.data;
      }

      if (Array.isArray(parcelasData)) {
        // Ordenar por data de vencimento
        parcelasData.sort((a, b) => {
          const dateA = a.dataVencimento
            ? new Date(a.dataVencimento).getTime()
            : 0;
          const dateB = b.dataVencimento
            ? new Date(b.dataVencimento).getTime()
            : 0;
          return dateA - dateB;
        });

        setAllParcelas(parcelasData);
        setParcelas(parcelasData);

        if (parcelasData.length === 0) {
          setError("empty");
        } else {
          setError(null);
        }

        // Só redefina para a primeira página se a busca mudou
        if (searchValue && debouncedSearchValue !== searchValue) {
          setCurrentPage(0);
        } else {
          // Caso contrário, mantenha a página atual, se possível
          const maxPage =
            Math.ceil(parcelasData.length / currentPaginationState.pageSize) -
            1;
          if (currentPaginationState.pageIndex > maxPage) {
            setCurrentPage(Math.max(0, maxPage));
          }
        }
      } else {
        console.error("Estrutura de dados inesperada:", response.data);
        setParcelas([]);
        setAllParcelas([]);
        setError("Formato de dados recebido é inválido");
      }
    } catch (err) {
      console.error("Erro ao buscar parcelas:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else if (err.response?.status === 500) {
          setError(
            "Erro interno no servidor. A API de parcelas pode estar indisponível."
          );
        } else {
          setError(
            `Erro ao carregar boletos: ${
              err.response?.status || "Desconhecido"
            }`
          );
        }
      } else {
        setError("error");
      }

      setParcelas([]);
      setAllParcelas([]);
    } finally {
      setLoading(false);
    }
  };

  // Modificado para aplicar o filtro sem resetar a página, a menos que seja uma nova busca
  React.useEffect(() => {
    const isNewSearch = searchValue !== debouncedSearchValue;

    if (searchType === "codigoBoleto") {
      const numericValue = searchValue.replace(/\D/g, "");
      table.getColumn(searchType)?.setFilterValue(numericValue);
    } else if (searchType === "codigoPN" || searchType === "numNF") {
      table.getColumn(searchType)?.setFilterValue(searchValue);
    }

    // Só redefina a página se for uma nova busca
    if (isNewSearch && searchValue) {
      setCurrentPage(0);
    }
  }, [searchValue, searchType, table, debouncedSearchValue]);

  const handleBack = () => {
      navigate("/inicio"); // ou qualquer outra rota conforme a estrutura da sua aplicação
    };
  
    const handleRetry = () => {
      // Tenta buscar os boletos novamente usando o mesmo intervalo de datas
      fetchParcelas();
    };
  
    // Handler para filtros de data
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4">Carregando boletos...</p>
        </div>
      );
    }
  
    if (error === "empty") {
      return (
        <EmptyBoletosError
          alertMessage="Não foram encontrados boletos."
          onRetry={handleRetry}
          onBack={handleBack}
          showBackButton={true}
        />
      );
    }
  
    if (error === "error") {
      return (
        <EmptyBoletosError
          alertMessage="Ocorreu um erro ao carregar os boletos. Por favor, tente novamente."
          onRetry={handleRetry}
          onBack={handleBack}
          showBackButton={true}
        />
      );
    }

  // Componente de paginação modificado para usar o estado currentPage
  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  return (
    <div className="w-full p-2 ">
      <h1 className="text-3xl font-bold dark:text-white">Boletos</h1>

      <BoletoFilter
        allParcelas={allParcelas}
        setParcelas={setParcelas}
        table={table}
        onSearch={(value) => {
          setSearchValue(value);
          // A busca será automática devido ao useEffect com debounce
        }}
      />
      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader className="dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="dark:border-gray-700 dark:hover:bg-gray-800/50"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="dark:text-gray-300 dark:font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="dark:bg-gray-900">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="dark:border-gray-700 dark:hover:bg-gray-800/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="dark:text-gray-200">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="dark:border-gray-700">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center dark:text-gray-400"
                >
                  Nenhum boleto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4 dark:text-gray-300">
        <Paginacao
          currentPage={currentPage + 1}
          pageCount={table.getPageCount()}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
