// Arquivo: BoletoButton.tsx
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  // Carregar dados da parcela ao montar o componente
  useEffect(() => {
    // Se temos informações básicas, vamos pre-carregar os dados da parcela
    if (parcelaId) {
      const fetchParcelaData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          const response = await axios.get(
            `/api/external/Parcelas/${parcelaId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setParcelaData(response.data);
        } catch (error) {
          console.error("Erro ao carregar dados da parcela:", error);
        }
      };

      fetchParcelaData();
    }
  }, [parcelaId]);

  // Verificar se o boleto está vencido
  let vencimento: Date;
  try {
    // Verificação baseada no tipo de dataVencimento
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
  } catch (error) {
    console.error("Erro ao processar data de vencimento:", error);
    vencimento = new Date(0); // Em caso de erro, considera como expirado
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isExpired = vencimento < today;

  // Usar o status da parcela carregada ou o status passado como prop
  const statusAtual = parcelaData?.statusPagamento || status;
  const isPaid = ["baixado", "pago"].includes(statusAtual?.toLowerCase() || "");

  const hasId = parcelaId !== null && parcelaId !== undefined;
  const hasCodigoBoleto =
    boletoId !== null && boletoId !== undefined && boletoId !== "";

  // Verificar se o boleto está disponível para visualização
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
    <Button
      variant="bottomPassword"
      size="icon"
      className={`h-8 w-8 ${
        !boletoAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={handleVisualizarBoleto}
      disabled={!boletoAvailable}
      title={tooltipText}
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
  );
}
