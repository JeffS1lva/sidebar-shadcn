import React, { useState, useEffect } from "react";
import {
  BadgeAlert,
  BadgeCheck,
  Clock3,
  Download,
  Eye,
  Search,
} from "lucide-react";
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

interface Boleto {
  id: number;
  parcela: string;
  numeroNota: string;
  status: "Pago" | "Pendente" | "Atrasado";
  vencimento: string;
  valor: string;
  codigoBarras: string;
}

export function Boletos() {
  const [visibleBarcode] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const boletosData: Boleto[] = [
    {
      id: 1,
      parcela: "1",
      numeroNota: "N12345",
      status: "Pago",
      vencimento: "10/10/2023",
      valor: "R$ 500,00",
      codigoBarras:
        "https://via.placeholder.com/300x100.png?text=Codigo+Barras+1",
    },
    {
      id: 2,
      parcela: "2",
      numeroNota: "N12346",
      status: "Atrasado",
      vencimento: "19/02/2024",
      valor: "R$ 600,00",
      codigoBarras:
        "https://via.placeholder.com/300x100.png?text=Codigo+Barras+2",
    },
    {
      id: 3,
      parcela: "3",
      numeroNota: "N12347",
      status: "Pendente",
      vencimento: "16/10/2023",
      valor: "R$ 1.600,00",
      codigoBarras:
        "https://via.placeholder.com/300x100.png?text=Codigo+Barras+3",
    },
  ];

  const [boletos, setBoletos] = useState<Boleto[]>([]);

  useEffect(() => {
    console.log("Atualizando boletos...");
    // Função para converter data do formato DD/MM/YYYY para objeto Date
    const converterData = (dataString: string): Date => {
      const [dia, mes, ano] = dataString.split('/').map(Number);
      return new Date(ano, mes - 1, dia); // Mês em JS começa em 0
    };

    // Ordenar boletos por data de vencimento (mais recente para mais antigo)
    const boletosOrdenados = [...boletosData].sort((a, b) => {
      const dataA = converterData(a.vencimento);
      const dataB = converterData(b.vencimento);
      return dataB.getTime() - dataA.getTime(); // Ordem decrescente
    });

    setBoletos(boletosOrdenados);
  }, []);

  const filteredBoletos = boletos.filter(
    (boleto) =>
      boleto.numeroNota.includes(searchTerm) ||
      boleto.parcela.includes(searchTerm) ||
      boleto.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (status: "Pago" | "Pendente" | "Atrasado") => {
    switch (status) {
      case "Pago":
        return {
          icon: <BadgeCheck className="text-green-500" />,
          color: "bg-green-100 text-gray-600",
        };
      case "Pendente":
        return {
          icon: <Clock3 className="text-yellow-500" />,
          color: "bg-yellow-100 text-gray-600",
        };
      case "Atrasado":
        return {
          icon: <BadgeAlert className="text-red-500" />,
          color: "bg-red-100 text-gray-600",
        };
      default:
        return { icon: null, color: "" };
    }
  };

  const fileUrl = "/boleto.pdf";
  const fileName = "Boleto";

  return (
    <div className="p-1 md:p-6">
      <h2 className="text-xl  md:text-2xl font-bold mb-4">
        Registros de Boletos
      </h2>

      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 transform -translate-y-1/2 "
            size={20}
          />
          <Input
            type="text"
            placeholder="Digite N° Nota, Parcela ou Status do Boleto"
            className="pl-10 pr-4 py-2 border border-gray-300  rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Lista de boletos consultados.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Número da Parcela</TableHead>
              <TableHead>Número da Nota</TableHead>
              <TableHead>Status do Boleto</TableHead>
              <TableHead>Data de Vencimento</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBoletos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum boleto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredBoletos.map((boleto) => {
                const { icon, color } = getStatusInfo(boleto.status);
                return (
                  <React.Fragment key={boleto.id}>
                    <TableRow>
                      <TableCell>{boleto.parcela}</TableCell>
                      <TableCell>{boleto.numeroNota}</TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-2 ${color} px-3 py-1 rounded-full`}
                        >
                          {icon}
                          <span>{boleto.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{boleto.vencimento}</TableCell>
                      <TableCell>{boleto.valor}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <a
                            href={fileUrl}
                            target="_blank"
                            title="Exibir Boleto"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
                          >
                            <Eye size={30} />
                          </a>

                          <a
                            href={fileUrl}
                            download={fileName}
                            title="Download Boleto"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
                          >
                            <Download size={30} />
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                    {visibleBarcode === boleto.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          <img
                            src={boleto.codigoBarras}
                            alt="Código de Barras"
                            className="w-64 mx-auto"
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}