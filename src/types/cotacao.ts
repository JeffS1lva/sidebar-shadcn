export interface Cotacao {
  n_Cotacao: number;
  data_Cotacao: string;
  status: string;
  cliente: string;
  nome_Cliente: string;
  uf: string;
  valor_Total_Cotacao: number;
  codSlp1: number;
  codSlp2: number;
  codSlp3: number;
  vendedor1: string;
  vendedor2: string | null;
  vendedor3: string | null;
  id: number;
}

export interface TokenDecoded {
  exp: number;
  [key: string]: any;
}