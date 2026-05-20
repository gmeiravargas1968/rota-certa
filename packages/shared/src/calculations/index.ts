/**
 * ROTA CERTA — Fórmulas de Negócio
 * Todas as funções são puras e sem efeitos colaterais.
 * Compartilhadas entre mobile e API.
 */

// RN01: Total KM Rodados
export function calcularTotalKm(kmInicial: number, kmFinal: number): number {
  if (kmFinal <= kmInicial) {
    throw new Error('KM Final deve ser maior que KM Inicial');
  }
  return kmFinal - kmInicial;
}

// RN02: Faturamento Bruto Diário (A)
export function calcularReceitaBruta(params: {
  valorDiaria: number;
  qtdPacotes: number;
  valorPorPacote: number;
  ajudaCusto: number;
}): number {
  return (
    params.valorDiaria +
    params.qtdPacotes * params.valorPorPacote +
    params.ajudaCusto
  );
}

// RN03: Custos Diretos Diários (B)
export function calcularCustosDiretos(params: {
  custoCombustivel: number;
  custoPedagio: number;
  custoAlimentacao: number;
}): number {
  return (
    params.custoCombustivel + params.custoPedagio + params.custoAlimentacao
  );
}

// Sobra Limpa (A - B)
export function calcularSobraLimpa(
  receitaBruta: number,
  custosDiretos: number
): number {
  return receitaBruta - custosDiretos;
}

// Total de Custos Fixos Mensais
export function calcularTotalCustosFixosMensais(config: {
  custoMeiMensal: number;
  custoSeguroMensal: number;
  reservaManutencao: number;
  custoDocumentacao: number;
  reservaDepreciacao: number;
}): number {
  return (
    config.custoMeiMensal +
    config.custoSeguroMensal +
    config.reservaManutencao +
    config.custoDocumentacao +
    config.reservaDepreciacao
  );
}

// RN04: Custo Fixo Proporcional por KM
export function calcularCustoFixoPorKm(
  totalCustosFixosMensais: number,
  kmEstimadoMes: number
): number {
  if (kmEstimadoMes <= 0) {
    throw new Error('KM estimado por mês deve ser maior que zero');
  }
  return totalCustosFixosMensais / kmEstimadoMes;
}

// RN05: Custo Real por KM Rodado
export function calcularCustoRealPorKm(
  custoFixoPorKm: number,
  precoCombustivel: number,
  autonomiaKml: number
): number {
  if (autonomiaKml <= 0) {
    throw new Error('Autonomia deve ser maior que zero');
  }
  return custoFixoPorKm + precoCombustivel / autonomiaKml;
}

// RN06: Lucro Real Líquido da Rota
export function calcularLucroReal(
  sobraLimpa: number,
  totalKm: number,
  custoFixoPorKm: number
): number {
  return sobraLimpa - totalKm * custoFixoPorKm;
}

// Margem de Lucro (%)
export function calcularMargemLucro(
  lucroReal: number,
  receitaBruta: number
): number {
  if (receitaBruta <= 0) return 0;
  return (lucroReal / receitaBruta) * 100;
}

// Alerta de Lucro Baixo (< 20% do faturamento)
export function isAlertaLucroBaixo(
  lucroReal: number,
  receitaBruta: number
): boolean {
  return lucroReal < receitaBruta * 0.2;
}

// Função auxiliar: calcular todos os indicadores de uma vez
export function calcularIndicadores(
  lancamento: {
    valor_diaria: number;
    qtd_pacotes: number;
    valor_por_pacote: number;
    ajuda_custo: number;
    custo_combustivel: number;
    custo_pedagio: number;
    custo_alimentacao: number;
    km_inicial: number;
    km_final: number;
  },
  config: {
    custo_mei_mensal: number;
    custo_seguro_mensal: number;
    reserva_manutencao: number;
    custo_documentacao: number;
    reserva_depreciacao: number;
    km_estimado_mes: number;
    preco_combustivel: number;
    autonomia_kml: number;
  }
) {
  const totalKm = calcularTotalKm(lancamento.km_inicial, lancamento.km_final);

  const receitaBruta = calcularReceitaBruta({
    valorDiaria: lancamento.valor_diaria,
    qtdPacotes: lancamento.qtd_pacotes,
    valorPorPacote: lancamento.valor_por_pacote,
    ajudaCusto: lancamento.ajuda_custo,
  });

  const custosDiretos = calcularCustosDiretos({
    custoCombustivel: lancamento.custo_combustivel,
    custoPedagio: lancamento.custo_pedagio,
    custoAlimentacao: lancamento.custo_alimentacao,
  });

  const sobraLimpa = calcularSobraLimpa(receitaBruta, custosDiretos);

  const totalCustosFixos = calcularTotalCustosFixosMensais({
    custoMeiMensal: config.custo_mei_mensal,
    custoSeguroMensal: config.custo_seguro_mensal,
    reservaManutencao: config.reserva_manutencao,
    custoDocumentacao: config.custo_documentacao,
    reservaDepreciacao: config.reserva_depreciacao,
  });

  const custoFixoPorKm = calcularCustoFixoPorKm(
    totalCustosFixos,
    config.km_estimado_mes
  );

  const custoRealPorKm = calcularCustoRealPorKm(
    custoFixoPorKm,
    config.preco_combustivel,
    config.autonomia_kml
  );

  const lucroReal = calcularLucroReal(sobraLimpa, totalKm, custoFixoPorKm);
  const margemLucro = calcularMargemLucro(lucroReal, receitaBruta);
  const alertaLucroBaixo = isAlertaLucroBaixo(lucroReal, receitaBruta);

  return {
    total_km: Math.round(totalKm * 100) / 100,
    receita_bruta: Math.round(receitaBruta * 100) / 100,
    custos_diretos: Math.round(custosDiretos * 100) / 100,
    sobra_limpa: Math.round(sobraLimpa * 100) / 100,
    custo_fixo_por_km: Math.round(custoFixoPorKm * 100) / 100,
    custo_real_por_km: Math.round(custoRealPorKm * 100) / 100,
    lucro_real: Math.round(lucroReal * 100) / 100,
    margem_lucro: Math.round(margemLucro * 100) / 100,
    alerta_lucro_baixo: alertaLucroBaixo,
  };
}
