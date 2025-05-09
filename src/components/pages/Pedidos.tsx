"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
  type VisibilityState,
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
import { format, subDays, subMonths, subYears } from "date-fns";
import { PedidosFilter } from "./Pedidos/PedidosFilter";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import EmptyPedidosError from "./Pedidos/EmptyPedidosError";
import LoadingExample from "./Loading/Loading";
import { usePedidosColumns, type Pedido } from "./Pedidos/PedidosColumns"; // Importando o hook de colunas

interface TokenDecoded {
  exp: number;
  [key: string]: any;
}

// Tipos para os filtros
type PeriodFilter = "ultimoMes" | "ultimos90Dias" | "ultimoAno" | "todos";
type SearchType =
  | "numeroPedido"
  | "statusDoPedido"
  | "notaFiscal"
  | "dataLancamentoPedido"
  | "dataParaEntrega";

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: TokenDecoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [, setAllPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchType, setSearchType] = React.useState<SearchType>("numeroPedido");
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [currentPeriodFilter, setCurrentPeriodFilter] = React.useState<PeriodFilter>("ultimoMes");
  const [activeDateRange, setActiveDateRange] = React.useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: undefined,
    end: undefined,
  });

  const navigate = useNavigate();
  
  // Usar o hook usePedidosColumns para obter as definições de colunas
  const columns = usePedidosColumns();

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

      // Formatar data para API no padrão YYYY-MM-DD
      const formatarDataAPI = (date: Date) => {
        return format(date, "yyyy-MM-dd");
      };

      // Datas ajustadas para garantir inclusão do dia completo
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

      let pedidosData = response.data.value || response.data.data || response.data;

      if (Array.isArray(pedidosData)) {
        // Remover duplicatas por numeroPedido
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
              return 0;
            }

            // Garantir que estamos trabalhando com strings antes de usar split
            const dataStrA = String(a.dataLancamentoPedido);
            const dataStrB = String(b.dataLancamentoPedido);

            // Criar objeto Date usando split para evitar problemas de timezone
            const [yearA, monthA, dayA] = dataStrA.split("-");
            const [yearB, monthB, dayB] = dataStrB.split("-");

            const dataA = new Date(
              Number(yearA),
              Number(monthA) - 1,
              Number(dayA)
            ).getTime();
            const dataB = new Date(
              Number(yearB),
              Number(monthB) - 1,
              Number(dayB)
            ).getTime();

            return dataB - dataA; // Ordem decrescente
          }
        );

        setAllPedidos(uniquePedidos);
        setPedidos(uniquePedidos);
      } else {
        setAllPedidos([]);
        setPedidos([]);
        setError("empty");
      }

      setError(null);
    } catch (err) {
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

    // Criar uma nova data no timezone local
    const hoje = new Date();
    // Padronizamos para o início do dia (00:00:00)
    hoje.setHours(0, 0, 0, 0);

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
  
  // Na primeira renderização, busca os dados do último mês
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
    navigate("/inicio");
  };

  // Função para tentar novamente
  const handleRetry = () => {
    // Tenta buscar os pedidos novamente usando o mesmo intervalo de datas
    fetchPedidosWithDateRange(
      activeDateRange.start || new Date(),
      activeDateRange.end || new Date()
    );
  };

  if (loading) {
    return <LoadingExample message="Carregando Pedidos..." />;
  }

  if (error === "empty") {
    return (
      <EmptyPedidosError
        message="Não foram encontrados pedidos para o período selecionado."
        onRetry={handleRetry}
        onBack={handleBack}
        showBackButton={true}
        logoUrl="/logo.svg"
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
        logoUrl="/logo.svg"
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