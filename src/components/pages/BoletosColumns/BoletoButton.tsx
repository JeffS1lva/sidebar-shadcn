// Arquivo: BoletoButton.tsx
import { useEffect, useState, useCallback } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoletoViewer } from "@/components/pages/BoletosColumns/BoletoViewer";
import { parseDate } from "@/utils/boletos/formatters";
import axios from "axios";

interface BoletoButtonProps {
  boletoId: string | number | null | undefined;
  parcelaId: string | number | null | undefined;
  dataVencimento?: string | Date | null; // Data de vencimento da parcela
  status?: string; // Status do pagamento
}

export function BoletoButton({
  boletoId,
  parcelaId,
  dataVencimento,
  status,
}: BoletoButtonProps) {
  const { showBoletoViewer } = useBoletoViewer();
  const [parcelaData, setParcelaData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Função para buscar dados da parcela
  const fetchParcelaData = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (loading) return;
    
    // Verificar se temos o ID da parcela
    if (!parcelaId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `/api/external/Parcelas/${parcelaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setParcelaData(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [parcelaId]);

  // Carregar dados da parcela apenas ao montar o componente ou quando o parcelaId mudar
  useEffect(() => {
    if (parcelaId && !parcelaData && !loading) {
      fetchParcelaData();
    }
  }, [parcelaId, fetchParcelaData, parcelaData, loading]);

  // Determinar se o boleto está vencido
  const getVencimentoInfo = useCallback(() => {
    let vencimento: Date;
    let isExpired: boolean = false;
    
    try {
      // Usar data de vencimento da parcela carregada ou da prop
      const dataParaVerificar = parcelaData?.dataVencimento || dataVencimento;

      if (dataParaVerificar instanceof Date) {
        vencimento = dataParaVerificar;
      } else if (typeof dataParaVerificar === "string" && dataParaVerificar) {
        try {
          vencimento = parseDate(dataParaVerificar as any);
        } catch {
          vencimento = new Date(dataParaVerificar);
        }
      } else {
        vencimento = new Date(0); // Data inválida para forçar expiração
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isExpired = vencimento < today;
    } catch (error) {
      isExpired = true; // Em caso de erro, considera como expirado
    }
    
    return isExpired;
  }, [parcelaData, dataVencimento]);

  // Verificar status de pagamento
  const isPaid = (parcelaData?.statusPagamento || status || "")
    .toLowerCase()
    .includes(["baixado", "pago"].some(s => 
      (parcelaData?.statusPagamento || status || "").toLowerCase().includes(s)
    ));

  const hasId = parcelaId !== null && parcelaId !== undefined;
  const hasCodigoBoleto =
    boletoId !== null && boletoId !== undefined && boletoId !== "";

  // Verificar se o boleto está disponível para visualização
  const isExpired = getVencimentoInfo();
  const boletoAvailable = hasId && hasCodigoBoleto && !isExpired && !isPaid;

  // Definir o texto do tooltip baseado na disponibilidade
  const tooltipText =
    !hasId || !hasCodigoBoleto
      ? "Boleto não disponível"
      : isExpired
      ? isPaid
        ? "Este boleto já foi quitado e não está mais disponível"
        : "Boleto vencido - não pode ser visualizado"
      : isPaid
      ? "Este boleto já foi quitado e não está mais disponível"
      : "Visualizar boleto para pagamento";

  const handleVisualizarBoleto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      boletoAvailable &&
      boletoId !== undefined &&
      boletoId !== null &&
      parcelaId !== undefined &&
      parcelaId !== null
    ) {
      // Usar os dados da parcela que já carregamos ou os dados mínimos que temos
      showBoletoViewer(
        String(boletoId),
        String(parcelaId),
        parcelaData || {
          dataVencimento: dataVencimento,
          statusPagamento: status,
        }
      );
    }
  };

  return (
    <TooltipProvider delayDuration={3000}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="bottomPassword"
            size="icon"
            className={`h-8 w-8 ${
              !boletoAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={handleVisualizarBoleto}
            disabled={!boletoAvailable}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">
              {!boletoAvailable
                ? isPaid
                  ? "Boleto indisponível: já está pago"
                  : "Boleto indisponível"
                : "Visualizar boleto para pagamento"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}