import React, { useState, useEffect } from "react";
import { BadgeAlert, BadgeCheck, Clock3, Search } from "lucide-react";
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
  const [visibleBarcode, setVisibleBarcode] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const boletosData: Boleto[] = [
    {
      id: 1,
      parcela: "001",
      numeroNota: "N12345",
      status: "Pago",
      vencimento: "10/10/2023",
      valor: "R$ 500,00",
      codigoBarras:
        "https://via.placeholder.com/300x100.png?text=Codigo+Barras+1",
    },
    {
      id: 2,
      parcela: "002",
      numeroNota: "N12346",
      status: "Atrasado",
      vencimento: "19/02/2025",
      valor: "R$ 600,00",
      codigoBarras:
        "https://via.placeholder.com/300x100.png?text=Codigo+Barras+2",
    },
    {
      id: 3,
      parcela: "003",
      numeroNota: "N12347",
      status: "Pendente",
      vencimento: "16/10/2025",
      valor: "R$ 1.600,00",
      codigoBarras:
        "https://via.placeholder.com/300x100.png?text=Codigo+Barras+3",
    },
  ];

  const [boletos, setBoletos] = useState<Boleto[]>([]);

  useEffect(() => {
    console.log("Atualizando boletos...");
    const boletosComStatusAtualizado = boletosData.map((boleto) => ({
      ...boleto,
    }));
    setBoletos(boletosComStatusAtualizado);
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

  const toggleBarcode = (id: number) => {
    if (visibleBarcode === id) {
      setVisibleBarcode(null);
    } else {
      setVisibleBarcode(id);
    }
  };

  return (
    <div className="p-1   md:p-6">
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
                        <Button onClick={() => toggleBarcode(boleto.id)}>
                          {visibleBarcode === boleto.id
                            ? "Ocultar Código"
                            : "Exibir Código"}
                        </Button>
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
