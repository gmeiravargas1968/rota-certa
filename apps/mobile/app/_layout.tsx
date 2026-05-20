import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import Toast from 'react-native-toast-message';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = segments[0] === 'login';

    if (!session && !isAuthRoute) {
      // Usuário não logado tentando acessar rota protegida
      router.replace('/login');
    } else if (session && isAuthRoute) {
      // Usuário logado tentando acessar login
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen
              name="configuracao"
              options={{
                headerShown: true,
                title: 'Configuração do Veículo',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#16a34a' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="detalhe/[id]"
              options={{
                headerShown: true,
                title: 'Detalhe do Lançamento',
                headerStyle: { backgroundColor: '#16a34a' },
                headerTintColor: '#fff',
              }}
            />
          </Stack>
          <Toast />
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
