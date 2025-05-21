export interface Parcela {
  codigoBoleto: number;
  codigoPN: string;
  nomePN: string;
  cnpj: string;
  numNF: string;
  parcela: string;
  valorParcela: number;
  dataVencimento: string;
  dataPagamento: string;
  status: string;
  filial?: string;
  chaveNFe?: string;
  statusNotaFiscal?: string;
  id: number;
}