import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../src/services/api';
import { vehicleConfigSchema, VALORES_PADRAO, formatarMoeda } from '@rota-certa/shared';
import Toast from 'react-native-toast-message';

const TIPOS_VEICULO = [
  { value: 'moto', label: '🏍️ Moto', emoji: '🏍️' },
  { value: 'carro', label: '🚗 Carro', emoji: '🚗' },
  { value: 'van', label: '🚐 Van', emoji: '🚐' },
];

export default function ConfiguracaoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: existingConfig, isLoading } = useQuery({
    queryKey: ['vehicle'],
    queryFn: () => api.getVehicle(),
  });

  const [form, setForm] = useState({
    tipo_veiculo: 'carro' as string,
    autonomia_kml: '',
    preco_combustivel: '',
    custo_mei_mensal: String(VALORES_PADRAO.custo_mei_mensal),
    custo_seguro_mensal: '',
    reserva_manutencao: '',
    custo_documentacao: '',
    reserva_depreciacao: '',
    km_estimado_mes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (existingConfig) {
      setForm({
        tipo_veiculo: existingConfig.tipo_veiculo,
        autonomia_kml: String(existingConfig.autonomia_kml),
        preco_combustivel: String(existingConfig.preco_combustivel),
        custo_mei_mensal: String(existingConfig.custo_mei_mensal),
        custo_seguro_mensal: String(existingConfig.custo_seguro_mensal),
        reserva_manutencao: String(existingConfig.reserva_manutencao),
        custo_documentacao: String(existingConfig.custo_documentacao),
        reserva_depreciacao: String(existingConfig.reserva_depreciacao),
        km_estimado_mes: String(existingConfig.km_estimado_mes),
      });
    }
  }, [existingConfig]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Cálculo do total de custos fixos
  const totalCustosFixos =
    (parseFloat(form.custo_mei_mensal) || 0) +
    (parseFloat(form.custo_seguro_mensal) || 0) +
    (parseFloat(form.reserva_manutencao) || 0) +
    (parseFloat(form.custo_documentacao) || 0) +
    (parseFloat(form.reserva_depreciacao) || 0);

  const kmEstimado = parseFloat(form.km_estimado_mes) || 1;
  const custoFixoPorKm = totalCustosFixos / kmEstimado;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.autonomia_kml || parseFloat(form.autonomia_kml) <= 0) {
      newErrors.autonomia_kml = 'Informe a autonomia';
    }
    if (!form.preco_combustivel || parseFloat(form.preco_combustivel) <= 0) {
      newErrors.preco_combustivel = 'Informe o preço do combustível';
    }
    if (!form.km_estimado_mes || parseFloat(form.km_estimado_mes) <= 0) {
      newErrors.km_estimado_mes = 'Informe os KM estimados por mês';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return existingConfig ? api.updateVehicle(data) : api.createVehicle(data);
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Configuração salva!',
        text2: 'Seus dados foram atualizados com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['vehicle'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
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
      tipo_veiculo: form.tipo_veiculo,
      autonomia_kml: parseFloat(form.autonomia_kml),
      preco_combustivel: parseFloat(form.preco_combustivel),
      custo_mei_mensal: parseFloat(form.custo_mei_mensal) || 0,
      custo_seguro_mensal: parseFloat(form.custo_seguro_mensal) || 0,
      reserva_manutencao: parseFloat(form.reserva_manutencao) || 0,
      custo_documentacao: parseFloat(form.custo_documentacao) || 0,
      reserva_depreciacao: parseFloat(form.reserva_depreciacao) || 0,
      km_estimado_mes: parseFloat(form.km_estimado_mes),
    });
  };

  const InputField = ({
    label,
    field,
    placeholder,
    helperText,
    prefix,
  }: {
    label: string;
    field: string;
    placeholder: string;
    helperText?: string;
    prefix?: string;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
        {prefix && <Text className="text-gray-500 pl-3">{prefix}</Text>}
        <TextInput
          className="flex-1 p-3 text-gray-800"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={form[field as keyof typeof form]}
          onChangeText={(value) => updateField(field, value)}
        />
      </View>
      {errors[field] && <Text className="text-red-500 text-xs mt-1">{errors[field]}</Text>}
      {helperText && !errors[field] && <Text className="text-gray-400 text-xs mt-1">{helperText}</Text>}
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Tipo de Veículo */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">Tipo de Veículo</Text>
          <View className="flex-row gap-3">
            {TIPOS_VEICULO.map((tipo) => (
              <TouchableOpacity
                key={tipo.value}
                onPress={() => updateField('tipo_veiculo', tipo.value)}
                className={`flex-1 p-4 rounded-xl border-2 items-center ${
                  form.tipo_veiculo === tipo.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Text className="text-3xl mb-1">{tipo.emoji}</Text>
                <Text className={`font-semibold ${
                  form.tipo_veiculo === tipo.value ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {tipo.value.charAt(0).toUpperCase() + tipo.value.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dados do Veículo */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">Dados do Veículo</Text>
          <InputField
            label="Autonomia (KM/Litro)"
            field="autonomia_kml"
            placeholder="Ex: 12"
            helperText="Quantos KM seu veículo faz por litro?"
          />
          <InputField
            label="Preço do Combustível (R$/Litro)"
            field="preco_combustivel"
            placeholder="Ex: 5.50"
            prefix="R$ "
          />
          <InputField
            label="KM Estimados por Mês"
            field="km_estimado_mes"
            placeholder="Ex: 3000"
            helperText="Média de KM que você roda por mês"
          />
        </View>

        {/* Custos Fixos Mensais */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">Custos Fixos Mensais</Text>
          <InputField
            label="DAS-MEI"
            field="custo_mei_mensal"
            placeholder="75.00"
            prefix="R$ "
            helperText="Valor mensal do DAS (padrão: R$ 75,00)"
          />
          <InputField
            label="Seguro Veicular"
            field="custo_seguro_mensal"
            placeholder="0,00"
            prefix="R$ "
            helperText="Valor mensal do seguro (proporcional)"
          />
          <InputField
            label="Reserva para Manutenção"
            field="reserva_manutencao"
            placeholder="0,00"
            prefix="R$ "
            helperText="Valor mensal reservado para manutenção"
          />
          <InputField
            label="Documentação / IPVA Proporcional"
            field="custo_documentacao"
            placeholder="0,00"
            prefix="R$ "
            helperText="IPVA + licenciamento dividido por 12"
          />
          <InputField
            label="Reserva para Depreciação"
            field="reserva_depreciacao"
            placeholder="0,00"
            prefix="R$ "
            helperText="Valor mensal para troca futura do veículo"
          />
        </View>

        {/* Resumo dos Custos */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-bold text-blue-800 mb-2">Resumo dos Custos</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-blue-700">Total Custos Fixos/Mês</Text>
            <Text className="font-bold text-blue-800">{formatarMoeda(totalCustosFixos)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Custo Fixo por KM</Text>
            <Text className="font-bold text-blue-800">{formatarMoeda(custoFixoPorKm)}/km</Text>
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={mutation.isPending}
          className={`p-4 rounded-xl mb-8 ${mutation.isPending ? 'bg-gray-400' : 'bg-green-600'}`}
        >
          <Text className="text-white text-center font-bold text-lg">
            {mutation.isPending ? 'Salvando...' : '💾 Salvar Configuração'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
