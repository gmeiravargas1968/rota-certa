// Formatação de moeda BRL
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formatação de data pt-BR
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Formatação de data por extenso
export function formatarDataExtenso(data: string): string {
  const date = new Date(data + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Formatação de quilometragem
export function formatarKm(km: number): string {
  return `${km.toLocaleString('pt-BR')} km`;
}

// Formatação de percentual
export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

// Formatação de custo por KM
export function formatarCustoPorKm(valor: number): string {
  return `${formatarMoeda(valor)}/km`;
}
