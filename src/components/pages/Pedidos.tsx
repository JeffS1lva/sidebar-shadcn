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
  type VisibilityState,
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
import { Paginacao } from "./Paginacao";
import { Circle, Eye, Package, PackageOpen, PackageSearch } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns"; // Adicionado subMonths
import { PedidosFilter } from "./Pedidos/PedidosFilter";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import EmptyPedidosError from "./Pedidos/EmptyPedidosError";

interface Pedido {
  status: any;
  grupo: string;
  filial: string;
  codigoTransportadora: string;
  nomeTransportadora: string | null;
  estado: string;
  codigoDoCliente: string;
  nomeCliente: string;
  numeroPedido: string;
  dataLancamentoPedido: string;
  dataParaEntrega: string;
  statusDoPedido: string;
  dataPicking: string;
  statusPicking: string;
  notaFiscal: string;
  chaveNFe: string;
}

interface TokenDecoded {
  exp: number;
  [key: string]: any;
}

// Atualizado para incluir opção de "ultimoMes"
type PeriodFilter = "ultimoMes" | "ultimos90Dias" | "ultimoAno" | "todos";
type SearchType =
  | "numeroPedido"
  | "statusDoPedido"
  | "notaFiscal"
  | "dataLancamentoPedido"
  | "dataParaEntrega";

const numericFilter: FilterFn<Pedido> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  if (typeof value === "number") {
    return value.toString().includes(filterValue);
  }
  return false;
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: TokenDecoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return true;
  }
};

