import { z } from 'zod';
import { TIPOS_VEICULO, VALORES_PADRAO } from '../constants';

// Schema: Configuração do Veículo
export const vehicleConfigSchema = z.object({
  tipo_veiculo: z.enum(TIPOS_VEICULO, {
    errorMap: () => ({ message: 'Tipo de veículo inválido' }),
  }),
  autonomia_kml: z
    .number({ invalid_type_error: 'Autonomia deve ser um número' })
    .positive('Autonomia deve ser maior que zero')
    .max(100, 'Autonomia máxima: 100 km/l'),
  preco_combustivel: z
    .number({ invalid_type_error: 'Preço deve ser um número' })
    .positive('Preço deve ser maior que zero')
    .max(50, 'Preço máximo: R$ 50,00/l'),
  custo_mei_mensal: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.custo_mei_mensal),
  custo_seguro_mensal: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.custo_seguro_mensal),
  reserva_manutencao: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.reserva_manutencao),
  custo_documentacao: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.custo_documentacao),
  reserva_depreciacao: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.reserva_depreciacao),
  km_estimado_mes: z
    .number({ invalid_type_error: 'KM deve ser um número' })
    .positive('KM estimado deve ser maior que zero')
    .max(20000, 'KM máximo: 20.000/mês'),
});

export type VehicleConfigInput = z.infer<typeof vehicleConfigSchema>;

// Schema base do Lançamento (sem refine, para uso com .partial())
export const lancamentoBaseSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  km_inicial: z
    .number({ invalid_type_error: 'KM Inicial deve ser um número' })
    .min(0, 'KM Inicial não pode ser negativo'),
  km_final: z
    .number({ invalid_type_error: 'KM Final deve ser um número' })
    .positive('KM Final deve ser maior que zero'),
  valor_diaria: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.valor_diaria),
  qtd_pacotes: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa')
    .default(VALORES_PADRAO.qtd_pacotes),
  valor_por_pacote: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.valor_por_pacote),
  ajuda_custo: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.ajuda_custo),
  custo_combustivel: z
    .number({ invalid_type_error: 'Custo deve ser um número' })
    .min(0, 'Custo não pode ser negativo'),
  custo_pedagio: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.custo_pedagio),
  custo_alimentacao: z
    .number()
    .min(0, 'Valor não pode ser negativo')
    .default(VALORES_PADRAO.custo_alimentacao),
});

// Schema: Lançamento Diário (com validação cruzada)
export const lancamentoSchema = lancamentoBaseSchema.refine(
  (data) => data.km_final > data.km_inicial,
  {
    message: 'KM Final deve ser maior que KM Inicial',
    path: ['km_final'],
  }
);

// Schema para atualização parcial
export const lancamentoUpdateSchema = lancamentoBaseSchema.partial();

export type LancamentoInput = z.infer<typeof lancamentoSchema>;
export type LancamentoUpdateInput = z.infer<typeof lancamentoUpdateSchema>;

// Schema: Filtro de período
export const periodFilterSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PeriodFilter = z.infer<typeof periodFilterSchema>;
