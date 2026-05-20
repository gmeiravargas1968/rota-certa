import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#16a34a',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'Rota Certa',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="lancamento"
        options={{
          title: 'Novo Lançamento',
          headerTitle: 'Novo Lançamento',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          headerTitle: 'Histórico',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📋</Text>,
        }}
      />
    </Tabs>
  );
}
