"use client";

import React, { useState, useEffect } from "react";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Package, PackageOpen, Hourglass } from "lucide-react";

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

interface Boleto {
  id: number;
  parcela: string;
  numeroNota: string;
  status: "Pago" | "Pendente" | "Atrasado";
  vencimento: string;
  valor: string;
}

const boletosData: Boleto[] = [
  {
    id: 1,
    parcela: "1",
    numeroNota: "N12345",
    status: "Pago",
    vencimento: "10/10/2023",
    valor: "R$ 500,00",
  },
  {
    id: 2,
    parcela: "2",
    numeroNota: "N12346",
    status: "Atrasado",
    vencimento: "19/02/2024",
    valor: "R$ 600,00",
  },
  {
    id: 3,
    parcela: "3",
    numeroNota: "N12347",
    status: "Pendente",
    vencimento: "16/10/2023",
    valor: "R$ 1.600,00",
  },
];

const getStatusIcon = (status: "Pago" | "Pendente" | "Atrasado") => {
  switch (status) {
    case "Pago":
      return { icon: <PackageOpen size={24} className="text-green-500" />, color: "bg-green-100 text-gray-600" };
    case "Pendente":
      return { icon: <Hourglass size={21} className="text-yellow-500" />, color: "bg-yellow-100 text-gray-600" };
    case "Atrasado":
      return { icon: <Package size={24} className="text-red-500" />, color: "bg-red-100 text-gray-600" };
    default:
      return { icon: null, color: "" };
  }
};

export type BoletoType = {
  id: number;
  parcela: string;
  numeroNota: string;
  status: "Pago" | "Pendente" | "Atrasado";
  vencimento: string;
  valor: string;
};

export const columns: ColumnDef<BoletoType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    accessorKey: "parcela",
    header: "Número da Parcela",
    cell: ({ row }) => row.getValue("parcela"),
  },
  {
    accessorKey: "numeroNota",
    header: "Número da Nota",
    cell: ({ row }) => row.getValue("numeroNota"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "Pago" | "Pendente" | "Atrasado";
      const { icon, color } = getStatusIcon(status);
      return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-full ${color}`}>
          {icon}
          <span>{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "vencimento",
    header: "Data de Vencimento",
    cell: ({ row }) => row.getValue("vencimento"),
  },
  {
    accessorKey: "valor",
    header: () => <div className="text-right">Valor Total</div>,
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue("valor")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const boleto = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem>Visualizar Boleto</DropdownMenuItem>
            <DropdownMenuItem>Baixar Boleto</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function Boletos() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: boletosData,
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
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por Número de Nota, Parcela ou Status"
          value={(table.getColumn("numeroNota")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("numeroNota")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown />
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
                    {column.id}
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum boleto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
