"use client";

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
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  subDays,
  subMonths,
  subYears,
  addMonths,
  addYears,
  getYear,
  getMonth,
} from "date-fns";
import * as React from "react";
import { ptBR } from "date-fns/locale";

// Componente de calendário personalizado que permite navegar entre meses e anos
const CustomCalendar = ({
  selected,
  onSelect,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  initialFocus: boolean;
  periodFilter: "todos" | "ultimoAno" | "ultimoMes" | "ultimos90Dias";
}) => {
  const [viewDate, setViewDate] = React.useState<Date>(selected || new Date());

  // Somente atualiza a visualização inicial quando o componente monta
  // Não reage às mudanças do filtro de período aqui
  React.useEffect(() => {
    if (selected) {
      setViewDate(selected);
    }
  }, []);

  // Navegar para o mês anterior
  const previousMonth = () => {
    setViewDate((prevDate) => addMonths(prevDate, -1));
  };

  // Navegar para o próximo mês
  const nextMonth = () => {
    setViewDate((prevDate) => addMonths(prevDate, 1));
  };

  // Navegar para o ano anterior
  const previousYear = () => {
    setViewDate((prevDate) => addYears(prevDate, -1));
  };

  // Navegar para o próximo ano
  const nextYear = () => {
    setViewDate((prevDate) => addYears(prevDate, 1));
  };

  // Gerar dias do mês atual
  const getDaysInMonth = (date: Date) => {
    const year = getYear(date);
    const month = getMonth(date);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];

    // Preencher dias vazios do início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Preencher os dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(viewDate);
  const currentYear = getYear(viewDate);
  const monthName = format(viewDate, "MMMM", { locale: ptBR });

  // Verificar se uma data está selecionada
  const isSelected = (date: Date) => {
    if (!selected) return false;
    return date.toDateString() === selected.toDateString();
  };

  // Verificar se uma data é hoje
  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousYear}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center font-medium">
          <span className="capitalize">{monthName}</span> {currentYear}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextYear}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, i) => (
          <div key={i} className="font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className="text-center p-1">
            {day ? (
              <button
                type="button"
                onClick={() => onSelect(day)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${isSelected(day) ? "bg-primary text-primary-foreground" : ""}
                  ${
                    isToday(day) && !isSelected(day)
                      ? "border border-primary"
                      : ""
                  }
                  hover:bg-muted transition-colors
                `}
              >
                {day.getDate()}
              </button>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface PedidosFilterProps {
  searchType:
    | "numeroPedido"
    | "statusDoPedido"
    | "notaFiscal"
    | "dataLancamentoPedido"
    | "dataParaEntrega";
  setSearchType: (
    type:
      | "numeroPedido"
      | "statusDoPedido"
      | "notaFiscal"
      | "dataLancamentoPedido"
      | "dataParaEntrega"
  ) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  onDateChange?: (
    startDate: Date | undefined,
    endDate: Date | undefined,
    columnId: string
  ) => void;
  periodFilter: "todos" | "ultimoAno" | "ultimoMes" | "ultimos90Dias";
  onPeriodFilterChange: (
    value: "todos" | "ultimoAno" | "ultimoMes" | "ultimos90Dias"
  ) => void;
}

type PeriodFilter = "todos" | "ultimoAno" | "ultimoMes" | "ultimos90Dias";

export const PedidosFilter = ({
  searchType,
  setSearchType,
  searchValue,
  setSearchValue,
  onDateChange,
  periodFilter,
  onPeriodFilterChange,
}: PedidosFilterProps) => {
  // Referências para os popovers de calendário
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(
    null
  );
  const [showAllData, setShowAllData] = React.useState<boolean>(false);

  // Estados para controlar abertura dos popovers
  const [isFromPopoverOpen, setIsFromPopoverOpen] = React.useState(false);
  const [isToPopoverOpen, setIsToPopoverOpen] = React.useState(false);

  // Definição de colunas que devem ser filtradas por data

  // Atualizar o estado local baseado no filtro de período recebido do componente pai
  React.useEffect(() => {
    const today = new Date();
    let startDate: Date | undefined;

    // Sincroniza o estado interno com o valor recebido do componente pai
    if (periodFilter === "todos") {
      setShowAllData(true);
      setDateFrom(undefined);
      setDateTo(undefined);
    } else if (periodFilter === "ultimoAno") {
      startDate = subYears(today, 1);
      setDateFrom(startDate);
      setDateTo(today);
      setShowAllData(false);
    } else if (periodFilter === "ultimoMes") {
      startDate = subMonths(today, 1);
      setDateFrom(startDate);
      setDateTo(today);
      setShowAllData(false);
    } else if (periodFilter === "ultimos90Dias") {
      startDate = subDays(today, 90);
      setDateFrom(startDate);
      setDateTo(today);
      setShowAllData(false);
    }

    // Não aplicamos o filtro automaticamente quando muda o período
    // Apenas quando o usuário clica em "Filtrar"
  }, [periodFilter]);

  // Executamos esse efeito quando o componente é montado e quando o tipo de busca muda
  React.useEffect(() => {
    if (searchType === "dataLancamentoPedido") {
      setActiveColumnId("dataLancamentoPedido");
      alert(
        "⚠️ O filtro por Data de Lançamento está em desenvolvimento. Pode apresentar falhas temporariamente."
      );
    } else if (searchType === "dataParaEntrega") {
      setActiveColumnId("dataParaEntrega");
      alert(
        "⚠️ O filtro por Data de Entrega está em desenvolvimento. Pode apresentar falhas temporariamente."
      );
    } else {
      setActiveColumnId(null);
    }
  }, [searchType]);

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

  // Função para lidar com a mudança da data inicial
  const handleFromDateChange = (date: Date | undefined) => {
    setDateFrom(date);
    setIsFromPopoverOpen(false);

    // Não aplicamos o filtro automaticamente quando muda a data
    // Apenas quando o usuário clica em "Filtrar"
  };

  // Função para lidar com a mudança da data final
  const handleToDateChange = (date: Date | undefined) => {
    setDateTo(date);
    setIsToPopoverOpen(false);

    // Não aplicamos o filtro automaticamente quando muda a data
    // Apenas quando o usuário clica em "Filtrar"
  };

  const handleDateChange = (columnId: string) => {
    if (onDateChange) {
      if (showAllData) {
        // Quando "Todos os dados" está selecionado, passa undefined para mostrar tudo
        onDateChange(undefined, undefined, columnId);
      } else if (dateFrom && dateTo) {
        // Filtragem normal de intervalo de data
        onDateChange(dateFrom, dateTo, columnId);
      }
    }
  };

  const resetDates = () => {
    // Apenas limpa as datas selecionadas, mas mantém o filtro de período atual
    setDateFrom(undefined);
    setDateTo(undefined);
    
    // Define showAllData baseado no periodFilter
    if (periodFilter === "todos") {
      setShowAllData(true);
    } else {
      setShowAllData(false);
    }
    
    // Se estamos em modo de filtro por data e activeColumnId estiver definido
    // aplicamos o filtro baseado no periodFilter atual
    if (activeColumnId) {
      if (periodFilter === "todos") {
        // Quando "Todos os dados" está selecionado, passa undefined para mostrar tudo
        onDateChange && onDateChange(undefined, undefined, activeColumnId);
      } else {
        // Para os outros filtros, aplicamos o filtro atual mas sem datas específicas
        // Isso efetivamente significa "mostrar dados conforme o filtro de período"
        const today = new Date();
        let startDate: Date | undefined;
        
        if (periodFilter === "ultimoAno") {
          startDate = subYears(today, 1);
        } else if (periodFilter === "ultimoMes") {
          startDate = subMonths(today, 1);
        } else if (periodFilter === "ultimos90Dias") {
          startDate = subDays(today, 90);
        }
        
        onDateChange && onDateChange(startDate, today, activeColumnId);
      }
    }
  }


  // Função para lidar com a mudança no select de período
  const handlePeriodFilterChange = (value: PeriodFilter) => {
    // Delegamos para o componente pai
    onPeriodFilterChange(value);

    // Atualizamos as datas no estado baseado no período selecionado,
    // mas não aplicamos o filtro ainda
    const today = new Date();
    if (value === "todos") {
      setDateFrom(undefined);
      setDateTo(undefined);
    } else if (value === "ultimoAno") {
      setDateFrom(subYears(today, 1));
      setDateTo(today);
    } else if (value === "ultimoMes") {
      setDateFrom(subMonths(today, 1));
      setDateTo(today);
    } else if (value === "ultimos90Dias") {
      setDateFrom(subDays(today, 90));
      setDateTo(today);
    }
  };

  return (
    <div className="flex flex-col space-y-4 py-2 mt-2">
      <div className="flex w-full items-start space-x-2">
        {searchType !== "dataLancamentoPedido" &&
        searchType !== "dataParaEntrega" ? (
          <Input
            placeholder={getPlaceholder()}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
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
                  disabled={showAllData}
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
                  periodFilter={periodFilter}
                />
              </PopoverContent>
            </Popover>

            <Popover open={isToPopoverOpen} onOpenChange={setIsToPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-left font-normal"
                  disabled={showAllData}
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
                  periodFilter={periodFilter}
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => activeColumnId && handleDateChange(activeColumnId)}
              disabled={(!dateFrom || !dateTo) && !showAllData}
            >
              Filtrar
            </Button>

            <Button
              variant="outline"
              onClick={resetDates}
              disabled={!dateFrom && !dateTo && !showAllData}
            >
              Limpar
            </Button>
          </div>
        )}

        <Select
          value={searchType}
          onValueChange={(value) => {
            setSearchType(
              value as
                | "numeroPedido"
                | "statusDoPedido"
                | "notaFiscal"
                | "dataLancamentoPedido"
                | "dataParaEntrega"
            );
            setSearchValue("");
          }}
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
              <SelectItem value="dataLancamentoPedido">
                Data de Lançamento
              </SelectItem>
              <SelectItem value="dataParaEntrega">Data de Entrega</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={periodFilter}
          onValueChange={(value) =>
            handlePeriodFilterChange(value as PeriodFilter)
          }
        >
          <SelectTrigger className="w-[180px] ml-2">
            <SelectValue placeholder="Período" />
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
    </div>
  );
};
