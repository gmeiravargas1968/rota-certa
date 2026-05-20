export type TipoVeiculo = 'moto' | 'carro' | 'van';

export interface Profile {
  id: string;
  nome_completo: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConfiguracaoVeiculo {
  id: string;
  user_id: string;
  tipo_veiculo: TipoVeiculo;
  autonomia_kml: number;
  preco_combustivel: number;
  custo_mei_mensal: number;
  custo_seguro_mensal: number;
  reserva_manutencao: number;
  custo_documentacao: number;
  reserva_depreciacao: number;
  km_estimado_mes: number;
  created_at: string;
  updated_at: string;
}

export interface LancamentoDiario {
  id: string;
  user_id: string;
  data: string;
  km_inicial: number;
  km_final: number;
  valor_diaria: number;
  qtd_pacotes: number;
  valor_por_pacote: number;
  ajuda_custo: number;
  custo_combustivel: number;
  custo_pedagio: number;
  custo_alimentacao: number;
  // Colunas geradas
  total_km: number;
  receita_bruta: number;
  custos_diretos: number;
  sobra_limpa: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  sobra_limpa_hoje: number;
  lucro_real_hoje: number;
  custo_real_por_km: number;
  margem_lucro_percent: number;
  alerta_lucro_baixo: boolean;
  tendencia_30_dias: TendenciaDia[];
  resumo_mes_atual: ResumoMensal;
}

export interface TendenciaDia {
  data: string;
  lucro_real: number;
}

export interface ResumoMensal {
  total_faturado: number;
  total_gasto: number;
  lucro_real_mes: number;
  total_km: number;
  media_lucro_diario: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
