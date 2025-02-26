import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BadgeAlert, BadgeCheck, Clock3, Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Importando os componentes de paginação

interface Invoice {
  invoice: string;
  issueDate: string;
  authorizedBills: number;
  totalAmount: string;
  paymentStatus: "Pago" | "Pendente" | "Atrasado";
}

export function Notes() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5); // Limitando a 5 itens por página

  const invoicesData: Invoice[] = [
    {
      invoice: "INV001",
      issueDate: "2025-02-01",
      authorizedBills: 2,
      totalAmount: "250.00",
      paymentStatus: "Pago",
    },
    {
      invoice: "INV002",
      issueDate: "2025-02-05",
      authorizedBills: 1,
      totalAmount: "150.00",
      paymentStatus: "Pendente",
    },
    {
      invoice: "INV003",
      issueDate: "2025-02-10",
      authorizedBills: 3,
      totalAmount: "350.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "INV004",
      issueDate: "2025-02-12",
      authorizedBills: 1,
      totalAmount: "450.00",
      paymentStatus: "Pago",
    },
    {
      invoice: "INV005",
      issueDate: "2025-02-15",
      authorizedBills: 2,
      totalAmount: "550.00",
      paymentStatus: "Pago",
    },
    {
      invoice: "INV006",
      issueDate: "2025-02-18",
      authorizedBills: 1,
      totalAmount: "200.00",
      paymentStatus: "Pendente",
    },
    {
      invoice: "INV007",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "INV008",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "INV009",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "INV010",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "INV011",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
  ];

  const filteredInvoices = invoicesData.filter(
    (invoice) =>
      invoice.invoice.includes(searchTerm) ||
      invoice.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para formatar a data como "DD/MM/YYYY"
  const formatDate = (date: string): string => {
    const [year, month, day] = date.split("-"); // Formato original: YYYY-MM-DD
    return `${day}/${month}/${year}`;
  };

  // Função para formatar o valor total em Reais (R$)
  const formatCurrency = (value: string): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const getStatusInfo = (status: "Pago" | "Pendente" | "Atrasado") => {
    switch (status) {
      case "Pago":
        return {
          icon: <BadgeCheck  className="text-green-500" />,
          color: "bg-green-100 text-gray-700",
        };
      case "Pendente":
        return {
          icon: <Clock3 className="text-yellow-500" />,
          color: "bg-yellow-100 text-gray-700",
        };
      case "Atrasado":
        return {
          icon: <BadgeAlert className="text-red-500" />,
          color: "bg-red-100 text-gray-700",
        };
      default:
        return { icon: null, color: "" };
    }
  };

  // Lógica de paginação
  const indexOfLastInvoice = currentPage * itemsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const handleGenerateBoleto = (invoiceId: string) => {
    alert(`Gerando DANFE ${invoiceId}`);
  };

  const handleViewXML = (invoiceId: string) => {
    alert(`Exibindo XML da nota ${invoiceId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 ml-3">
      <h2 className="text-2xl font-bold mb-4 ">Notas Fiscais</h2>

      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            size={20}
          />
          <Input
            type="text"
            placeholder="Digite o N° da Nota ou Status"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableCaption>Lista de suas notas fiscais recentes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">N° Nota</TableHead>
            <TableHead>Data da Emissão</TableHead>
            <TableHead>Boletos Autorizados</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentInvoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Nenhuma nota encontrada.
              </TableCell>
            </TableRow>
          ) : (
            currentInvoices.map((invoice) => {
              const { icon, color } = getStatusInfo(invoice.paymentStatus);
              return (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">
                    {invoice.invoice}
                  </TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>{" "}
                  {/* Data formatada */}
                  <TableCell>{invoice.authorizedBills}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.totalAmount)}{" "}
                    {/* Valor formatado em Reais */}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center gap-2 ${color} px-3 py-1 rounded-full`}
                    >
                      {icon}
                      <span>{invoice.paymentStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell className="flex gap-3">
                    <Button
                      onClick={() => handleGenerateBoleto(invoice.invoice)}
                    >
                      Download Danfe
                    </Button>
                    <Button onClick={() => handleViewXML(invoice.invoice)}>
                      Exibir XML
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Componente de Paginação do ShadCN */}
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
          {[...Array(Math.ceil(filteredInvoices.length / itemsPerPage))].map(
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
                  currentPage <
                  Math.ceil(filteredInvoices.length / itemsPerPage)
                ) {
                  handlePageChange(currentPage + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
