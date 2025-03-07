import { useEffect, useState } from "react";
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
import {
  BadgeAlert,
  BadgeCheck,
  Clock3,
  Download,
  FileCode,
  Search,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [itemsPerPage] = useState<number>(5);
  const [orderedInvoices, setOrderedInvoices] = useState<Invoice[]>([]);

  const invoicesData: Invoice[] = [
    {
      invoice: "01",
      issueDate: "2021-02-01",
      authorizedBills: 2,
      totalAmount: "250.00",
      paymentStatus: "Pago",
    },
    {
      invoice: "02",
      issueDate: "2000-02-05",
      authorizedBills: 1,
      totalAmount: "150.00",
      paymentStatus: "Pendente",
    },
    {
      invoice: "03",
      issueDate: "2020-02-10",
      authorizedBills: 3,
      totalAmount: "350.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "04",
      issueDate: "2025-02-12",
      authorizedBills: 1,
      totalAmount: "450.00",
      paymentStatus: "Pago",
    },
    {
      invoice: "05",
      issueDate: "2022-02-15",
      authorizedBills: 2,
      totalAmount: "550.00",
      paymentStatus: "Pago",
    },
    {
      invoice: "06",
      issueDate: "2025-02-18",
      authorizedBills: 1,
      totalAmount: "200.00",
      paymentStatus: "Pendente",
    },
    {
      invoice: "07",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "08",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "09",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "10",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
    {
      invoice: "11",
      issueDate: "2025-02-20",
      authorizedBills: 2,
      totalAmount: "300.00",
      paymentStatus: "Atrasado",
    },
  ];

  useEffect(() => {
    const sortByDate = () => {
      const sortedInvoices = [...invoicesData].sort((a, b) => {
        const dateA = new Date(a.issueDate);
        const dateB = new Date(b.issueDate);
        return dateB.getTime() - dateA.getTime();
      });

      setOrderedInvoices(sortedInvoices);
    };

    sortByDate();
  }, [invoicesData]);

  const filteredInvoices = (
    orderedInvoices.length > 0 ? orderedInvoices : invoicesData
  ).filter(
    (invoice) =>
      invoice.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string): string => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

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
          icon: <BadgeCheck className="text-green-500" />,
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

  const indexOfLastInvoice = currentPage * itemsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full p-7">
      <h1 className="text-2xl font-bold">Notas Fiscais</h1>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por Número de Nota ou Status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">N° Nota</TableHead>
              <TableHead className="text-center">Data da Emissão</TableHead>
              <TableHead className="text-center">Boletos Autorizados</TableHead>
              <TableHead className="text-center">Valor Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
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
                    <TableCell >
                      {invoice.invoice}
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{invoice.authorizedBills}</TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-2 ${color} px-3 py-1 rounded-full`}
                      >
                        {icon}
                        <span>{invoice.paymentStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-3 justify-center">
                      <a
                        href="#"
                        target="_blank"
                        title="Download NF-e"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
                      >
                        <Download size={20} />
                      </a>

                      <a
                        href="#"
                        title="Download XML"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
                      >
                        <FileCode size={20} />
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <TableCaption>Lista de notas fiscais recentes.</TableCaption>
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
