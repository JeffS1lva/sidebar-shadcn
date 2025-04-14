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
import { Paginacao } from "./Pedidos/Paginacao";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { BoletoFilter } from "./Boletos/BoletosFilter";

interface Parcela {
  codigoBoleto: number;
  codigoPN: string;
  nomePN: string;
  cnpj: string;
  numNF: string;
  parcela: string;
  valorParcela: number;
  dataVencimento: string;
  id: number;
}

// Dados simulados para usar quando a API não estiver disponível
const dadosSimulados: Parcela[] = [
  {
    id: 1,
    codigoBoleto: 10001,
    codigoPN: "PN001",
    nomePN: "Cliente Exemplo 1",
    cnpj: "12345678000100",
    numNF: "NF-001",
    parcela: "1/3",
    valorParcela: 1250.75,
    dataVencimento: "2025-04-20",
  },
  {
    id: 2,
    codigoBoleto: 10002,
    codigoPN: "PN001",
    nomePN: "Cliente Exemplo 1",
    cnpj: "12345678000100",
    numNF: "NF-001",
    parcela: "2/3",
    valorParcela: 1250.75,
    dataVencimento: "2025-05-20",
  },
  {
    id: 3,
    codigoBoleto: 10003,
    codigoPN: "PN001",
    nomePN: "Cliente Exemplo 1",
    cnpj: "12345678000100",
    numNF: "NF-001",
    parcela: "3/3",
    valorParcela: 1250.75,
    dataVencimento: "2025-06-20",
  },
  {
    id: 4,
    codigoBoleto: 10004,
    codigoPN: "PN002",
    nomePN: "Cliente Exemplo 2",
    cnpj: "98765432000100",
    numNF: "NF-002",
    parcela: "1/2",
    valorParcela: 3200.0,
    dataVencimento: "2025-04-15",
  },
  {
    id: 5,
    codigoBoleto: 10005,
    codigoPN: "PN002",
    nomePN: "Cliente Exemplo 2",
    cnpj: "98765432000100",
    numNF: "NF-002",
    parcela: "2/2",
    valorParcela: 3200.0,
    dataVencimento: "2025-05-15",
  },
];

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
  const [searchType] = useState<
    "codigoPN" | "numNF" | "codigoBoleto"
  >("codigoPN");
  const [usarDadosSimulados] = useState<boolean>(false);
  const [, setApiUnavailable] = useState<boolean>(false);
  // Estado para controlar o debounce da busca
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>("");

  const navigate = useNavigate();

  // Função para formatar a data no padrão brasileiro (DD/MM/YYYY)

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para formatar CNPJ
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
  }, [debouncedSearchValue, searchType, usarDadosSimulados]);

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
        const codigoBoleto = row.getValue("codigoBoleto") as string | number | null | undefined;
        const codigoPN = row.getValue("id") as string | number | null | undefined;

        const hasCodigoBoleto =
          codigoBoleto !== null &&
          codigoBoleto !== undefined &&
          codigoBoleto !== "";
          
        const hasCodigoPN =
          codigoPN !== null &&
          codigoPN !== undefined &&
          codigoPN !== "";

        const handleViewBoleto = async (e: React.MouseEvent) => {
          e.preventDefault();

          if (!hasCodigoPN) return;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }

            // Convertendo para string com segurança
            const boletoId = hasCodigoBoleto ? String(codigoBoleto) : "";
            const pnId = hasCodigoPN ? String(codigoPN) : "";
            const loadingId = `loading-boleto-${boletoId}`;

            const loadingEl = document.createElement("div");
            loadingEl.id = loadingId;
            loadingEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            loadingEl.innerHTML = `
              <div class="bg-white rounded-md p-4 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>Carregando Boleto ${boletoId}...</p>
              </div>
            `;
            document.body.appendChild(loadingEl);

            // Usando o endpoint correto com codigoPN
            const response = await axios.get(
              `/api/internal/Boletos/${pnId}/pdf`,
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
            viewerContainer.id = `boleto-viewer-${boletoId}`;
            viewerContainer.className =
              "fixed inset-0 bg-black/75 flex flex-col items-center justify-center z-50";

            viewerContainer.innerHTML = `
              <div class="bg-white rounded-md w-4/5 h-4/5 flex flex-col overflow-hidden">
                <div class="flex justify-between items-center p-3 border-b">
                  <h3 class="font-medium">Boleto #${boletoId}</h3>
                  <div class="flex gap-2">
                    <a href="${fileUrl}" download="boleto-${boletoId}.pdf" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download
                    </a>
                    <button id="close-viewer-${boletoId}" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                      Fechar
                    </button>
                  </div>
                </div>
                <div class="flex-1 overflow-hidden">
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
              .getElementById(`close-viewer-${boletoId}`)
              ?.addEventListener("click", () => {
                document.getElementById(`boleto-viewer-${boletoId}`)?.remove();
                URL.revokeObjectURL(fileUrl);
              });
          } catch (error) {
            console.error("Erro ao exibir boleto:", error);
            const loadingId = `loading-boleto-${hasCodigoBoleto ? String(codigoBoleto) : ""}`;
            document.getElementById(loadingId)?.remove();

            toast.error("Erro ao visualizar boleto", {
              description:
                "Não foi possível carregar o boleto. Tente novamente mais tarde.",
              duration: 5000,
            });
          }
        };

        // Nova função para download direto do PDF
        const handleDownloadBoleto = async (e: React.MouseEvent) => {
          e.preventDefault();

          if (!hasCodigoPN) return;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }

            const pnId = hasCodigoPN ? String(codigoPN) : "";
            const boletoId = hasCodigoBoleto ? String(codigoBoleto) : "";
            
            const loadingId = `loading-download-${boletoId}`;

            const loadingEl = document.createElement("div");
            loadingEl.id = loadingId;
            loadingEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            loadingEl.innerHTML = `
              <div class="bg-white rounded-md p-4 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>Preparando download do boleto...</p>
              </div>
            `;
            document.body.appendChild(loadingEl);

            // Usando o endpoint correto com codigoPN
            const response = await axios.get(
              `/api/internal/Boletos/${pnId}/pdf`,
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
            
            // Criando um elemento temporário para download
            const downloadLink = document.createElement("a");
            downloadLink.href = fileUrl;
            downloadLink.download = `boleto-${boletoId}.pdf`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // Limpeza após o download
            setTimeout(() => {
              URL.revokeObjectURL(fileUrl);
              document.body.removeChild(downloadLink);
              toast.success("Download iniciado", {
                description: "O arquivo PDF está sendo baixado",
                duration: 3000,
              });
            }, 100);
            
          } catch (error) {
            console.error("Erro ao baixar boleto:", error);
            const loadingId = `loading-download-${hasCodigoBoleto ? String(codigoBoleto) : ""}`;
            document.getElementById(loadingId)?.remove();

            toast.error("Erro ao baixar boleto", {
              description:
                "Não foi possível baixar o boleto. Tente novamente mais tarde.",
              duration: 5000,
            });
          }
        };

        return (
          <div className="flex items-center gap-2">
            <span className="block text-center font-medium min-w-[50px]">
              {hasCodigoBoleto ? String(codigoBoleto) : "N/A"}
            </span>
            <div className="flex gap-1">
              <button
                title={
                  hasCodigoPN
                    ? "Visualizar Boleto"
                    : "Boleto não disponível"
                }
                onClick={handleViewBoleto}
                disabled={!hasCodigoPN}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0 ${
                  !hasCodigoPN ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Visualizar</span>
              </button>
              
              <button
                title={
                  hasCodigoPN
                    ? "Baixar Boleto"
                    : "Boleto não disponível para download"
                }
                onClick={handleDownloadBoleto}
                disabled={!hasCodigoPN}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/90 h-8 w-8 p-0 ${
                  !hasCodigoPN ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-4 w-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span className="sr-only">Download</span>
              </button>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "codigoPN",
      header: "Código PN",
      filterFn: "includesString",
    },
    {
      accessorKey: "nomePN",
      header: "Nome",
      cell: ({ row }) => (
        <div
          className="whitespace-nowrap overflow-hidden text-ellipsis flex w-56"
          title={row.getValue("nomePN")}
        >
          {row.getValue("nomePN")}
        </div>
      ),
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => formatCNPJ(row.getValue("cnpj")),
    },
    {
      accessorKey: "numNF",
      header: "NF",
      filterFn: "includesString",
    },
    {
      accessorKey: "parcela",
      header: "Parcela",
    },
    {
      accessorKey: "valorParcela",
      header: "Valor",
      cell: ({ row }) => formatCurrency(row.getValue("valorParcela")),
    },
    {
      accessorKey: "dataVencimento",
      header: "Vencimento",
      cell: ({ row }) => {
        const value = row.getValue("dataVencimento") as string;
        return formatDatePtBr(value);
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

  // Função para buscar as parcelas usando axios ou dados simulados
  const fetchParcelas = async (searchValue: string = "") => {
    if (usarDadosSimulados) {
      setLoading(true);
      // Simular um pequeno delay para dar a sensação de carregamento
      setTimeout(() => {
        const filteredData = dadosSimulados.filter((parcela) => {
          if (!searchValue) return true;

          if (searchType === "codigoPN") {
            return parcela.codigoPN
              .toLowerCase()
              .includes(searchValue.toLowerCase());
          } else if (searchType === "numNF") {
            return parcela.numNF
              .toLowerCase()
              .includes(searchValue.toLowerCase());
          } else if (searchType === "codigoBoleto") {
            return parcela.codigoBoleto.toString().includes(searchValue);
          }

          return true;
        });

        setAllParcelas(filteredData);
        setParcelas(filteredData);
        setLoading(false);
        setError(null);
      }, 500);
      return;
    }

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

      // Determine o parâmetro correto com base no tipo de pesquisa
      const params: Record<string, string> = {};
      if (searchValue) {
        params[searchType] = searchValue;
      }

      const response = await axios.get("/api/internal/Parcelas/parcelas", {
        params,
        headers: {
          Authorization:  `Bearer ${token}`,
        },
      });

      // Extrair os dados da resposta, considerando diferentes estruturas possíveis
      let parcelasData = [];

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
        setApiUnavailable(false);
        setError(null);
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
          setApiUnavailable(true);
        } else {
          setError(
            `Erro ao carregar boletos: ${
              err.response?.status || "Desconhecido"
            }`
          );
        }
      } else {
        setError(
          "Ocorreu um erro ao carregar os boletos. Por favor, tente novamente."
        );
      }

      setParcelas([]);
      setAllParcelas([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (searchType === "codigoBoleto") {
      const numericValue = searchValue.replace(/\D/g, "");
      table.getColumn(searchType)?.setFilterValue(numericValue);
    } else if (searchType === "codigoPN" || searchType === "numNF") {
      table.getColumn(searchType)?.setFilterValue(searchValue);
    }
  }, [searchValue, searchType, table]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Carregando boletos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <h3 className="font-bold mb-2">Erro</h3>
        <p>{error}</p>
        <button
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-2">
      <h1 className="text-3xl font-bold">Boletos</h1>

      <BoletoFilter
        allParcelas={allParcelas}
        setParcelas={setParcelas}
        table={table}
        onSearch={(value) => {
          setSearchValue(value);
          // A busca será automática devido ao useEffect com debounce
        }}
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
                  Nenhum boleto encontrado.
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