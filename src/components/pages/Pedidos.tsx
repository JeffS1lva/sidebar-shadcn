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
} from "@tanstack/react-table";
import axios from "axios";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Paginacao } from "./Pedidos/Paginacao";

interface Pedido {
  grupo: string;
  codigoTransportadora: string;
  nomeTransportadora: string | null;
  estado: string;
  codigoDoCliente: string;
  nomeCliente: string;
  numeroPedido: number;
  dataLancamentoPedido: string;
  dataParaEntrega: string;
  statusDoPedido: string;
  dataPicking: string;
  statusPicking: string;
  notaFiscal: number;
}

export const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Estados para a tabela
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Estados para a busca
  const [searchType, setSearchType] = React.useState<
    "numeroPedido" | "statusDoPedido" | "notaFiscal"
  >("numeroPedido");
  const [searchValue, setSearchValue] = React.useState<string>("");

  // Funções auxiliares
  const formatarData = (dataString: string | null) => {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto":
        return "bg-yellow-100 text-yellow-800";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800";
      case "Fechado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Definição das colunas
  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: "numeroPedido",
      header: "Nº Pedido",
    },
    {
      accessorKey: "dataLancamentoPedido",
      header: "Data Lanç.",
      cell: ({ row }) => formatarData(row.getValue("dataLancamentoPedido")),
    },
    {
      accessorKey: "dataParaEntrega",
      header: "Data Entrega",
      cell: ({ row }) => formatarData(row.getValue("dataParaEntrega")),
    },
    {
      accessorKey: "statusDoPedido",
      header: "Status Pedido",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            row.getValue("statusDoPedido")
          )}`}
        >
          {row.getValue("statusDoPedido")}
        </span>
      ),
    },
    {
      accessorKey: "statusPicking",
      header: "Status Picking",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            row.getValue("statusPicking")
          )}`}
        >
          {row.getValue("statusPicking")}
        </span>
      ),
    },
    {
      accessorKey: "notaFiscal",
      header: "Nota Fiscal",
    },
    {
      accessorKey: "nomeTransportadora",
      header: "Nome Transp.",
      cell: ({ row }) => row.getValue("nomeTransportadora") ?? "-",
    },
    {
      accessorKey: "estado",
      header: "Estado",
    },
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
  ];

  // Configuração da tabela
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
        pageSize: 6, // Define 6 linhas por página
      },
    },
  });

  // Busca dos dados
  React.useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError(
            "Você precisa estar autenticado para visualizar os pedidos."
          );
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/Pedidos/consultar-pedidos", {
          params: {
            dataINI: "2025-02-01",
            dataFIM: "2025-03-18",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data.value)) {
          setPedidos(response.data.value);
        } else {
          setPedidos([]);
        }

        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar pedidos:", err);
        setError("Erro ao carregar os pedidos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  // Função para atualizar o filtro automaticamente enquanto o usuário digita
  React.useEffect(() => {
    if (searchType === "numeroPedido" || searchType === "notaFiscal") {
      // Aplica o filtro apenas se o valor for numérico
      const numericValue = searchValue.replace(/\D/g, ""); // Remove caracteres não numéricos
      table.getColumn(searchType)?.setFilterValue(numericValue);
    } else {
      // Para outros tipos de busca (como status), aplica o filtro diretamente
      table.getColumn(searchType)?.setFilterValue(searchValue);
    }
  }, [searchValue, searchType, table]);

  // Atualizar o placeholder com base no tipo de busca selecionado
  const getPlaceholder = () => {
    switch (searchType) {
      case "numeroPedido":
        return "Buscar por número do pedido...";
      case "statusDoPedido":
        return "Buscar por status do pedido...";
      case "notaFiscal":
        return "Buscar por nota fiscal...";
      default:
        return "Buscar...";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Carregando pedidos...</p>
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
      <h1 className="text-3xl font-bold">Pedidos</h1>
      <div className="flex items-center py-4 mt-4">
        <div className="flex w-full">
          <Input
            placeholder={getPlaceholder()}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="flex-1"
          />
          <Select
            value={searchType}
            onValueChange={(value) =>
              setSearchType(
                value as "numeroPedido" | "statusDoPedido" | "notaFiscal"
              )
            }
          >
            <SelectTrigger className="w-[180px] ml-2">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipo de Busca</SelectLabel>
                <SelectItem value="numeroPedido">Número do Pedido</SelectItem>
                <SelectItem value="statusDoPedido">Status do Pedido</SelectItem>
                <SelectItem value="notaFiscal">Nota Fiscal</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Paginacao
          currentPage={table.getState().pagination.pageIndex + 1} // Página atual (base 1)
          pageCount={table.getPageCount()} // Total de páginas
          onPageChange={(page) => table.setPageIndex(page - 1)} // Função para mudar de página
        />
      </div>
    </div>
  );
};