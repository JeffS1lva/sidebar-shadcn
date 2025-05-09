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
  VisibilityState,
} from "@tanstack/react-table";
import { useBoletosColumns } from "@/hooks/useBoletosColumns";
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
import { useNavigate } from "react-router-dom";
import { BoletoFilter } from "./FiltersBoletos/BoletosFilter";
import { useState, useEffect } from "react";
import { Parcela } from "../../types/parcela";
import EmptyBoletosError from "./FiltersBoletos/EmptyBoletosError";
import LoadingExample from "./Loading/Loading";

// Função para verificar se o token está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Converte para milissegundos
    return Date.now() > expirationTime;
  } catch (error) {
    return true; // Em caso de erro, considerar o token como expirado
  }
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

  // Obter as colunas usando o hook
  const columns = useBoletosColumns();

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
        setParcelas([]);
        setAllParcelas([]);
        setError("Formato de dados recebido é inválido");
      }
    } catch (err) {
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

  if (loading) {
    return (
      <LoadingExample message="Carregando Boletos..."/>
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
