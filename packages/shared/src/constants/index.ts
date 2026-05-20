export const TIPOS_VEICULO = ['moto', 'carro', 'van'] as const;

export const VALORES_PADRAO = {
  custo_mei_mensal: 75.0,
  custo_seguro_mensal: 0,
  reserva_manutencao: 0,
  custo_documentacao: 0,
  reserva_depreciacao: 0,
  valor_diaria: 0,
  qtd_pacotes: 0,
  valor_por_pacote: 0,
  ajuda_custo: 0,
  custo_pedagio: 0,
  custo_alimentacao: 0,
} as const;

export const LIMITES = {
  km_max_diferenca: 2000,
  valor_maximo: 99999.99,
  pacotes_maximo: 9999,
} as const;

export const ALERTA_LUCRO_BAIXO_PERCENT = 20;
