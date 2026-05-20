-- ROTA CERTA - Schema Inicial
-- Supabase/PostgreSQL

-- ============================================
-- 1. Tabela de Perfis (estende auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  cidade TEXT,
  estado CHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome_completo', 'Motorista'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. Configuração do Veículo
-- ============================================
CREATE TABLE public.configuracao_veiculo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo_veiculo TEXT NOT NULL CHECK (tipo_veiculo IN ('moto', 'carro', 'van')),
  autonomia_kml NUMERIC(6,2) NOT NULL CHECK (autonomia_kml > 0),
  preco_combustivel NUMERIC(6,2) NOT NULL CHECK (preco_combustivel > 0),
  custo_mei_mensal NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_seguro_mensal NUMERIC(10,2) NOT NULL DEFAULT 0,
  reserva_manutencao NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_documentacao NUMERIC(10,2) NOT NULL DEFAULT 0,
  reserva_depreciacao NUMERIC(10,2) NOT NULL DEFAULT 0,
  km_estimado_mes NUMERIC(10,2) NOT NULL CHECK (km_estimado_mes > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.configuracao_veiculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicle config"
  ON public.configuracao_veiculo FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicle config"
  ON public.configuracao_veiculo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicle config"
  ON public.configuracao_veiculo FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicle config"
  ON public.configuracao_veiculo FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_configuracao_veiculo_updated_at
  BEFORE UPDATE ON public.configuracao_veiculo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 3. Lançamentos Diários
-- ============================================
CREATE TABLE public.lancamentos_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  km_inicial NUMERIC(10,2) NOT NULL CHECK (km_inicial >= 0),
  km_final NUMERIC(10,2) NOT NULL CHECK (km_final > 0),
  valor_diaria NUMERIC(10,2) NOT NULL DEFAULT 0,
  qtd_pacotes INTEGER NOT NULL DEFAULT 0,
  valor_por_pacote NUMERIC(10,2) NOT NULL DEFAULT 0,
  ajuda_custo NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_combustivel NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_pedagio NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_alimentacao NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Colunas geradas automaticamente
  total_km NUMERIC(10,2) GENERATED ALWAYS AS (km_final - km_inicial) STORED,
  receita_bruta NUMERIC(10,2) GENERATED ALWAYS AS (
    valor_diaria + (qtd_pacotes * valor_por_pacote) + ajuda_custo
  ) STORED,
  custos_diretos NUMERIC(10,2) GENERATED ALWAYS AS (
    custo_combustivel + custo_pedagio + custo_alimentacao
  ) STORED,
  sobra_limpa NUMERIC(10,2) GENERATED ALWAYS AS (
    (valor_diaria + (qtd_pacotes * valor_por_pacote) + ajuda_custo)
    - (custo_combustivel + custo_pedagio + custo_alimentacao)
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraints
  CONSTRAINT check_km_final_maior CHECK (km_final > km_inicial),
  CONSTRAINT check_unique_date_per_user UNIQUE (user_id, data)
);

ALTER TABLE public.lancamentos_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lancamentos"
  ON public.lancamentos_diarios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lancamentos"
  ON public.lancamentos_diarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lancamentos"
  ON public.lancamentos_diarios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lancamentos"
  ON public.lancamentos_diarios FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_lancamentos_diarios_updated_at
  BEFORE UPDATE ON public.lancamentos_diarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Índices para performance
CREATE INDEX idx_lancamentos_user_data
  ON public.lancamentos_diarios(user_id, data DESC);

CREATE INDEX idx_config_veiculo_user
  ON public.configuracao_veiculo(user_id);
