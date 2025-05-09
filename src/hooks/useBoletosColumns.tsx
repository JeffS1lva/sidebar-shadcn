import { ColumnDef } from "@tanstack/react-table";
import {
  formatCNPJ,
  formatCurrency,
  formatDatePtBr,
} from "@/utils/boletos/formatters";
import { numericFilter, dateRangeFilter } from "@/utils/boletos/filters";
import { StatusBadge } from "@/components/pages/BoletosColumns/StatusBadge";
import { PaymentDate } from "@/components/pages/BoletosColumns/PaymentDate";
import { BoletoButton } from "@/components/pages/BoletosColumns/BoletoButton";
import type { Parcela } from "@/types/parcela";

export const useBoletosColumns = () => {
  const columns: ColumnDef<Parcela>[] = [
    {
      accessorKey: "codigoBoleto",
      header: "Código",
      filterFn: numericFilter,
      cell: ({ row }) => {
        // Explicitly type the codigoBoleto to ensure it matches BoletoButton props
        const codigoBoleto = row.getValue("codigoBoleto") as string | number | null | undefined;
        const id = row.original.id;
        const dataVencimento = row.getValue("dataVencimento") as string;
        const status = row.getValue("status") as string;

        return (
          <div className="flex items-center gap-1">
            <span className="block text-center font-medium min-w-[50px]">
              {codigoBoleto ? String(codigoBoleto) : "-"}
            </span>
            <div className="flex gap-1">
              <BoletoButton
                boletoId={codigoBoleto}
                parcelaId={id}
                dataVencimento={dataVencimento}
                status={status}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "nomePN",
      header: "Nome",
      cell: ({ row }) => (
        <div
          className="whitespace-nowrap overflow-hidden text-ellipsis flex w-56 dark:text-gray-200"
          title={row.getValue("nomePN")}
        >
          {row.getValue("nomePN")}
        </div>
      ),
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">
          {formatCNPJ(row.getValue("cnpj"))}
        </span>
      ),
    },
    {
      accessorKey: "numNF",
      header: "NF",
      filterFn: "includesString",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">{row.getValue("numNF")}</span>
      ),
    },
    {
      accessorKey: "parcela",
      header: "Parcela",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">{row.getValue("parcela")}</span>
      ),
    },
    {
      accessorKey: "valorParcela",
      header: "Valor",
      cell: ({ row }) => (
        <span className="dark:text-gray-200">
          {formatCurrency(row.getValue("valorParcela"))}
        </span>
      ),
    },
    {
      accessorKey: "dataVencimento",
      header: "Vencimento",
      cell: ({ row }) => {
        const value = row.getValue("dataVencimento") as string;
        return (
          <span className="dark:text-gray-200">{formatDatePtBr(value)}</span>
        );
      },
      filterFn: dateRangeFilter,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const dataVencimento = row.getValue("dataVencimento") as string;
        const dataPagamento = row.getValue("dataPagamento") as string;

        return (
          <StatusBadge
            status={status}
            dataPagamento={dataPagamento}
            dataVencimento={dataVencimento}
          />
        );
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const status = String(row.getValue(columnId)).toLowerCase();
        return filterValue.toLowerCase() === status;
      },
    },
    {
      accessorKey: "dataPagamento",
      header: "Data Pagamento",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const dataPagamento = row.getValue("dataPagamento") as string;

        return <PaymentDate status={status} dataPagamento={dataPagamento} />;
      },
      filterFn: dateRangeFilter,
    },
  ];

  return columns;
};