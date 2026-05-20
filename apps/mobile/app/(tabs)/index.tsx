import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { formatarMoeda, formatarPercentual, formatarCustoPorKm } from '@rota-certa/shared';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const { data: dashboard, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  const { data: vehicleConfig } = useQuery({
    queryKey: ['vehicle'],
    queryFn: () => api.getVehicle(),
  });

  // Se não tem configuração do veículo, redireciona
  if (!isLoading && !vehicleConfig) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Text className="text-6xl mb-4">🚗</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
          Configure seu veículo
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Para começar a usar o Rota Certa, primeiro configure os dados do seu veículo e custos fixos.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/configuracao')}
          className="bg-green-600 px-8 py-4 rounded-xl"
        >
          <Text className="text-white font-bold text-lg">Configurar Agora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View className="p-4">
        {/* Saudação */}
        <View className="mb-4">
          <Text className="text-lg text-gray-600">
            Olá, {user?.user_metadata?.nome_completo || 'Motorista'}!
          </Text>
          <Text className="text-sm text-gray-400">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Cards de Indicadores */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {/* Sobra Limpa */}
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm">
            <Text className="text-gray-500 text-sm mb-1">Sobra Limpa Hoje</Text>
            <Text className={`text-2xl font-bold ${(dashboard?.sobra_limpa_hoje ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatarMoeda(dashboard?.sobra_limpa_hoje ?? 0)}
            </Text>
          </View>

          {/* Lucro Real */}
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm">
            <Text className="text-gray-500 text-sm mb-1">Lucro Real Hoje</Text>
            <Text className={`text-2xl font-bold ${(dashboard?.lucro_real_hoje ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatarMoeda(dashboard?.lucro_real_hoje ?? 0)}
            </Text>
          </View>

          {/* Custo por KM */}
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm">
            <Text className="text-gray-500 text-sm mb-1">Custo Real/KM</Text>
            <Text className="text-2xl font-bold text-blue-600">
              {formatarCustoPorKm(dashboard?.custo_real_por_km ?? 0)}
            </Text>
          </View>

          {/* Margem */}
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm">
            <Text className="text-gray-500 text-sm mb-1">Margem de Lucro</Text>
            <Text className={`text-2xl font-bold ${(dashboard?.margem_lucro_percent ?? 0) >= 20 ? 'text-green-600' : 'text-red-600'}`}>
              {formatarPercentual(dashboard?.margem_lucro_percent ?? 0)}
            </Text>
          </View>
        </View>

        {/* Alerta de Lucro Baixo */}
        {dashboard?.alerta_lucro_baixo && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-800 font-bold mb-1">⚠️ Atenção!</Text>
            <Text className="text-red-700">
              Seu lucro real está abaixo de 20% do faturamento. Revise seus custos ou rotas.
            </Text>
          </View>
        )}

        {/* Resumo do Mês */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Resumo do Mês</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Faturado</Text>
              <Text className="font-semibold text-gray-800">
                {formatarMoeda(dashboard?.resumo_mes_atual?.total_faturado ?? 0)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Gasto</Text>
              <Text className="font-semibold text-red-600">
                {formatarMoeda(dashboard?.resumo_mes_atual?.total_gasto ?? 0)}
              </Text>
            </View>
            <View className="border-t border-gray-100 pt-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-800 font-bold">Lucro Real</Text>
                <Text className={`font-bold ${(dashboard?.resumo_mes_atual?.lucro_real_mes ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(dashboard?.resumo_mes_atual?.lucro_real_mes ?? 0)}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">KM Rodados</Text>
              <Text className="font-semibold text-gray-800">
                {(dashboard?.resumo_mes_atual?.total_km ?? 0).toLocaleString('pt-BR')} km
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Média Lucro/Dia</Text>
              <Text className="font-semibold text-gray-800">
                {formatarMoeda(dashboard?.resumo_mes_atual?.media_lucro_diario ?? 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <TouchableOpacity
          onPress={() => router.push('/lancamento')}
          className="bg-green-600 p-4 rounded-xl mb-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            ➕ Registrar Lançamento de Hoje
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/configuracao')}
          className="bg-gray-200 p-4 rounded-xl mb-4"
        >
          <Text className="text-gray-700 text-center font-semibold">
            ⚙️ Configurar Veículo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={signOut}
          className="p-4 mb-8"
        >
          <Text className="text-red-500 text-center">Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
