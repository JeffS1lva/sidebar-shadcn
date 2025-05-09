"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
  type VisibilityState,
  flexRender,
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
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { CotacaoFilter } from "./Cotacao/CotacaoFilter";
import EmptyCotacaoError from "./Cotacao/EmptyCotacaoError";
import LoadingExample from "./Loading/Loading";
import { useCotacaoColumns } from "../pages/Cotacao/CotacaoColumns";

interface Cotacao {
  n_Cotacao: number;
  data_Cotacao: string;
  status: string;
  cliente: string;
  nome_Cliente: string;
  uf: string;
  valor_Total_Cotacao: number;
  codSlp1: number;
  codSlp2: number;
  codSlp3: number;
  vendedor1: string;
  vendedor2: string | null;
  vendedor3: string | null;
  id: number;
}

interface TokenDecoded {
  exp: number;
  [key: string]: any;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: TokenDecoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
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

  const navigate = useNavigate();
  
  // Usando o hook personalizado para obter as colunas
  const columns = useCotacaoColumns();

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
        pageSize: 6,
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
        setAllCotacoes([]);
        setCotacoes([]);
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

  const handleBack = () => {
    navigate("/inicio"); // ou qualquer outra rota conforme a estrutura da sua aplicação
  };

  const handleRetry = () => {
    // Tenta buscar as cotações novamente usando o mesmo intervalo de datas
    fetchCotacoes();
  };

  if (loading) {
    return <LoadingExample message="Carregando Cotações..." />;
  }

  if (error === "empty") {
    return (
      <EmptyCotacaoError
        alertMessage="Não foram encontrados cotações."
        onRetry={handleRetry}
        onBack={handleBack}
        showBackButton={true}
      />
    );
  }

  if (error === "error") {
    return (
      <EmptyCotacaoError
        alertMessage="Ocorreu um erro ao carregar as cotações. Por favor, tente novamente."
        onRetry={handleRetry}
        onBack={handleBack}
        showBackButton={true}
      />
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