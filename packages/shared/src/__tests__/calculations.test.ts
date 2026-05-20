import { describe, it, expect } from 'vitest';
import {
  calcularTotalKm,
  calcularReceitaBruta,
  calcularCustosDiretos,
  calcularSobraLimpa,
  calcularTotalCustosFixosMensais,
  calcularCustoFixoPorKm,
  calcularCustoRealPorKm,
  calcularLucroReal,
  calcularMargemLucro,
  isAlertaLucroBaixo,
  calcularIndicadores,
} from '../calculations';

describe('RN01 - calcularTotalKm', () => {
  it('calcula KM corretamente', () => {
    expect(calcularTotalKm(100, 250)).toBe(150);
  });

  it('lança erro se KM Final <= KM Inicial', () => {
    expect(() => calcularTotalKm(250, 100)).toThrow('KM Final deve ser maior que KM Inicial');
    expect(() => calcularTotalKm(100, 100)).toThrow('KM Final deve ser maior que KM Inicial');
  });
});

describe('RN02 - calcularReceitaBruta', () => {
  it('calcula receita com diária e pacotes', () => {
    expect(
      calcularReceitaBruta({
        valorDiaria: 220,
        qtdPacotes: 30,
        valorPorPacote: 0.8,
        ajudaCusto: 0,
      })
    ).toBe(244);
  });

  it('calcula receita com ajuda de custo', () => {
    expect(
      calcularReceitaBruta({
        valorDiaria: 220,
        qtdPacotes: 0,
        valorPorPacote: 0,
        ajudaCusto: 50,
      })
    ).toBe(270);
  });

  it('retorna 0 quando tudo é zero', () => {
    expect(
      calcularReceitaBruta({
        valorDiaria: 0,
        qtdPacotes: 0,
        valorPorPacote: 0,
        ajudaCusto: 0,
      })
    ).toBe(0);
  });
});

describe('RN03 - calcularCustosDiretos', () => {
  it('soma todos os custos', () => {
    expect(
      calcularCustosDiretos({
        custoCombustivel: 80,
        custoPedagio: 15,
        custoAlimentacao: 25,
      })
    ).toBe(120);
  });
});

describe('calcularSobraLimpa', () => {
  it('calcula sobra limpa (A - B)', () => {
    expect(calcularSobraLimpa(244, 120)).toBe(124);
  });

  it('retorna negativo quando custos > receita', () => {
    expect(calcularSobraLimpa(100, 150)).toBe(-50);
  });
});

describe('calcularTotalCustosFixosMensais', () => {
  it('soma todos os custos fixos', () => {
    expect(
      calcularTotalCustosFixosMensais({
        custoMeiMensal: 75,
        custoSeguroMensal: 100,
        reservaManutencao: 80,
        custoDocumentacao: 50,
        reservaDepreciacao: 100,
      })
    ).toBe(405);
  });
});

describe('RN04 - calcularCustoFixoPorKm', () => {
  it('divide custos fixos pelos KM estimados', () => {
    expect(calcularCustoFixoPorKm(405, 3000)).toBe(0.135);
  });

  it('lança erro se KM estimado for zero', () => {
    expect(() => calcularCustoFixoPorKm(405, 0)).toThrow(
      'KM estimado por mês deve ser maior que zero'
    );
  });
});

describe('RN05 - calcularCustoRealPorKm', () => {
  it('combina custo fixo e combustível', () => {
    // custo_fixo: 0.135, combustível: 5.50/12 = 0.4583...
    const resultado = calcularCustoRealPorKm(0.135, 5.5, 12);
    expect(resultado).toBeCloseTo(0.5933, 3);
  });

  it('lança erro se autonomia for zero', () => {
    expect(() => calcularCustoRealPorKm(0.135, 5.5, 0)).toThrow(
      'Autonomia deve ser maior que zero'
    );
  });
});

describe('RN06 - calcularLucroReal', () => {
  it('calcula lucro real da rota', () => {
    // sobra_limpa: 124, total_km: 150, custo_fixo_km: 0.135
    // lucro_real = 124 - (150 * 0.135) = 124 - 20.25 = 103.75
    expect(calcularLucroReal(124, 150, 0.135)).toBeCloseTo(103.75, 2);
  });

  it('retorna negativo quando custos fixos superam sobra', () => {
    expect(calcularLucroReal(20, 500, 0.5)).toBe(-230);
  });
});

describe('calcularMargemLucro', () => {
  it('calcula percentual', () => {
    expect(calcularMargemLucro(100, 250)).toBe(40);
  });

  it('retorna 0 quando receita é zero', () => {
    expect(calcularMargemLucro(100, 0)).toBe(0);
  });
});

describe('isAlertaLucroBaixo', () => {
  it('retorna true quando lucro < 20% da receita', () => {
    expect(isAlertaLucroBaixo(10, 200)).toBe(true);
  });

  it('retorna false quando lucro >= 20% da receita', () => {
    expect(isAlertaLucroBaixo(50, 200)).toBe(false);
  });
});

describe('calcularIndicadores - integração', () => {
  const config = {
    custo_mei_mensal: 75,
    custo_seguro_mensal: 100,
    reserva_manutencao: 80,
    custo_documentacao: 50,
    reserva_depreciacao: 100,
    km_estimado_mes: 3000,
    preco_combustivel: 5.5,
    autonomia_kml: 12,
  };

  const lancamento = {
    valor_diaria: 220,
    qtd_pacotes: 30,
    valor_por_pacote: 0.8,
    ajuda_custo: 0,
    custo_combustivel: 68.75,
    custo_pedagio: 0,
    custo_alimentacao: 20,
    km_inicial: 50000,
    km_final: 50150,
  };

  it('calcula todos os indicadores corretamente', () => {
    const resultado = calcularIndicadores(lancamento, config);

    expect(resultado.total_km).toBe(150);
    expect(resultado.receita_bruta).toBe(244);
    expect(resultado.custos_diretos).toBe(88.75);
    expect(resultado.sobra_limpa).toBe(155.25);
    expect(resultado.custo_fixo_por_km).toBe(0.14); // arredondado de 0.135
    expect(resultado.custo_real_por_km).toBe(0.59); // arredondado de 0.5933
    expect(resultado.lucro_real).toBeCloseTo(135, 0);
    expect(resultado.margem_lucro).toBeCloseTo(55.3, 0);
    expect(resultado.alerta_lucro_baixo).toBe(false);
  });
});
