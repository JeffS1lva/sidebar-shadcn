import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Hourglass, Package, PackageOpen } from "lucide-react";

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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

export type DataPedidos = {
  idPedido: string;
  dataLancamento: string;
  dataEntrega: string;
  dataPicking: string;
  statusPicking: "Aberto" | "Em Andamento" | "Fechado";
  statusPedido: "Aberto" | "Em Andamento" | "Fechado";
};

const data: DataPedidos[] = [
  {
    idPedido: "375410",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Em Andamento",
    statusPedido: "Em Andamento",
  },
  {
    idPedido: "375411",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Aberto",
    statusPedido: "Aberto",
  },
  {
    idPedido: "375412",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Fechado",
    statusPedido: "Fechado",
  },
  {
    idPedido: "375413",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Aberto",
    statusPedido: "Aberto",
  },
  {
    idPedido: "375414",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Em Andamento",
    statusPedido: "Em Andamento",
  },
  {
    idPedido: "375415",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Aberto",
    statusPedido: "Aberto",
  },
  // Adicione mais itens conforme necessário
];

const getStatusPicking = (process: "Aberto" | "Em Andamento" | "Fechado") => {
  switch (process) {
    case "Aberto":
      return {
        icon: <PackageOpen size={24} className="text-green-500" />,
        color: "bg-green-100 text-gray-600",
      };
    case "Em Andamento":
      return {
        icon: <Hourglass size={21} className="text-yellow-500" />,
        color: "bg-yellow-100 text-gray-600",
      };
    case "Fechado":
      return {
        icon: <Package size={24} className="text-red-500" />,
        color: "bg-red-100 text-gray-600",
      };
    default:
      return { icon: null, color: "" };
  }
};

export const columns: ColumnDef<DataPedidos>[] = [
  
  {
    accessorKey: "idPedido",
    header: () => <div className="text-center">Número do Pedido</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("idPedido")}</div>
    ),
  },
  {
    accessorKey: "dataLancamento",
    header: () => <div className="text-center">Lançamento</div>,
    cell: ({ row }) => {
      const data = new Date(row.getValue("dataLancamento"));
      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(data);
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "dataEntrega",
    header: () => <div className="text-center">Data de Entrega</div>,
    cell: ({ row }) => {
      const data = new Date(row.getValue("dataEntrega"));
      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(data);
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "statusPedido",
    header: () => <div className="text-center">Status do Pedido</div>,
    cell: ({ row }) => {
      const process = row.getValue("statusPedido") as
        | "Aberto"
        | "Em Andamento"
        | "Fechado";
      const { icon, color } = getStatusPicking(process);

      return (
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full w-full ${color}`}
        >
          {icon}
          <span>{process}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "dataPicking",
    header: () => <div className="text-center">Data de Picking</div>,
    cell: ({ row }) => {
      const data = new Date(row.getValue("dataPicking"));
      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(data);
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "statusPicking",
    header:() => <div className="text-center">Status de Picking</div>,
    cell: ({ row }) => {
      const process = row.getValue("statusPicking") as
        | "Aberto"
        | "Em Andamento"
        | "Fechado";
      const { icon, color } = getStatusPicking(process);

      return (
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full w-full ${color}`}
        >
          {icon}
          <span>{process}</span>
        </div>
      );
    },
  },
];

export function Pedidos() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1); // Estado da página atual
  const [itemsPerPage] = React.useState(5); // Número de itens por página

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    pageCount: Math.ceil(data.length / itemsPerPage), // Definir o número total de páginas
  });

  // Obter as linhas para a página atual
  const rowsToDisplay = table
    .getRowModel()
    .rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full p-7">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Digite N° Pedido..."
          value={
            (table.getColumn("idPedido")?.getFilterValue() as string) || ""
          }
          onChange={(event) =>
            table.getColumn("idPedido")?.setFilterValue(event.target.value)
          }
          className="max-w-sm  rounded"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rowsToDisplay.length ? (
              rowsToDisplay.map((row) => (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
              />
            </PaginationItem>
            {[...Array(Math.ceil(data.length / itemsPerPage))].map(
              (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === index + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(index + 1);
                    }}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < Math.ceil(data.length / itemsPerPage)) {
                    handlePageChange(currentPage + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
