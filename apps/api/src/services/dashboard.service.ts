import { supabase } from '../config/supabase';
import {
  calcularTotalCustosFixosMensais,
  calcularCustoFixoPorKm,
  calcularCustoRealPorKm,
  calcularLucroReal,
  calcularMargemLucro,
  isAlertaLucroBaixo,
  DashboardMetrics,
  TendenciaDia,
} from '@rota-certa/shared';

export async function getDashboard(
  userId: string,
  periodDays = 30
): Promise<DashboardMetrics> {
  // Buscar configuração do veículo
  const { data: config, error: configError } = await supabase
    .from('configuracao_veiculo')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (configError || !config) {
    throw new Error('Configuração do veículo não encontrada');
  }

  // Calcular custos fixos
  const totalCustosFixos = calcularTotalCustosFixosMensais({
    custoMeiMensal: config.custo_mei_mensal,
    custoSeguroMensal: config.custo_seguro_mensal,
    reservaManutencao: config.reserva_manutencao,
    custoDocumentacao: config.custo_documentacao,
    reservaDepreciacao: config.reserva_depreciacao,
  });

  const custoFixoPorKm = calcularCustoFixoPorKm(totalCustosFixos, config.km_estimado_mes);
  const custoRealPorKm = calcularCustoRealPorKm(
    custoFixoPorKm,
    config.preco_combustivel,
    config.autonomia_kml
  );

  // Buscar lançamentos do período
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - periodDays);

  const { data: lancamentos, error: lancError } = await supabase
    .from('lancamentos_diarios')
    .select('*')
    .eq('user_id', userId)
    .gte('data', dataInicio.toISOString().split('T')[0])
    .order('data', { ascending: true });

  if (lancError) throw lancError;

  // Calcular tendência dos últimos 30 dias
  const tendencia30dias: TendenciaDia[] = (lancamentos || []).map((l) => {
    const lucroReal = calcularLucroReal(l.sobra_limpa, l.total_km, custoFixoPorKm);
    return {
      data: l.data,
      lucro_real: Math.round(lucroReal * 100) / 100,
    };
  });

  // Dados de hoje
  const hoje = new Date().toISOString().split('T')[0];
  const lancamentoHoje = lancamentos?.find((l) => l.data === hoje);

  let sobraLimpaHoje = 0;
  let lucroRealHoje = 0;
  let margemLucroHoje = 0;
  let alertaLucroBaixo = false;

  if (lancamentoHoje) {
    sobraLimpaHoje = lancamentoHoje.sobra_limpa;
    lucroRealHoje = calcularLucroReal(
      lancamentoHoje.sobra_limpa,
      lancamentoHoje.total_km,
      custoFixoPorKm
    );
    margemLucroHoje = calcularMargemLucro(lucroRealHoje, lancamentoHoje.receita_bruta);
    alertaLucroBaixo = isAlertaLucroBaixo(lucroRealHoje, lancamentoHoje.receita_bruta);
  }

  // Resumo do mês atual
  const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
  const lancamentosMes = (lancamentos || []).filter((l) =>
    l.data.startsWith(mesAtual)
  );

  const totalFaturado = lancamentosMes.reduce((sum, l) => sum + Number(l.receita_bruta), 0);
  const totalGasto = lancamentosMes.reduce(
    (sum, l) => sum + Number(l.custos_diretos) + Number(l.total_km) * custoFixoPorKm,
    0
  );
  const lucroRealMes = lancamentosMes.reduce(
    (sum, l) => sum + calcularLucroReal(l.sobra_limpa, l.total_km, custoFixoPorKm),
    0
  );
  const totalKmMes = lancamentosMes.reduce((sum, l) => sum + Number(l.total_km), 0);
  const diasComLancamento = lancamentosMes.length || 1;

  return {
    sobra_limpa_hoje: Math.round(sobraLimpaHoje * 100) / 100,
    lucro_real_hoje: Math.round(lucroRealHoje * 100) / 100,
    custo_real_por_km: Math.round(custoRealPorKm * 100) / 100,
    margem_lucro_percent: Math.round(margemLucroHoje * 100) / 100,
    alerta_lucro_baixo: alertaLucroBaixo,
    tendencia_30_dias: tendencia30dias,
    resumo_mes_atual: {
      total_faturado: Math.round(totalFaturado * 100) / 100,
      total_gasto: Math.round(totalGasto * 100) / 100,
      lucro_real_mes: Math.round(lucroRealMes * 100) / 100,
      total_km: Math.round(totalKmMes),
      media_lucro_diario: Math.round((lucroRealMes / diasComLancamento) * 100) / 100,
    },
  };
}
