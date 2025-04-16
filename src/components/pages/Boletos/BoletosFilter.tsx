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
import { Parcela } from '../../../types/parcela';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface BoletoFilterProps {
  allParcelas: Parcela[];
  setParcelas: React.Dispatch<React.SetStateAction<Parcela[]>>;
  table: Table<Parcela>;
  onSearch: (value: string, type: FilterType) => void;
}

type FilterType =
  | "codigoBoleto"
  | "nomePN"
  | "cnpj"
  | "numNF"
  | "dataVencimento";

export function BoletoFilter({
  allParcelas,
  setParcelas,
  table,
  onSearch,
}: BoletoFilterProps) {
  const [filterType, setFilterType] =
    React.useState<FilterType>("codigoBoleto");
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: null,
    end: null,
  });
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  // Flag para controlar se estamos fazendo uma nova pesquisa que requer reset da página
  const [isNewSearch, setIsNewSearch] = React.useState(false);

  const applyFilters = React.useCallback(() => {
    let filteredData = [...allParcelas];

    if (filterType === "dataVencimento") {
      if (dateRange.start && dateRange.end) {
        filteredData = filteredData.filter((item) => {
          if (!item.dataVencimento) return false;
          const datePart = item.dataVencimento.split("T")[0];
          const [year, month, day] = datePart.split("-").map(Number);
          const itemDate = new Date(Date.UTC(year, month - 1, day));

          return itemDate >= dateRange.start! && itemDate <= dateRange.end!;
        });
      }
    } else if (searchValue) {
      const value = searchValue.toLowerCase();
      switch (filterType) {
        case "codigoBoleto":
          const numericValue = value.replace(/\D/g, "");
          filteredData = filteredData.filter((item) =>
            item.codigoBoleto.toString().includes(numericValue)
          );
          break;
        case "nomePN":
          filteredData = filteredData.filter((item) =>
            item.nomePN?.toLowerCase().includes(value)
          );
          break;
        case "cnpj":
          const cnpjSearch = value.replace(/[^\d]/g, "");
          filteredData = filteredData.filter((item) =>
            item.cnpj?.replace(/[^\d]/g, "").includes(cnpjSearch)
          );
          break;
        case "numNF":
          filteredData = filteredData.filter((item) =>
            item.numNF?.toLowerCase().includes(value)
          );
          break;
      }
    }

    setParcelas(filteredData);

    // Só resetamos o índice da página quando for uma nova pesquisa
    if (isNewSearch) {
      table.setPageIndex(0); // Reinicia o flag
    }
  }, [
    allParcelas,
    filterType,
    searchValue,
    dateRange,
    setParcelas,
    table,
    isNewSearch,
  ]);

  const resetFilters = () => {
    setSearchValue("");
    setFilterType("codigoBoleto");
    setDateRange({ start: null, end: null });
    setIsNewSearch(true); // Marcar como nova pesquisa
    setParcelas(allParcelas);
    table.setPageIndex(0);
  };

  const handleSearch = React.useCallback(() => {
    setIsNewSearch(true); // Indicar que é uma nova pesquisa
    applyFilters();
    setIsNewSearch(false);
  }, [searchValue, filterType, onSearch, applyFilters]);

  // Automatic search on input change
  React.useEffect(() => {
    if (filterType !== "dataVencimento") {
      const delayDebounce = setTimeout(() => {
        // Indicar que é uma nova pesquisa
        handleSearch();
      }, 300); // debounce delay

      return () => clearTimeout(delayDebounce);
    }
  }, [searchValue, filterType, handleSearch]);

  // Efeito para aplicar filtros quando o período de data mudar
  React.useEffect(() => {
    if (filterType === "dataVencimento" && dateRange.start && dateRange.end) {
      // Indicar que é uma nova pesquisa
      applyFilters();
    }
  }, [dateRange, filterType, applyFilters]);

  const getPlaceholder = () => {
    switch (filterType) {
      case "codigoBoleto":
        return "Buscar por código do boleto...";
      case "nomePN":
        return "Buscar por nome do cliente...";
      case "cnpj":
        return "Buscar por CNPJ...";
      case "numNF":
        return "Buscar por número da NF...";
      case "dataVencimento":
        return "Selecione um período de vencimento";
      default:
        return "Pesquisar...";
    }
  };

  const formatDateSafely = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="flex flex-col gap-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center flex-1 gap-2">
          {filterType === "dataVencimento" ? (
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
                      "Selecione o período de vencimento"
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
                        const endDate = new Date(range.to);
                        endDate.setHours(23, 59, 59, 999);
                        setDateRange({
                          start: range.from,
                          end: endDate,
                        });
                        // Fecha o popover após selecionar as datas
                        setIsCalendarOpen(false);
                      } else {
                        setDateRange({
                          start: range?.from || null,
                          end: range?.to || null,
                        });
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                  <div className="p-2 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDateRange({ start: null, end: null });
                        // Opcionalmente, fechar o popover também ao limpar
                        setIsCalendarOpen(false);
                      }}
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

          {/* Select movido para a direita do input */}
          <div>
            <Select
              value={filterType}
              onValueChange={(value: FilterType) => {
                setFilterType(value);
                setSearchValue("");
                setIsNewSearch(true); // Marcar como nova pesquisa ao mudar o tipo de filtro
                if (value === "dataVencimento") {
                  setIsCalendarOpen(true);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="codigoBoleto">Código</SelectItem>
                <SelectItem value="nomePN">Nome</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="numNF">NF</SelectItem>
                <SelectItem value="dataVencimento">Vencimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão de limpar permanece */}
          <Button variant="outline" onClick={resetFilters}>
            Limpar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}