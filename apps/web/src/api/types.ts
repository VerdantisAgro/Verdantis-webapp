export interface User {
  id: number;
  userName: string;
  email: string;
}

export interface Paged<T> {
  content: T[];
}

export interface Property {
  id: number;
  propertyName: string;
}

export interface Lote {
  id: number;
  lote?: string;
  nomeLote?: string;
  cultura: string;
  producao?: number;
  custo?: number;
  receita?: number;
  lucroEstimado?: number;
  status?: string;
}

export interface Evento {
  id?: number;
  loteId: number;
  tipoEvento: string;
  descricao: string;
}

export interface SimulacaoRequest {
  [key: string]: {
    cultura: string;
    producaoEstimada: number;
    custoEstimado: number;
    precoEstimado: number;
  };
}

export interface SimulacaoResponse {
  comparacaoLucro: Record<string, number>;
  comparacaoReceita: Record<string, number>;
  melhorOpcao: string;
}

export interface Dashboard {
  lucroTotal: number;
  culturaMaisRentavel: string;
  loteMaisRentavel: string;
  precoMedio: number;
}

export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  userType: string;
}

export interface Cotacao {
  cultura: string;
  precoSaca: number;
}
