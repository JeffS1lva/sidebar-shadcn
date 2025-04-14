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
import { Paginacao } from "./Pedidos/Paginacao";
import { Circle, Eye, Package, PackageOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { CotacaoFilter } from "./Cotacao/CotacaoFilter";

interface Cotacao {
  n_Cotacao: number;
  data_Cotacao: string;
  status: string;
  cliente: string;
  nome_Cliente: string;
  uf: string;
  valor_Total_Cotacao: number;
  codSlp1: number;
  codSlp2: number
  codSlp3: number 
  vendedor1: string;
  vendedor2: string | null;
  vendedor3: string | null;
  id: number;
}

interface TokenDecoded {
  exp: number;
  [key: string]: any;
}


const numericFilter: FilterFn<Cotacao> = (row, columnId, filterValue) => {
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

export function Cotacao() {
  const [cotacoes, setCotacoes] = React.useState<Cotacao[]>([]);
  const [allCotacoes, setAllCotacoes] = React.useState<Cotacao[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchType] = React.useState<
    "n_Cotacao" | "status" | "nome_Cliente" | "data_Cotacao"
  >("n_Cotacao");
  const [searchValue] = React.useState<string>("");

  const getStatusConfig = (status: string) => {
    const config = {
      classes: "",
      icon: <Circle className="h-3 w-3 mr-1" />,
    };

    switch (status) {
      case "Aberto":
        config.classes = "bg-yellow-100 text-yellow-800";
        config.icon = <PackageOpen className="h-3 w-3 mr-1" />;
        break;
      case "Fechado":
        config.classes = "bg-green-100 text-green-800";
        config.icon = <Package className="h-3 w-3 mr-1" />;
        break;
      case "Rejeitada":
        config.classes = "bg-red-100 text-red-800";
        break;
      default:
        config.classes = "bg-zinc-300 text-gray-800 px-7";
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

  const columns: ColumnDef<Cotacao>[] = [
    {
      accessorKey: "n_Cotacao",
      header: "Nº Cotação",
      filterFn: numericFilter,
      cell: ({ row }) => {
        const numeroCotacao = row.getValue("n_Cotacao");
        const cotacaoId = row.original.id;

        const hasCotacao =
          numeroCotacao !== null &&
          numeroCotacao !== undefined &&
          numeroCotacao !== "";

        const handleViewCotacao = async (e: React.MouseEvent) => {
          e.preventDefault();

          if (!hasCotacao) return;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }

            const cotacaoIdStr = cotacaoId.toString();
            const loadingId = `loading-cotacao-${cotacaoIdStr}`;

            const loadingEl = document.createElement("div");
            loadingEl.id = loadingId;
            loadingEl.className =
              "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
            loadingEl.innerHTML = `
              <div class="bg-white rounded-md p-4 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>Carregando Cotação ${numeroCotacao}...</p>
              </div>
            `;
            document.body.appendChild(loadingEl);

            // Substituir pelo endpoint correto quando disponível
            const response = await axios.get(
              `/api/internal/Pedidos/imprime-cotacao/${cotacaoId}`,
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
            viewerContainer.id = `cotacao-viewer-${cotacaoIdStr}`;
            viewerContainer.className =
              "fixed inset-0 bg-black/75 flex flex-col items-center justify-center z-50";

            viewerContainer.innerHTML = `
              <div class="bg-white rounded-md w-4/5 h-4/5 flex flex-col overflow-hidden">
                <div class="flex justify-between items-center p-3 border-b">
                  <h3 class="font-medium">Cotação #${numeroCotacao}</h3>
                  <div class="flex gap-2">
                    <a href="${fileUrl}" download="cotacao-${numeroCotacao}.pdf" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download
                    </a>
                    <button id="close-viewer-${cotacaoIdStr}" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
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
              .getElementById(`close-viewer-${cotacaoIdStr}`)
              ?.addEventListener("click", () => {
                document
                  .getElementById(`cotacao-viewer-${cotacaoIdStr}`)
                  ?.remove();
                URL.revokeObjectURL(fileUrl);
              });
          } catch (error) {
            console.error("Erro ao exibir cotação:", error);
            const loadingId = `loading-cotacao-${cotacaoId}`;
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
                <h3 class="text-lg font-medium mb-2">Erro ao exibir Cotação</h3>
                <p class="text-center text-gray-600 mb-4">Não foi possível carregar a cotação. Por favor, tente novamente ou contate o suporte.</p>
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
            <span className="block text-center font-medium min-w-[50px]">
              {hasCotacao ? numeroCotacao.toString() : "N/A"}
            </span>
            <div className="flex gap-1">
              <button
                title={
                  hasCotacao ? "Visualizar Cotação" : "Cotação não disponível"
                }
                onClick={handleViewCotacao}
                disabled={!hasCotacao}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0 cursor-pointer ${
                  !hasCotacao ? "opacity-50 cursor-not-allowed" : ""
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
      accessorKey: "data_Cotacao",
      header: "Data Cotação",
      cell: ({ row }) => {
        const dateString = row.getValue("data_Cotacao");
        if (!dateString) return "";
        // Formato YYYY-MM-DD para DD/MM/YYYY
        const [year, month, day] = (dateString as string)
          .split("T")[0]
          .split("-");
        return `${day}/${month}/${year}`;
      },
      filterFn: (row, columnId, filterValue) => {
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
      cell: ({ row }) => {
        const { classes, icon } = getStatusConfig(row.getValue("status"));
        return (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classes}`}
          >
            {icon}
            {row.getValue("status")}
          </div>
        );
      },
    },
    {
      accessorKey: "nome_Cliente",
      header: "Cliente",
      cell: ({ row }) => (
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
      cell: ({ row }) => {
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
      cell: ({ row }) => {
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

  const table = useReactTable({
    data: cotacoes,
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
        pageSize: 8,
      },
    },
  });

  // Função para buscar cotações
  const fetchCotacoes = async (listCard: string = "") => {
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

      const response = await axios.get(
        "/api/external/Pedidos/consultar-cotacoes",
        {
          params: {
            listCard,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let cotacoesData =
        response.data.value || response.data.data || response.data;

      if (Array.isArray(cotacoesData)) {
        // Remover duplicatas baseadas no n_Cotacao
        const uniqueCotacoes = cotacoesData.reduce((acc, current) => {
          const isDuplicate = acc.find(
            (item: { n_Cotacao: any }) => item.n_Cotacao === current.n_Cotacao
          );
          if (!isDuplicate) {
            return acc.concat([current]);
          }
          return acc;
        }, []);

        // Ordenação decrescente por data_Cotacao
        uniqueCotacoes.sort(
          (
            a: { data_Cotacao: string | number | Date },
            b: { data_Cotacao: string | number | Date }
          ) => {
            if (!a.data_Cotacao || !b.data_Cotacao) {
              return 0;
            }

            const dataA = new Date(a.data_Cotacao).getTime();
            const dataB = new Date(b.data_Cotacao).getTime();

            return dataB - dataA; // Ordem decrescente
          }
        );

        setAllCotacoes(uniqueCotacoes);
        setCotacoes(uniqueCotacoes);
      } else {
        console.error("Estrutura de dados inesperada:", response.data);
        setAllCotacoes([]);
        setCotacoes([]);
      }

      setError(null);
    } catch (err) {
      console.error("Erro ao buscar cotações:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(
          "Ocorreu um erro ao carregar as cotações. Por favor, tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Na primeira renderização, busca os dados
  React.useEffect(() => {
    fetchCotacoes();
  }, [navigate]);

  // Efeito para aplicar filtros de texto
  React.useEffect(() => {
    if (searchType === "n_Cotacao") {
      const numericValue = searchValue.replace(/\D/g, "");
      table.getColumn(searchType)?.setFilterValue(numericValue);
    } else if (searchType === "status" || searchType === "nome_Cliente") {
      table.getColumn(searchType)?.setFilterValue(searchValue);
    }
  }, [searchValue, searchType, table]);

  // Handler para filtros de data

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Carregando cotações...</p>
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
      <h1 className="text-3xl font-bold">Cotações</h1>

      <CotacaoFilter
        allCotacoes={allCotacoes}
        setCotacoes={setCotacoes}
        table={table}
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
                  Nenhuma cotação encontrada.
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
}
