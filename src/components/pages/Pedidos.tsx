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
import {
  ChevronDown,
  Hourglass,
  MoreHorizontal,
  Package,
  PackageOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarioFil } from "../CalendarioFil";

type ColumnKey =
  | "idPedido"
  | "dataLancamento"
  | "dataEntrega"
  | "statusPedido"
  | "dataPicking"
  | "statusPicking";

// Mapping object with correct typing
const columnLabels: Record<ColumnKey, string> = {
  idPedido: "Número do Pedido",
  dataLancamento: "Data de Lançamento",
  dataEntrega: "Data de Entrega",
  statusPedido: "Status do Pedido",
  dataPicking: "Data de Picking",
  statusPicking: "Status de Picking",
};

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
    idPedido: "375411",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Fechado",
    statusPedido: "Fechado",
  },
  // Adicione mais itens de exemplo conforme necessário
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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "idPedido",
    header: "Número do Pedido",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("idPedido")}</div>
    ),
  },
  {
    accessorKey: "dataLancamento",
    header: "Data de Lançamento",
    cell: ({ row }) => {
      const data = new Date(row.getValue("dataLancamento"));
      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(data);
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "dataEntrega",
    header: "Data de Entrega",
    cell: ({ row }) => {
      const data = new Date(row.getValue("dataEntrega"));
      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(data);
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "statusPedido",
    header: "Status do Pedido",
    cell: ({ row }) => {
      const process = row.getValue("statusPedido") as
        | "Aberto"
        | "Em Andamento"
        | "Fechado";
      const { icon, color } = getStatusPicking(process);

      return (
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${color}`}
        >
          {icon}
          <span>{process}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "dataPicking",
    header: "Data de Picking",
    cell: ({ row }) => {
      const data = new Date(row.getValue("dataPicking"));
      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(data);
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "statusPicking",
    header: "Status de Picking",
    cell: ({ row }) => {
      const process = row.getValue("statusPicking") as
        | "Aberto"
        | "Em Andamento"
        | "Fechado";
      const { icon, color } = getStatusPicking(process);

      return (
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${color}`}
        >
          {icon}
          <span>{process}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.idPedido)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  });

  return (
    <div className="w-full p-7">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Digite N° Pedido..."
          value={
            (table.getColumn("idPedido")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("idPedido")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <CalendarioFil />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Filtro <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnLabels[column.id as ColumnKey] || column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