export const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [, setAllPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchType, setSearchType] =
    React.useState<SearchType>("numeroPedido");
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [currentPeriodFilter, setCurrentPeriodFilter] =
    React.useState<PeriodFilter>("ultimoMes");
  const [activeDateRange, setActiveDateRange] = React.useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: undefined,
    end: undefined,
  });

  const getStatusConfig = (status: string) => {
    const config: {
      classes: string;
      icon: JSX.Element;
      text?: string;
    } = {
      classes: "",
      icon: <Circle className="h-3 w-3 mr-1" />,
    };

    switch (status) {
      case "Aberto":
        config.classes = "w-32 bg-yellow-100 text-yellow-800";
        config.icon = <PackageOpen className="h-3 w-3 mr-1" />;
        break;
      case "Fechado":
        config.classes = "w-32 bg-green-100 text-green-800";
        config.icon = <Package className="h-3 w-3 mr-1" />;
        break;
      default:
        config.classes = " w-32 bg-zinc-300 text-gray-800";
        config.icon = <PackageSearch className="h-3 w-3 mr-1" />;
        config.text = "Em andamento";
    }

    return config;
  };

  const navigate = useNavigate();

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

  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: "numeroPedido",
      header: "Nº Pedido",
      filterFn: numericFilter,
      cell: ({ row }) => {
        const navigate = useNavigate();
        const numeroPedido = row.getValue("numeroPedido");

        const hasNotaFiscal =
          numeroPedido !== null &&
          numeroPedido !== undefined &&
          numeroPedido !== "";

        const handleViewPedido = async (e: React.MouseEvent) => {
          e.preventDefault();

          if (!hasNotaFiscal) return;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }

            const pedidoId = numeroPedido.toString();
            const loadingId = `loading-pedido-${pedidoId}`;

            const loadingEl = document.createElement("div");
            loadingEl.id = loadingId;
            loadingEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            loadingEl.innerHTML = `
              <div class="dark:bg-gray-900 dark:text-white bg-white rounded-md p-4 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>Carregando Pedido de Venda ${pedidoId}...</p>
              </div>
            `;
            document.body.appendChild(loadingEl);

            const response = await axios.get(
              `/api/external/Pedidos/imprime-pedido/${numeroPedido}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/pdf",
                },
                responseType: "blob",
              }
            );

            document.getElementById(loadingId)?.remove();

            const contentType = response.headers["content-type"];
            if (!contentType || !contentType.includes("application/pdf")) {
              throw new Error("Resposta não é um PDF válido");
            }

            const blob = new Blob([response.data], { type: "application/pdf" });
            const fileUrl = URL.createObjectURL(blob);

            const viewerContainer = document.createElement("div");
            viewerContainer.id = `pedido-viewer-${pedidoId}`;
            viewerContainer.className =
              "fixed inset-0 bg-black/75 flex flex-col items-center justify-center z-50";

            viewerContainer.innerHTML = `
              <div class="dark:bg-gray-900 bg-white  rounded-md w-4/5 h-4/5 flex flex-col overflow-hidden">
                <div class="flex justify-between items-center p-3 border-b border-gray-700">
                  <h3 class="font-medium">Pedido de Venda #${pedidoId}</h3>
                  <div class="flex gap-2">
                    <a href="${fileUrl}" download="pedido-${pedidoId}.pdf" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download
                    </a>
                    <button id="close-viewer-${pedidoId}" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 dark:bg-gray-700 dark:hover:bg-gray-600">
                      Fechar
                    </button>
                  </div>
                </div>
                <div class="flex-1 overflow-hidden dark:bg-gray-900">
                  <iframe 
                    src="${fileUrl}" 
                    type="application/pdf" 
                    class="w-full h-full" 
                    frameborder="0"
                    allow="fullscreen"
                  ></iframe>
                </div>
              </div>
            `;

            document.body.appendChild(viewerContainer);

            document
              .getElementById(`close-viewer-${pedidoId}`)
              ?.addEventListener("click", () => {
                document.getElementById(`pedido-viewer-${pedidoId}`)?.remove();
                URL.revokeObjectURL(fileUrl);
              });
          } catch (error) {
            console.error("Erro ao exibir pedido de venda:", error);
            const loadingId = `loading-pedido-${numeroPedido}`;
            document.getElementById(loadingId)?.remove();

            const errorEl = document.createElement("div");
            errorEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            errorEl.innerHTML = `
              <div class="bg-white rounded-md p-6 flex flex-col items-center max-w-md">
                <div class="rounded-full bg-red-100 p-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium mb-2">Erro ao exibir Pedido</h3>
                <p class="text-center text-gray-600 mb-4">Não foi possível carregar o pedido de venda. Por favor, tente novamente ou contate o suporte.</p>
                <button id="close-error" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                  Fechar
                </button>
              </div>
            `;

            document.body.appendChild(errorEl);

            document
              .getElementById("close-error")
              ?.addEventListener("click", () => {
                errorEl.remove();
              });
          }
        };

        return (
          <div className="flex items-center gap-2">
            <span className="block  text-center font-medium min-w-[50px]">
              {hasNotaFiscal ? numeroPedido.toString() : "N/A"}
            </span>
            <div className="flex gap-1">
              <button
                title={
                  hasNotaFiscal ? "Visualizar Pedido" : "Pedido não disponível"
                }
                onClick={handleViewPedido}
                disabled={!hasNotaFiscal}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0 cursor-pointer ${
                  !hasNotaFiscal ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Visualizar</span>
              </button>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "dataLancamentoPedido",
      header: "Data Lanç.",
      cell: ({ row }) => {
        const dateString = row.getValue("dataLancamentoPedido");
        if (!dateString) return "";
        // Usar split para preservar a data exata sem ajuste de timezone
        const [year, month, day] = (dateString as string).split("-");
        return `${day}/${month}/${year}`; // Formato DD/MM/YYYY
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue?.start || !filterValue?.end) return true;
        const dateString = row.getValue(columnId);
        if (!dateString) return false;
        // Extrai dia, mês e ano diretamente da string (assumindo formato "YYYY-MM-DD")
        const [year, month, day] = (dateString as string)
          .split("-")
          .map(Number);

        // Cria a data UTC (sem fuso horário local)
        const cellDate = new Date(Date.UTC(year, month - 1, day));

        // Processa as datas de filtro da mesma forma
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
      accessorKey: "dataParaEntrega",
      header: "Data Entre.",
      cell: ({ row }) => {
        const dateString = row.getValue("dataParaEntrega");
        if (!dateString) return "";
        // Usar split para preservar a data exata sem ajuste de timezone
        const [year, month, day] = (dateString as string).split("-");
        return `${day}/${month}/${year}`; // Formato DD/MM/YYYY
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue?.start || !filterValue?.end) return true;
        const dateString = row.getValue(columnId);
        if (!dateString) return false;
        const [year, month, day] = (dateString as string)
          .split("-")
          .map(Number);
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
      accessorKey: "statusDoPedido",
      header: "Status Pedido",
      cell: ({ row }) => {
        const { classes, icon, text } = getStatusConfig(
          row.getValue("statusDoPedido")
        );
        return (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classes}`}
          >
            {icon}
            {text || row.getValue("statusDoPedido")}
          </div>
        );
      },
    },
    {
      accessorKey: "statusPicking",
      header: "Status Picking",
      cell: ({ row }) => {
        const { classes, icon, text } = getStatusConfig(
          row.getValue("statusPicking")
        );
        return (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classes}`}
          >
            {icon}
            {text || row.getValue("statusDoPedido")}
          </div>
        );
      },
    },
    {
      accessorKey: "notaFiscal",
      header: "Nota Fiscal",
      filterFn: numericFilter,
      cell: ({ row }) => {
        const navigate = useNavigate();
        const notaFiscal = row.getValue("notaFiscal");
        const companyCode = row.original.filial || "";
        const chaveNFe = row.original.chaveNFe || "";

        const hasNotaFiscal = notaFiscal && companyCode && chaveNFe;

        const handleDownloadXML = async (e: React.MouseEvent) => {
          e.preventDefault();

          if (!hasNotaFiscal) return;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }

            const response = await axios.get(
              `/api/external/FileXML/download/${companyCode}/NFe${chaveNFe}.xml`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/zip",
                },
                responseType: "blob",
              }
            );

            const blob = new Blob([response.data], { type: "application/xml" });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `nota-${notaFiscal}.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);
            toast.success(`Download da nota ${notaFiscal} concluído!`, {
              description: "Arquivo .zip salvo com sucesso.",
              duration: 5000,
              style: {
                backgroundColor: "white",
                color: "green",
                boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
              },
            });
          } catch (error) {
            console.error("Erro ao baixar XML:", error);
            toast.error("Erro ao baixar XML", {
              description: "Verifique os dados da nota ou tente novamente.",
              style: {
                backgroundColor: "white",
                color: "red",
                boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
              },
            });
          }
        };

        const handleViewDANFE = async (e: React.MouseEvent) => {
          e.preventDefault();

          if (!hasNotaFiscal) return;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }

            const notaId = notaFiscal.toString();
            const loadingId = `loading-danfe-${notaId}`;

            const loadingEl = document.createElement("div");
            loadingEl.id = loadingId;
            loadingEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            loadingEl.innerHTML = `
              <div class="dark:bg-gray-800 dark:text-white bg-white rounded-md p-4 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>Carregando DANFE ${notaId}...</p>
              </div>
            `;
            document.body.appendChild(loadingEl);

            const response = await axios.get(`/api/external/Danfe/gerar`, {
              params: {
                companyCode: companyCode,
                chaveNF: chaveNFe,
              },
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/pdf",
              },
              responseType: "blob",
            });

            document.getElementById(loadingId)?.remove();

            const contentType = response.headers["content-type"];
            if (!contentType || !contentType.includes("application/pdf")) {
              console.error("Resposta não é um PDF:", contentType);
              throw new Error("Resposta não é um PDF válido");
            }

            const blob = new Blob([response.data], { type: "application/pdf" });
            const fileUrl = URL.createObjectURL(blob);

            const viewerContainer = document.createElement("div");
            viewerContainer.id = `danfe-viewer-${notaId}`;
            viewerContainer.className =
              "fixed inset-0 bg-black/75 flex flex-col items-center justify-center z-50";

            viewerContainer.innerHTML = `
              <div class="dark:bg-gray-900 dark:text-white bg-white rounded-md w-4/5 h-4/5 flex flex-col overflow-hidden">
                <div class="flex justify-between items-center p-3 border-b ">
                  <h3 class="font-medium">DANFE - Nota Fiscal #${notaId}</h3>
                  <div class="flex gap-2">
                    <a href="${fileUrl}" download="danfe-${notaId}.pdf" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 dark:text-black">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download
                    </a>
                    <button id="close-viewer-${notaId}" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 dark:hover:bg-gray-600 dark:bg-gray-700 ">
                      Fechar
                    </button>
                  </div>
                </div>
                <div class="flex-1 overflow-hidden dark:bg-gray-900">
                  <iframe 
                    src="${fileUrl}" 
                    type="application/pdf" 
                    class="w-full h-full" 
                    frameborder="0"
                    allow="fullscreen"
                  ></iframe>
                </div>
              </div>
            `;

            document.body.appendChild(viewerContainer);

            document
              .getElementById(`close-viewer-${notaId}`)
              ?.addEventListener("click", () => {
                document.getElementById(`danfe-viewer-${notaId}`)?.remove();
                URL.revokeObjectURL(fileUrl);
              });
          } catch (error) {
            console.error("Erro ao exibir DANFE:", error);
            const loadingId = `loading-danfe-${notaFiscal.toString()}`;
            document.getElementById(loadingId)?.remove();

            const errorEl = document.createElement("div");
            errorEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            errorEl.innerHTML = `
              <div class="bg-white rounded-md p-6 flex flex-col items-center max-w-md">
                <div class="rounded-full bg-red-100 p-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium mb-2">Erro ao exibir DANFE</h3>
                <p class="text-center text-gray-600 mb-4">Não foi possível carregar a DANFE. Por favor, tente novamente ou contate o suporte.</p>
                <button id="close-error" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
                  Fechar
                </button>
              </div>
            `;

            document.body.appendChild(errorEl);

            document
              .getElementById("close-error")
              ?.addEventListener("click", () => {
                errorEl.remove();
              });
          }
        };

        return (
          <div className="flex items-center gap-1 ">
            <span className="block  text-center font-medium min-w-[50px]">
              {hasNotaFiscal ? notaFiscal.toString() : "-"}
            </span>
            <div className="flex gap-1">
              <button
                title={
                  hasNotaFiscal ? "Visualizar DANFE" : "DANFE não disponível"
                }
                onClick={handleViewDANFE}
                disabled={!hasNotaFiscal}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0 cursor-pointer ${
                  !hasNotaFiscal ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Visualizar DANFE</span>
              </button>

              <button
                title={hasNotaFiscal ? "Baixar XML" : "XML não disponível"}
                onClick={handleDownloadXML}
                disabled={!hasNotaFiscal}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0 cursor-pointer ${
                  !hasNotaFiscal ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                <span className="sr-only">Download XML</span>
              </button>
            </div>
          </div>
        );
      },
    },
    // Adicione esta nova coluna ao array de colunas (columns) depois da coluna "notaFiscal"
    {
      accessorKey: "nomeCliente",
      header: "Cliente",
      cell: ({ row }) => (
        <div
          className="whitespace-nowrap overflow-hidden text-ellipsis flex w-56"
          title={row.getValue("nomeCliente")}
        >
          
          {row.getValue("nomeCliente")}
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
    },

    {
      accessorKey: "nomeTransportadora",
      header: "Nome Transp.",
      cell: ({ row }) => {
        const nome: string | null = row.getValue("nomeTransportadora");
        if (!nome) return <>-</>;
        
        const displayName = nome.length > 10 ? `${nome.slice(0, 23)}...` : nome;
        return <>{displayName}</>;
      },
    },
  ];

  const table = useReactTable({
    data: pedidos,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
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

  // Função para fazer a requisição à API com intervalo de datas
  // Função para buscar pedidos com intervalo de datas
  const fetchPedidosWithDateRange = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Guardar as datas atuais de filtro
      setActiveDateRange({
        start: startDate,
        end: endDate,
      });

      const formatarDataAPI = (date: Date) => {
        return format(date, "yyyy-MM-dd");
      };

      const response = await axios.get(
        "/api/external/Pedidos/consultar-pedidos",
        {
          params: {
            dataINI: formatarDataAPI(startDate),
            dataFIM: formatarDataAPI(endDate),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let pedidosData =
        response.data.value || response.data.data || response.data;

      if (Array.isArray(pedidosData)) {
        // Ordenação decrescente por dataLancamentoPedido
        const uniquePedidos = pedidosData.reduce((acc, current) => {
          const isDuplicate = acc.find(
            (item: { numeroPedido: any }) =>
              item.numeroPedido === current.numeroPedido
          );
          if (!isDuplicate) {
            return acc.concat([current]);
          }
          return acc;
        }, []);

        // Ordenação decrescente
        uniquePedidos.sort(
          (
            a: { dataLancamentoPedido: string | number | Date },
            b: { dataLancamentoPedido: string | number | Date }
          ) => {
            if (!a.dataLancamentoPedido || !b.dataLancamentoPedido) {
              console.warn("Campo dataLancamentoPedido não encontrado em:", {
                a,
                b,
              });
              return 0;
            }

            const dataA = new Date(a.dataLancamentoPedido).getTime();
            const dataB = new Date(b.dataLancamentoPedido).getTime();

            return dataB - dataA; // Ordem decrescente
          }
        );

        setAllPedidos(uniquePedidos);
        setPedidos(uniquePedidos);
      } else {
        console.error("Estrutura de dados inesperada:", response.data);
        setAllPedidos([]);
        setPedidos([]);
        setError("empty")
      }

      setError(null);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para aplicar o filtro de período selecionado
  const applyPeriodFilter = (periodFilter: PeriodFilter) => {
    setCurrentPeriodFilter(periodFilter);

    const hoje = new Date();

    switch (periodFilter) {
      case "todos":
        // Buscar todos os pedidos dos últimos 2 anos
        const doisAnosAtras = subYears(hoje, 2);
        fetchPedidosWithDateRange(doisAnosAtras, hoje);
        break;
      case "ultimoAno":
        // Buscar apenas os pedidos do último ano
        const umAnoAtras = subYears(hoje, 1);
        fetchPedidosWithDateRange(umAnoAtras, hoje);
        break;
      case "ultimoMes":
        // Buscar apenas os pedidos do último mês
        const umMesAtras = subMonths(hoje, 1);
        fetchPedidosWithDateRange(umMesAtras, hoje);
        break;
      case "ultimos90Dias":
        // Buscar apenas os pedidos dos últimos 90 dias
        const noventaDiasAtras = subDays(hoje, 90);
        fetchPedidosWithDateRange(noventaDiasAtras, hoje);
        break;
    }
  };

  // Na primeira renderização, busca os dados do último mês (modificado de 90 dias para 1 mês)
  React.useEffect(() => {
    applyPeriodFilter("ultimoMes");
  }, []);

  // Efeito para aplicar filtros de texto (número de pedido, status, nota fiscal)
  React.useEffect(() => {
    if (searchType === "numeroPedido" || searchType === "notaFiscal") {
      const numericValue = searchValue.replace(/\D/g, "");
      table.getColumn(searchType)?.setFilterValue(numericValue);
    } else if (searchType === "statusDoPedido") {
      table.getColumn(searchType)?.setFilterValue(searchValue);
    }
  }, [searchValue, searchType, table]);

  const handleBack = () => {
    navigate("/inicio"); // ou qualquer outra rota conforme a estrutura da sua aplicação
  };
  
  // Adicione função para tentar novamente
  const handleRetry = () => {
    // Tenta buscar os pedidos novamente usando o mesmo intervalo de datas
    fetchPedidosWithDateRange(
      activeDateRange.start || new Date(), 
      activeDateRange.end || new Date()
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Carregando pedidos...</p>
      </div>
    );
  }
  

  if (error === "empty") {
    return (
      <EmptyPedidosError 
        message="Não foram encontrados pedidos para o período selecionado."
        onRetry={handleRetry}
        onBack={handleBack}
        showBackButton={true}
        logoUrl="/logo.svg" // Ajuste para o caminho da sua logo
      />
    );
  }
  
  if (error === "error") {
    return (
      <EmptyPedidosError 
        message="Ocorreu um erro ao carregar os pedidos. Por favor, tente novamente."
        onRetry={handleRetry}
        onBack={handleBack}
        showBackButton={true}
        logoUrl="/logo.svg" // Ajuste para o caminho da sua logo
      />
    );
  }

  return (
    <div className="w-full p-2">
      <h1 className="text-3xl font-bold">Pedidos</h1>

      <PedidosFilter
        searchType={searchType}
        setSearchType={setSearchType}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        currentPeriodFilter={currentPeriodFilter}
        applyPeriodFilter={applyPeriodFilter}
        activeDateRange={activeDateRange}
        setActiveDateRange={setActiveDateRange}
        fetchPedidosWithDateRange={fetchPedidosWithDateRange}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <Paginacao
          currentPage={table.getState().pagination.pageIndex + 1}
          pageCount={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      </div>
    </div>
  );
};