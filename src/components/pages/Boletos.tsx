"use client";

import { useState } from "react";
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
import { Package, PackageOpen, Hourglass, Download, Eye } from "lucide-react";

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
  PaginationPrevious,
  PaginationNext,
} from "../ui/pagination";

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
  {
    id: 4,
    parcela: "4",
    numeroNota: "N12347",
    status: "Pendente",
    vencimento: "16/10/2023",
    valor: "R$ 1.600,00",
  },
  {
    id: 5,
    parcela: "5",
    numeroNota: "N12347",
    status: "Pendente",
    vencimento: "16/10/2023",
    valor: "R$ 1.600,00",
  },
  {
    id: 6,
    parcela: "6",
    numeroNota: "N12347",
    status: "Pendente",
    vencimento: "16/10/2023",
    valor: "R$ 1.600,00",
  },
  // Adicione mais boletos conforme necessário
];

const getStatusIcon = (status: "Pago" | "Pendente" | "Atrasado") => {
  switch (status) {
    case "Pago":
      return {
        icon: <PackageOpen size={24} className="text-green-500" />,
        color: "bg-green-100 text-gray-600",
      };
    case "Pendente":
      return {
        icon: <Hourglass size={21} className="text-yellow-500" />,
        color: "bg-yellow-100 text-gray-600",
      };
    case "Atrasado":
      return {
        icon: <Package size={24} className="text-red-500" />,
        color: "bg-red-100 text-gray-600",
      };
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

const fileUrl = "/boleto.pdf";
const fileName = "boleto.pdf";

export const columns: ColumnDef<BoletoType>[] = [
  {
    accessorKey: "parcela",
    header: () => <div className="text-center">Parcelas</div>,
    cell: ({ row }) => row.getValue("parcela"),
  },
  {
    accessorKey: "numeroNota",
    header: () => <div className="text-center">Número da Nota</div>,
    cell: ({ row }) => row.getValue("numeroNota"),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as "Pago" | "Pendente" | "Atrasado";
      const { icon, color } = getStatusIcon(status);
      return (
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full w-full ${color}`}
        >
          {icon}
          <span>{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "vencimento",
    header: () => <div className="text-center">Vencimento</div>,
    cell: ({ row }) => row.getValue("vencimento"),
  },
  {
    accessorKey: "valor",
    header: () => <div className="text-right">Valor Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.getValue("valor")}</div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      function handleDownload(_original: BoletoType): void {
        throw new Error("Function not implemented.");
      }

      function handlePrint(_original: BoletoType): void {
        throw new Error("Function not implemented.");
      }

      return (
        <div className="flex items-center justify-center gap-2">
          <a
            title="Download Boleto"
            href={fileUrl}
            download={fileName}
            onClick={() => handleDownload(row.original)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </a>
          <a
            title="Visualizar Boleto"
            target="_blank"
            href={fileUrl}
            onClick={() => handlePrint(row.original)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
          >
            <Eye />
            <span className="sr-only">Imprimir</span>
          </a>
        </div>
      );
    },
  },
];

export function Boletos() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // Estado da página atual
  const [itemsPerPage] = useState(5); // Número de itens por página

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    pageCount: Math.ceil(boletosData.length / itemsPerPage), // Definir o número total de páginas
  });

  // Obter as linhas para a página atual
  const rowsToDisplay = table
    .getRowModel()
    .rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full p-7">
      <h1 className="text-2xl font-bold">Boletos</h1>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por Número de Nota, Parcela ou Status"
          value={
            (table.getColumn("numeroNota")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("numeroNota")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
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
                  Nenhum boleto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-start space-x-2 py-4">
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
            {[...Array(Math.ceil(boletosData.length / itemsPerPage))].map(
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
                  if (
                    currentPage < Math.ceil(boletosData.length / itemsPerPage)
                  ) {
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
