import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha email e senha',
      });
      return;
    }

    if (isSignUp && !nome) {
      Toast.show({
        type: 'error',
        text1: 'Nome obrigatório',
        text2: 'Informe seu nome completo',
      });
      return;
    }

    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password, nome)
      : await signIn(email, password);

    setLoading(false);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message,
      });
    } else {
      if (isSignUp) {
        Toast.show({
          type: 'success',
          text1: 'Conta criada!',
          text2: 'Verifique seu email para confirmar o cadastro.',
        });
      }
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-green-600"
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo / Título */}
        <View className="items-center mb-10">
          <Text className="text-6xl mb-4">🛣️</Text>
          <Text className="text-3xl font-bold text-white">Rota Certa</Text>
          <Text className="text-green-200 text-center mt-2">
            Controle financeiro para motoristas agregados
          </Text>
        </View>

        {/* Formulário */}
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </Text>

          {isSignUp && (
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-1">Nome Completo</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-800"
                placeholder="Seu nome"
                placeholderTextColor="#9ca3af"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>
          )}

          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-1">Email</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-800"
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-1">Senha</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-800"
              placeholder="Sua senha"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`p-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-green-600'}`}
          >
            <Text className="text-white text-center font-bold text-lg">
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            className="mt-4"
          >
            <Text className="text-green-600 text-center">
              {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
