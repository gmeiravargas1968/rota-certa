import { supabase } from './supabase';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

export const api = {
  // Vehicle
  getVehicle: () => request<any>('/vehicle'),
  createVehicle: (data: any) => request<any>('/vehicle', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (data: any) => request<any>('/vehicle', { method: 'PUT', body: JSON.stringify(data) }),

  // Lancamentos
  getLancamentos: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/lancamentos${query}`);
  },
  getLancamento: (id: string) => request<any>(`/lancamentos/${id}`),
  createLancamento: (data: any) => request<any>('/lancamentos', { method: 'POST', body: JSON.stringify(data) }),
  updateLancamento: (id: string, data: any) => request<any>(`/lancamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLancamento: (id: string) => request<any>(`/lancamentos/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: (period?: string) => request<any>(`/dashboard${period ? `?period=${period}` : ''}`),
};
