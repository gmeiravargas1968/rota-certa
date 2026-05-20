import { supabase } from '../config/supabase';
import { LancamentoInput, LancamentoUpdateInput, PeriodFilter } from '@rota-certa/shared';

export async function getLancamentos(userId: string, filter: PeriodFilter) {
  let query = supabase
    .from('lancamentos_diarios')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('data', { ascending: false });

  if (filter.from) {
    query = query.gte('data', filter.from);
  }
  if (filter.to) {
    query = query.lte('data', filter.to);
  }

  const offset = (filter.page - 1) * filter.limit;
  query = query.range(offset, offset + filter.limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page: filter.page,
    limit: filter.limit,
    pages: Math.ceil((count || 0) / filter.limit),
  };
}

export async function getLancamentoById(userId: string, id: string) {
  const { data, error } = await supabase
    .from('lancamentos_diarios')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

export async function createLancamento(userId: string, input: LancamentoInput) {
  const { data, error } = await supabase
    .from('lancamentos_diarios')
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Já existe um lançamento para esta data');
    }
    if (error.code === '23514') {
      throw new Error('KM Final deve ser maior que KM Inicial');
    }
    throw error;
  }

  return data;
}

export async function updateLancamento(
  userId: string,
  id: string,
  input: LancamentoUpdateInput
) {
  const { data, error } = await supabase
    .from('lancamentos_diarios')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Já existe um lançamento para esta data');
    }
    throw error;
  }

  return data;
}

export async function deleteLancamento(userId: string, id: string) {
  const { error } = await supabase
    .from('lancamentos_diarios')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
