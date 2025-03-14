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
  Hourglass,
  Package,
  PackageOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DataPedidos = {
  idPedido: string;
  numeroNota: string; // Adicionado campo para número da nota
  dataLancamento: string;
  dataEntrega: string;
  dataPicking: string;
  statusPicking: "Aberto" | "Em Andamento" | "Fechado";
  statusPedido: "Aberto" | "Em Andamento" | "Fechado";
};

const data: DataPedidos[] = [
  {
    idPedido: "375410",
    numeroNota: "NF-435678",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Em Andamento",
    statusPedido: "Em Andamento",
  },
  {
    idPedido: "375411",
    numeroNota: "NF-435679",
    dataLancamento: "2025-02-15",
    dataEntrega: "2025-02-20",
    dataPicking: "2025-02-17",
    statusPicking: "Aberto",
    statusPedido: "Aberto",
  },
  {
    idPedido: "375412",
    numeroNota: "NF-435680",
    dataLancamento: "2024-11-15",
    dataEntrega: "2024-11-20",
    dataPicking: "2024-11-17",
    statusPicking: "Fechado",
    statusPedido: "Fechado",
  },
  {
    idPedido: "375413",
    numeroNota: "NF-435681",
    dataLancamento: "2024-12-16",
    dataEntrega: "2024-12-21",
    dataPicking: "2024-12-18",
    statusPicking: "Aberto",
    statusPedido: "Aberto",
  },
  {
    idPedido: "375414",
    numeroNota: "NF-435682",
    dataLancamento: "2025-01-17",
    dataEntrega: "2025-01-22",
    dataPicking: "2025-01-19",
    statusPicking: "Em Andamento",
    statusPedido: "Em Andamento",
  },
  {
    idPedido: "375415",
    numeroNota: "NF-435683",
    dataLancamento: "2025-03-18",
    dataEntrega: "2025-03-23",
    dataPicking: "2025-03-20",
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
    accessorKey: "numeroNota",
    header: () => <div className="text-center">Número da Nota</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("numeroNota")}</div>
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
    header: () => <div className="text-center">Status de Picking</div>,
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

// Componente de Calendário personalizado com seletor de ano
const CalendarioPersonalizado = ({
  date,
  onDateChange,
  disabledDates,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(date || today);

  // Gerar anos para o seletor (5 anos atrás até 5 anos à frente)
  const years = Array.from(
    { length: 11 },
    (_, i) => today.getFullYear() - 5 + i
  );

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-2">
          {/* Exibir nome do mês atual */}
          <span className="font-medium ">
            {format(currentMonth, "MMMM", { locale: ptBR })
              .charAt(0)
              .toUpperCase() +
              format(currentMonth, "MMMM", { locale: ptBR })
                .slice(1)
                .toLowerCase()}
          </span>

          {/* Seletor de ano */}
          <Select
            defaultValue={currentMonth.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue
                placeholder={currentMonth.getFullYear().toString()}
              />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <CalendarComponent
        mode="single"
        selected={date}
        onSelect={onDateChange}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        disabled={disabledDates}
      />
    </div>
  );
};

// Componente de Seleção de Data
const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilter,
}: {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onFilter: () => void;
  disabled?: boolean
}) => {
  return (
    <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
      <div className="grid gap-2">
        <Label htmlFor="startDate">Data Inicial</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="startDate"
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {startDate ? (
                format(startDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione a data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarioPersonalizado
              date={startDate}
              onDateChange={onStartDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="endDate">Data Final</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="endDate"
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {endDate ? (
                format(endDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione a data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarioPersonalizado
              date={endDate}
              onDateChange={onEndDateChange}
              disabledDates={(date) => {
                // Desabilita datas anteriores à data inicial
                return startDate ? date < startDate : false;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button onClick={onFilter} className="md:ml-2">
        Filtrar
      </Button>
    </div>
  );
};

export function Pedidos() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(5);

  // Estados para o filtro de data
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [filteredData, setFilteredData] = React.useState<DataPedidos[]>(data);

  // Estado para controlar qual campo está sendo usado para filtrar
  const [filterField, setFilterField] = React.useState<string>("idPedido");

  // Estado para o valor do input de filtro
  const [filterValue, setFilterValue] = React.useState<string>("");

  // Placeholders personalizados para cada tipo de filtro
  const placeholders = {
    idPedido: "Digite N° Pedido...",
    numeroNota: "Digite N° da Nota...",
    statusPedido: "Digite 'Aberto', 'Em Andamento' ou 'Fechado'...",
    statusPicking: "Digite 'Aberto', 'Em Andamento' ou 'Fechado'...",
    dataLancamento: "Digite N° Pedido...",
    dataEntrega: "Digite N° Pedido...",
    dataPicking: "Digite N° Pedido...",
  };

  // Labels para cada tipo de filtro
  const filterLabels = {
    idPedido: "Número do Pedido",
    numeroNota: "Número da Nota",
    statusPedido: "Status do Pedido",
    statusPicking: "Status de Picking",
    dataLancamento: "Data de Lançamento",
    dataEntrega: "Data de Entrega",
    dataPicking: "Data de Picking",
  };

  // Função para atualizar o campo de filtro
  const handleFilterFieldChange = (value: string) => {
    setFilterField(value);
    setFilterValue(""); // Limpa o valor do input ao trocar o tipo de filtro

    // Limpa filtros da tabela
    if (value !== "idPedido") {
      table.getColumn("idPedido")?.setFilterValue("");
    }

    // Limpa as datas se trocar para um campo que não é de data
    if (!["dataLancamento", "dataEntrega", "dataPicking"].includes(value)) {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Função para filtrar os dados
  const applyFilters = () => {
    let filtered = [...data];

    // Filtro por texto (pedido, nota ou status)
    if (filterValue) {
      filtered = filtered.filter((item) => {
        if (filterField === "idPedido") {
          return item.idPedido
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        } else if (filterField === "numeroNota") {
          return item.numeroNota
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        } else if (filterField === "statusPedido") {
          return item.statusPedido
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        } else if (filterField === "statusPicking") {
          return item.statusPicking
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
        return true;
      });
    }

    // Filtro por data (sempre aplicado, mas só usado para campos de data)
    if (startDate) {
      // Verifica se o campo atual é um campo de data
      const isDateField = ["dataLancamento", "dataEntrega", "dataPicking"].includes(filterField);

      // Aplica filtro de data apenas para campos de data
      if (isDateField) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(
            item[filterField as keyof DataPedidos] as string
          );

          // Se só temos a data inicial, checamos se a data do item é maior ou igual
          if (startDate && !endDate) {
            // Resetamos as horas para comparar apenas as datas
            const startDateOnly = new Date(startDate);
            startDateOnly.setHours(0, 0, 0, 0);

            const itemDateOnly = new Date(itemDate);
            itemDateOnly.setHours(0, 0, 0, 0);

            return itemDateOnly >= startDateOnly;
          }

          // Se temos data inicial e final, checamos se está dentro do range
          if (startDate && endDate) {
            const startDateOnly = new Date(startDate);
            startDateOnly.setHours(0, 0, 0, 0);

            const endDateOnly = new Date(endDate);
            endDateOnly.setHours(23, 59, 59, 999); // Final do dia

            const itemDateOnly = new Date(itemDate);
            itemDateOnly.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de timezone

            return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
          }

          return true;
        });
      }
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Volta para a primeira página após filtrar
  };

  const table = useReactTable({
    data: filteredData,
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
    pageCount: Math.ceil(filteredData.length / itemsPerPage),
  });

  // Obter as linhas para a página atual
  const rowsToDisplay = table
    .getRowModel()
    .rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Limpar filtros
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setFilteredData(data);
    setCurrentPage(1);
    setFilterValue("");
    table.getColumn("idPedido")?.setFilterValue("");
  };

  // Monitorar mudanças no valor do filtro para o campo idPedido (para compatibilidade)
  React.useEffect(() => {
    if (filterField === "idPedido") {
      const columnFilterValue = table
        .getColumn("idPedido")
        ?.getFilterValue() as string;
      if (columnFilterValue !== filterValue) {
        setFilterValue(columnFilterValue || "");
      }
    }
  }, [table.getColumn("idPedido")?.getFilterValue()]);

  // Atualizar filtro da tabela quando mudar o valor do input
  React.useEffect(() => {
    if (filterField === "idPedido") {
      table.getColumn("idPedido")?.setFilterValue(filterValue);
    }
  }, [filterValue, filterField]);

  // Verificar se o campo atual é um campo de data
  const isDateField = ["dataLancamento", "dataEntrega", "dataPicking"].includes(filterField);

  return (
    <div className="w-full p-7">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <div className="flex flex-col space-y-4 py-4">
        {/* Linha superior com input, botão filtrar e select */}
        <div className="flex gap-4 items-end">
          {/* Área de input e botão filtrar */}
          <div className="w-[80%]">
            <Label htmlFor="searchField" className="mb-2 block">
              {filterLabels[filterField as keyof typeof filterLabels]}
            </Label>
            <div className="flex gap-2">
              <Input
                id="searchField"
                placeholder={
                  placeholders[filterField as keyof typeof placeholders]
                }
                value={filterValue}
                onChange={(event) => setFilterValue(event.target.value)}
                className="rounded w-full"
              />

              {/* Botão filtrar ao lado do input */}
              <Button onClick={applyFilters} className="px-8">
                Buscar
              </Button>
            </div>
          </div>

          {/* Select para escolher o tipo de filtro */}
          <div className="w-[20%]">
            <Label htmlFor="filterFieldSelect" className="mb-2 block text-sm">
              Filtrar por
            </Label>
            <Select
              defaultValue="idPedido"
              value={filterField}
              onValueChange={handleFilterFieldChange}
            >
              <SelectTrigger id="filterFieldSelect" className="w-full text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idPedido">Número do Pedido</SelectItem>
                <SelectItem value="numeroNota">Número da Nota</SelectItem>
                <SelectItem value="statusPedido">Status do Pedido</SelectItem>
                <SelectItem value="statusPicking">Status de Picking</SelectItem>
                <SelectItem value="dataLancamento">
                  Data de Lançamento
                </SelectItem>
                <SelectItem value="dataEntrega">Data de Entrega</SelectItem>
                <SelectItem value="dataPicking">Data de Picking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Segunda linha com DateRangePicker (apenas visível quando for campo de data) e botão Limpar Filtros */}
        <div className="flex gap-4 items-start justify-between">
          {/* DateRangePicker à esquerda, agora condicional */}
          <div className="flex-1">
            {isDateField ? (
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFilter={applyFilters}
              />
            ) : (
              <div className="h-10"></div> // Espaço vazio para manter o layout
            )}
          </div>

          {/* Botão limpar filtros à direita */}
          <div className="flex items-end h-full">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
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
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end mt-4">
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
            {[...Array(Math.ceil(filteredData.length / itemsPerPage))].map(
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
                    currentPage < Math.ceil(filteredData.length / itemsPerPage)
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