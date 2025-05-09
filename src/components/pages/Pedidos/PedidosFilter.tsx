// PedidosFilter.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,

  
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { CustomCalendar } from "./CustomCalendar";

// Tipos
type SearchType =
  | "numeroPedido"
  | "statusDoPedido"
  | "notaFiscal"
  | "dataLancamentoPedido"
  | "dataParaEntrega";

type PeriodFilter = "ultimoMes" | "ultimos90Dias" | "ultimoAno" | "todos";

interface PedidosFilterProps {
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  currentPeriodFilter: PeriodFilter;
  applyPeriodFilter: (filter: PeriodFilter) => void;
  activeDateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
  setActiveDateRange: (range: {
    start: Date | undefined;
    end: Date | undefined;
  }) => void;
  fetchPedidosWithDateRange: (
    startDate: Date,
    endDate: Date,
    formattedRange?: {
      start: string;
      end: string;
    }
  ) => Promise<void>;
}
export const PedidosFilter = ({
  searchType,
  setSearchType,
  searchValue,
  setSearchValue,
  currentPeriodFilter,
  applyPeriodFilter,
  activeDateRange,
  setActiveDateRange,
  fetchPedidosWithDateRange,
}: PedidosFilterProps) => {
  // Estados para popovers
  const [isFromPopoverOpen, setIsFromPopoverOpen] = React.useState(false);
  const [isToPopoverOpen, setIsToPopoverOpen] = React.useState(false);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(
    activeDateRange.start
  );
  const [dateTo, setDateTo] = React.useState<Date | undefined>(
    activeDateRange.end
  );

  // Atualizar datas locais quando o período ativo muda
  React.useEffect(() => {
    setDateFrom(activeDateRange.start);
    setDateTo(activeDateRange.end);
  }, [activeDateRange]);

  // Função para lidar com a mudança da data inicial
  const handleFromDateChange = (date: Date | undefined) => {
    setDateFrom(date);
    setIsFromPopoverOpen(false);
  };

  // Função para lidar com a mudança da data final
  const handleToDateChange = (date: Date | undefined) => {
    setDateTo(date);
    setIsToPopoverOpen(false);
  };

  // Aplicar filtro de data personalizado
  const handleApplyDateFilter = () => {
    if (dateFrom && dateTo) {
      // Formatando as datas no formato YYYY-MM-DD esperado pela função filterFn
      const formatDateToString = (date: Date): string => {
        const year = date.getFullYear();
        // Adicionar zero à esquerda se mês/dia for menor que 10
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Configurando o intervalo de datas formatado corretamente
      const formattedDateRange = {
        start: formatDateToString(dateFrom),
        end: formatDateToString(dateTo),
      };

      // Definindo o intervalo de datas ativo para o componente
      setActiveDateRange({
        start: dateFrom,
        end: dateTo,
      });

      // Chamada com as datas formatadas como strings
      fetchPedidosWithDateRange(dateFrom, dateTo, formattedDateRange);
    }
  };

  // Resetar os campos de busca
  const handleReset = () => {
    setSearchValue("");
    // Reaplica o filtro de período atual
    applyPeriodFilter(currentPeriodFilter);
  };

  // Placeholder dinâmico para o campo de busca
  const getPlaceholder = () => {
    switch (searchType) {
      case "numeroPedido":
        return "Buscar por número do pedido...";
      case "statusDoPedido":
        return "Buscar por status do pedido...";
      case "notaFiscal":
        return "Buscar por nota fiscal...";
      case "dataLancamentoPedido":
        return "Selecione o período de lançamento...";
      case "dataParaEntrega":
        return "Selecione o período de entrega...";
      default:
        return "Buscar...";
    }
  };

  return (
    <div className="space-y-4">
      {/* Componente de Filtro por Tipo */}
      <div className="flex flex-col space-y-4 py-2">
        <div className="flex items-start space-x-2">
          {/* Input ou Data Pickers baseado no tipo de busca */}
          {searchType !== "dataLancamentoPedido" &&
          searchType !== "dataParaEntrega" ? (
            <Input
              placeholder={getPlaceholder()}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1"
            />
          ) : (
            <div className="flex flex-1 space-x-2">
              <Popover
                open={isFromPopoverOpen}
                onOpenChange={setIsFromPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    selected={dateFrom}
                    onSelect={handleFromDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover open={isToPopoverOpen} onOpenChange={setIsToPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CustomCalendar
                    selected={dateTo}
                    onSelect={handleToDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Seletor de tipo de busca */}
          <Select
            value={searchType}
            onValueChange={(value) => {
              setSearchType(value as SearchType);
              setSearchValue("");
            }}
          >
            <SelectTrigger className="w-[180px] ">
              <SelectValue placeholder="Tipo de busca" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipo de Busca</SelectLabel>
                <SelectItem value="numeroPedido">Número do Pedido</SelectItem>
                <SelectItem value="statusDoPedido">Status do Pedido</SelectItem>
                <SelectItem value="notaFiscal">Nota Fiscal</SelectItem>
                <SelectItem value="dataLancamentoPedido">
                  Data de Lançamento
                </SelectItem>
                <SelectItem value="dataParaEntrega">Data de Entrega</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex space-x-2 items-center">
            <Select
              value={currentPeriodFilter}
              onValueChange={(value) =>
                applyPeriodFilter(value as PeriodFilter)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Período</SelectLabel>
                  <SelectItem value="ultimoMes">Último Mês</SelectItem>
                  <SelectItem value="ultimos90Dias">Últimos 90 Dias</SelectItem>
                  <SelectItem value="ultimoAno">Último Ano</SelectItem>
                  <SelectItem value="todos">Últimos Dois Anos</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Botões de ação */}
          {searchType === "dataLancamentoPedido" ||
          searchType === "dataParaEntrega" ? (
            <Button
              onClick={handleApplyDateFilter}
              disabled={!dateFrom || !dateTo}
            >
              Filtrar
            </Button>
          ) : (
            <Button
              onClick={() => {
                /* Aplicar filtro de texto */
              }}
              disabled={!searchValue}
            >
              Filtrar
            </Button>
          )}
          <Button variant="outline" onClick={handleReset}>
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
};
