import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { formatarMoeda, formatarData, formatarKm } from '@rota-certa/shared';

interface Lancamento {
  id: string;
  data: string;
  total_km: number;
  receita_bruta: number;
  sobra_limpa: number;
  custos_diretos: number;
}

export default function HistoricoScreen() {
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['lancamentos'],
    queryFn: () => api.getLancamentos({ limit: '50' }),
  });

  const lancamentos: Lancamento[] = data?.items || [];

  // Resumo do mês
  const resumoMes = lancamentos.reduce(
    (acc, l) => ({
      totalFaturado: acc.totalFaturado + Number(l.receita_bruta),
      totalSobra: acc.totalSobra + Number(l.sobra_limpa),
      totalKm: acc.totalKm + Number(l.total_km),
      count: acc.count + 1,
    }),
    { totalFaturado: 0, totalSobra: 0, totalKm: 0, count: 0 }
  );

  const renderItem = ({ item }: { item: Lancamento }) => (
    <TouchableOpacity
      onPress={() => router.push(`/detalhe/${item.id}`)}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-800 font-bold">{formatarData(item.data)}</Text>
        <Text className={`font-bold text-lg ${Number(item.sobra_limpa) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatarMoeda(Number(item.sobra_limpa))}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-500 text-sm">{formatarKm(Number(item.total_km))}</Text>
        <Text className="text-gray-500 text-sm">
          Receita: {formatarMoeda(Number(item.receita_bruta))}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Resumo do Mês */}
      <View className="bg-white p-4 border-b border-gray-100">
        <Text className="text-lg font-bold text-gray-800 mb-2">Resumo do Mês</Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-gray-500 text-xs">Faturamento</Text>
            <Text className="font-semibold text-gray-800">{formatarMoeda(resumoMes.totalFaturado)}</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Sobra Limpa</Text>
            <Text className={`font-semibold ${resumoMes.totalSobra >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatarMoeda(resumoMes.totalSobra)}
            </Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">KM Total</Text>
            <Text className="font-semibold text-gray-800">{formatarKm(resumoMes.totalKm)}</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Dias</Text>
            <Text className="font-semibold text-gray-800">{resumoMes.count}</Text>
          </View>
        </View>
      </View>

      {/* Lista de Lançamentos */}
      <FlatList
        data={lancamentos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerClassName="p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-gray-500 text-lg">Nenhum lançamento encontrado</Text>
            <Text className="text-gray-400 text-center mt-2">
              Registre seu primeiro dia de trabalho na aba "Novo Lançamento"
            </Text>
          </View>
        }
      />
    </View>
  );
}
