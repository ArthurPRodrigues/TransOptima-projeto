export type Transportadora = {
  id: number;
  razaoSocial: string;
  cnpj: string;
  uf: string;
  quimicosControlados: boolean;
  disponivelParaFrete?: boolean;
};

export type Documento = {
  id: number;
  tipo?: string | null;
  tipoDocumentoId?: number;
  emissao?: string;
  vencimento?: string;
  arquivo?: string;
  transportadoraId: number;
};
