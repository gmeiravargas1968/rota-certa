import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { formatarMoeda, formatarData, formatarKm, formatarPercentual } from '@rota-certa/shared';
import Toast from 'react-native-toast-message';

export default function DetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lancamento, isLoading } = useQuery({
    queryKey: ['lancamento', id],
    queryFn: () => api.getLancamento(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteLancamento(id!),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Lançamento excluído',
      });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir',
        text2: error.message,
      });
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este lançamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </View>
    );
  }

  if (!lancamento) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Lançamento não encontrado</Text>
      </View>
    );
  }

  const InfoRow = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-gray-600">{label}</Text>
      <Text className={`font-semibold ${color || 'text-gray-800'}`}>{value}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Resumo Principal */}
        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm items-center">
          <Text className="text-gray-500 mb-1">{formatarData(lancamento.data)}</Text>
          <Text className={`text-4xl font-bold ${Number(lancamento.sobra_limpa) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatarMoeda(Number(lancamento.sobra_limpa))}
          </Text>
          <Text className="text-gray-500 mt-1">Sobra Limpa do Dia</Text>
        </View>

        {/* Quilometragem */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">🛣️ Quilometragem</Text>
          <InfoRow label="KM Inicial" value={Number(lancamento.km_inicial).toLocaleString('pt-BR')} />
          <InfoRow label="KM Final" value={Number(lancamento.km_final).toLocaleString('pt-BR')} />
          <InfoRow label="Total Rodado" value={formatarKm(Number(lancamento.total_km))} />
        </View>

        {/* Faturamento */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">💰 Faturamento</Text>
          <InfoRow label="Diária" value={formatarMoeda(Number(lancamento.valor_diaria))} />
          <InfoRow label="Pacotes" value={`${lancamento.qtd_pacotes} × ${formatarMoeda(Number(lancamento.valor_por_pacote))}`} />
          <InfoRow label="Ajuda de Custo" value={formatarMoeda(Number(lancamento.ajuda_custo))} />
          <InfoRow label="Receita Bruta (A)" value={formatarMoeda(Number(lancamento.receita_bruta))} color="text-green-600" />
        </View>

        {/* Custos */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">💸 Custos Diretos</Text>
          <InfoRow label="Combustível" value={formatarMoeda(Number(lancamento.custo_combustivel))} />
          <InfoRow label="Pedágios" value={formatarMoeda(Number(lancamento.custo_pedagio))} />
          <InfoRow label="Alimentação" value={formatarMoeda(Number(lancamento.custo_alimentacao))} />
          <InfoRow label="Total Custos (B)" value={formatarMoeda(Number(lancamento.custos_diretos))} color="text-red-600" />
        </View>

        {/* Ações */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 bg-red-50 border border-red-200 p-4 rounded-xl"
          >
            <Text className="text-red-600 text-center font-bold">
              {deleteMutation.isPending ? 'Excluindo...' : '🗑️ Excluir'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
