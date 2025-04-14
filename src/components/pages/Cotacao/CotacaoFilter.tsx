import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, X } from "lucide-react";
import { Table } from "@tanstack/react-table";

// Definindo a interface para a Cotacao
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

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CotacaoFilterProps {
  allCotacoes: Cotacao[];
  setCotacoes: React.Dispatch<React.SetStateAction<Cotacao[]>>;
  table: Table<Cotacao>;
}

type FilterType = "n_Cotacao" | "nome_Cliente" | "status" | "data_Cotacao" | "vendedor";

export function CotacaoFilter({
  allCotacoes,
  setCotacoes,
  table,
}: CotacaoFilterProps) {
  const [filterType, setFilterType] = React.useState<FilterType>("n_Cotacao");
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: null,
    end: null,
  });
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Get unique status values
  const uniqueStatuses = React.useMemo(() => {
    return Array.from(new Set(allCotacoes.map(item => item.status))).filter(Boolean);
  }, [allCotacoes]);

  // Get unique vendedores
  const uniqueVendedores = React.useMemo(() => {
    const vendedores = new Set<string>();

    allCotacoes.forEach((cotacao) => {
      if (cotacao.vendedor1) vendedores.add(cotacao.vendedor1);
      if (cotacao.vendedor2) vendedores.add(cotacao.vendedor2);
      if (cotacao.vendedor3) vendedores.add(cotacao.vendedor3);
    });

    return Array.from(vendedores).filter(Boolean);
  }, [allCotacoes]);

  // Apply filters
  const applyFilters = React.useCallback(() => {
    let filteredData = [...allCotacoes];

    if (filterType === "data_Cotacao") {
      // Apply date range filter
      if (dateRange.start && dateRange.end) {
        filteredData = filteredData.filter((item) => {
          if (!item.data_Cotacao) return false;

          const datePart = item.data_Cotacao.split("T")[0];
          const [year, month, day] = datePart.split("-").map(Number);
          const itemDate = new Date(Date.UTC(year, month - 1, day));

          return (
            dateRange.start !== null &&
            dateRange.end !== null &&
            itemDate >= dateRange.start &&
            itemDate <= dateRange.end
          );
        });
      }
    } else if (searchValue) {
      // Apply text search filter based on filterType
      if (filterType === "n_Cotacao") {
        const numericValue = searchValue.replace(/\D/g, "");
        filteredData = filteredData.filter((item) =>
          item.n_Cotacao.toString().includes(numericValue)
        );
      } else if (filterType === "nome_Cliente") {
        filteredData = filteredData.filter((item) =>
          item.nome_Cliente?.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else if (filterType === "status") {
        filteredData = filteredData.filter((item) =>
          item.status?.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else if (filterType === "vendedor") {
        const searchLower = searchValue.toLowerCase();
        filteredData = filteredData.filter(
          (item) =>
            (item.vendedor1 && item.vendedor1.toLowerCase().includes(searchLower)) ||
            (item.vendedor2 && item.vendedor2.toLowerCase().includes(searchLower)) ||
            (item.vendedor3 && item.vendedor3.toLowerCase().includes(searchLower))
        );
      }
    }

    // Update the table data
    setCotacoes(filteredData);

    // Reset pagination to first page
    table.setPageIndex(0);
  }, [
    allCotacoes,
    searchValue,
    filterType,
    dateRange,
    setCotacoes,
    table,
  ]);

  // Apply filters on state changes
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Reset all filters
  const resetFilters = () => {
    setSearchValue("");
    setFilterType("n_Cotacao");
    setDateRange({ start: null, end: null });
    setCotacoes(allCotacoes);
    table.setPageIndex(0);
  };

  // Get placeholder text based on selected filter type
  const getPlaceholder = () => {
    switch (filterType) {
      case "n_Cotacao":
        return "Buscar por número da cotação...";
      case "nome_Cliente":
        return "Buscar por nome do cliente...";
      case "status":
        return "Buscar por status...";
      case "vendedor":
        return "Buscar por vendedor...";
      case "data_Cotacao":
        return "Selecione um período";
      default:
        return "Pesquisar...";
    }
  };

  // Esta é uma função segura para formatar datas que lida com nulos
  const formatDateSafely = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="flex flex-col gap-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        {/* Grupo de busca principal */}
        <div className="flex items-center flex-1 gap-2">
          {/* Input de busca */}
          {filterType === "data_Cotacao" ? (
            <div className="flex-1">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start && dateRange.end ? (
                      <>
                        {formatDateSafely(dateRange.start)} {" - "}
                        {formatDateSafely(dateRange.end)}
                      </>
                    ) : (
                      "Selecione o período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateRange.start || undefined,
                      to: dateRange.end || undefined,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        // Define end of day for the end date
                        const endDate = new Date(range.to);
                        endDate.setHours(23, 59, 59, 999);

                        setDateRange({
                          start: range.from,
                          end: endDate,
                        });
                      } else {
                        setDateRange({
                          start: range?.from || null,
                          end: range?.to || null,
                        });
                      }
                    }}
                    locale={ptBR}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                  <div className="p-2 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange({ start: null, end: null })}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Limpar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="relative flex-1">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={getPlaceholder()}
                className="pl-8"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          )}

          {/* Select para tipo de filtro - AGORA À DIREITA DO INPUT */}
          <div>
            <Select value={filterType} onValueChange={(value: FilterType) => {
              setFilterType(value);
              setSearchValue("");
              if (value === "data_Cotacao") {
                setIsCalendarOpen(true);
              }
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="n_Cotacao">Nº Cotação</SelectItem>
                <SelectItem value="nome_Cliente">Cliente</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="data_Cotacao">Data da Cotação</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dropdowns adicionais para status e vendedor */}
        {filterType === "status" && (
          <div>
            <Select
              value={searchValue}
              onValueChange={(value) => setSearchValue(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterType === "vendedor" && (
          <div>
            <Select
              value={searchValue}
              onValueChange={(value) => setSearchValue(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o vendedor" />
              </SelectTrigger>
              <SelectContent>
                {uniqueVendedores.map((vendedor) => (
                  <SelectItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Botão para limpar filtros */}
        <Button variant="outline" onClick={resetFilters} className="w-32">
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}