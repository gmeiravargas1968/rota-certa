import { supabase } from '../config/supabase';
import { VehicleConfigInput } from '@rota-certa/shared';

export async function getVehicleConfig(userId: string) {
  const { data, error } = await supabase
    .from('configuracao_veiculo')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

export async function createVehicleConfig(userId: string, input: VehicleConfigInput) {
  const { data, error } = await supabase
    .from('configuracao_veiculo')
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicleConfig(userId: string, input: VehicleConfigInput) {
  const { data, error } = await supabase
    .from('configuracao_veiculo')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
