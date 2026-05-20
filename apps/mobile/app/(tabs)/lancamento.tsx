import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { calcularReceitaBruta, calcularCustosDiretos, calcularSobraLimpa, formatarMoeda } from '@rota-certa/shared';
import Toast from 'react-native-toast-message';

export default function LancamentoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const hoje = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    data: hoje,
    km_inicial: '',
    km_final: '',
    valor_diaria: '',
    qtd_pacotes: '',
    valor_por_pacote: '',
    ajuda_custo: '',
    custo_combustivel: '',
    custo_pedagio: '',
    custo_alimentacao: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Cálculos em tempo real
  const valorDiaria = parseFloat(form.valor_diaria) || 0;
  const qtdPacotes = parseInt(form.qtd_pacotes) || 0;
  const valorPorPacote = parseFloat(form.valor_por_pacote) || 0;
  const ajudaCusto = parseFloat(form.ajuda_custo) || 0;
  const custoCombustivel = parseFloat(form.custo_combustivel) || 0;
  const custoPedagio = parseFloat(form.custo_pedagio) || 0;
  const custoAlimentacao = parseFloat(form.custo_alimentacao) || 0;
  const kmInicial = parseFloat(form.km_inicial) || 0;
  const kmFinal = parseFloat(form.km_final) || 0;

  const receitaBruta = calcularReceitaBruta({
    valorDiaria, qtdPacotes, valorPorPacote, ajudaCusto,
  });
  const custosDiretos = calcularCustosDiretos({
    custoCombustivel, custoPedagio, custoAlimentacao,
  });
  const sobraLimpa = calcularSobraLimpa(receitaBruta, custosDiretos);
  const totalKm = kmFinal > kmInicial ? kmFinal - kmInicial : 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.km_inicial) newErrors.km_inicial = 'Obrigatório';
    if (!form.km_final) newErrors.km_final = 'Obrigatório';
    if (kmFinal <= kmInicial && kmFinal > 0) {
      newErrors.km_final = 'KM Final deve ser maior que KM Inicial';
    }
    if (!form.custo_combustivel) newErrors.custo_combustivel = 'Obrigatório';
    if (valorDiaria === 0 && qtdPacotes === 0) {
      newErrors.valor_diaria = 'Informe a diária ou pacotes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) => api.createLancamento(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Lançamento salvo!',
        text2: 'Seus dados foram registrados com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      router.push('/historico');
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: error.message,
      });
    },
  });

  const handleSave = () => {
    if (!validate()) return;

    mutation.mutate({
      data: form.data,
      km_inicial: kmInicial,
      km_final: kmFinal,
      valor_diaria: valorDiaria,
      qtd_pacotes: qtdPacotes,
      valor_por_pacote: valorPorPacote,
      ajuda_custo: ajudaCusto,
      custo_combustivel: custoCombustivel,
      custo_pedagio: custoPedagio,
      custo_alimentacao: custoAlimentacao,
    });
  };

  const InputField = ({
    label,
    field,
    placeholder,
    keyboardType = 'numeric',
    prefix,
  }: {
    label: string;
    field: string;
    placeholder: string;
    keyboardType?: 'numeric' | 'default';
    prefix?: string;
  }) => (
    <View className="mb-3">
      <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
        {prefix && <Text className="text-gray-500 pl-3">{prefix}</Text>}
        <TextInput
          className="flex-1 p-3 text-gray-800"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
          value={form[field as keyof typeof form]}
          onChangeText={(value) => updateField(field, value)}
        />
      </View>
      {errors[field] && <Text className="text-red-500 text-xs mt-1">{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* Quilometragem */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">🛣️ Quilometragem</Text>
            <InputField label="KM Inicial" field="km_inicial" placeholder="Ex: 50000" />
            <InputField label="KM Final" field="km_final" placeholder="Ex: 50150" />
            {totalKm > 0 && (
              <View className="bg-blue-50 p-3 rounded-lg">
                <Text className="text-blue-800 font-semibold text-center">
                  Total: {totalKm.toLocaleString('pt-BR')} km
                </Text>
              </View>
            )}
          </View>

          {/* Faturamento */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">💰 Faturamento</Text>
            <InputField label="Valor da Diária" field="valor_diaria" placeholder="0,00" prefix="R$ " />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <InputField label="Qtd. Pacotes" field="qtd_pacotes" placeholder="0" />
              </View>
              <View className="flex-1">
                <InputField label="Valor por Pacote" field="valor_por_pacote" placeholder="0,00" prefix="R$ " />
              </View>
            </View>
            <InputField label="Ajuda de Custo / Pedágio Reembolsado" field="ajuda_custo" placeholder="0,00" prefix="R$ " />
            <View className="bg-green-50 p-3 rounded-lg">
              <Text className="text-green-800 font-semibold text-center">
                Receita Bruta: {formatarMoeda(receitaBruta)}
              </Text>
            </View>
          </View>

          {/* Custos Diretos */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">💸 Custos Diretos</Text>
            <InputField label="Combustível" field="custo_combustivel" placeholder="0,00" prefix="R$ " />
            <InputField label="Pedágios Não Reembolsados" field="custo_pedagio" placeholder="0,00" prefix="R$ " />
            <InputField label="Alimentação" field="custo_alimentacao" placeholder="0,00" prefix="R$ " />
            <View className="bg-red-50 p-3 rounded-lg">
              <Text className="text-red-800 font-semibold text-center">
                Total Custos: {formatarMoeda(custosDiretos)}
              </Text>
            </View>
          </View>

          {/* Resumo */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">📊 Resumo do Dia</Text>
            <View className="items-center py-4">
              <Text className="text-gray-600 mb-1">Sobra Limpa (A - B)</Text>
              <Text className={`text-4xl font-bold ${sobraLimpa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarMoeda(sobraLimpa)}
              </Text>
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={mutation.isPending}
            className={`p-4 rounded-xl mb-8 ${mutation.isPending ? 'bg-gray-400' : 'bg-green-600'}`}
          >
            <Text className="text-white text-center font-bold text-lg">
              {mutation.isPending ? 'Salvando...' : '💾 Salvar Lançamento'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
