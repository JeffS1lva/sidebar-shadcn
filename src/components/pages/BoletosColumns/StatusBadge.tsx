import { parseDate } from "@/utils/boletos/formatters";
import { ReactNode } from "react";

interface StatusBadgeProps {
  status: string;
  dataPagamento?: string | Date | null;
  dataVencimento: string;
}

interface StatusConfig {
  color: string;
  label: string;
  icon: ReactNode | null;
}

export const StatusBadge = ({ status, dataPagamento, dataVencimento }: StatusBadgeProps) => {
  const statusConfig = getStatusConfig(status, dataPagamento, dataVencimento);
  
  return (
    <div className="flex justify-start">
      <span
        className={`w-24 py-1 pl-3 rounded-md text-xs font-medium flex items-center justify-start ${statusConfig.color}`}
      >
        {statusConfig.icon}
        {statusConfig.label}
      </span>
    </div>
  );
};

const getStatusConfig = (
  status: string, 
  dataPagamento: string | Date | null | undefined, 
  dataVencimento: string
): StatusConfig => {
  const statusLower = status?.toLowerCase() || "";
  let config: StatusConfig = {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    label: status || "N/A",
    icon: null
  };

  switch (statusLower) {
    case "baixado":
    case "pago":
      config = {
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        label: "Pago",
        icon: (
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        )
      };
      break;
    case "gerado":
    case "confirmado":
    case "remessa":
      config = {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
        label: "Pendente",
        icon: (
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        )
      };
      break;
    case "pendente":
      // Verifica se está atrasado
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const vencimento = parseDate(dataVencimento);
      
      if (vencimento < hoje && !dataPagamento) {
        config = {
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          label: "Atrasado",
          icon: (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          )
        };
      } else {
        config = {
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
          label: "Pendente",
          icon: (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          )
        };
      }
      break;
    case "atrasado":
      config = {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        label: "Atrasado",
        icon: (
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        )
      };
      break;
    case "cancelado":
      config = {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        label: "Cancelado",
        icon: (
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        )
      };
      break;
  }
  
  return config;
};