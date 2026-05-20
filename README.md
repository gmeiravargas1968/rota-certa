# ROTA CERTA

Sistema de Controle Financeiro para Motoristas Agregados

## Sobre o Projeto

O ROTA CERTA é um aplicativo mobile-first de gestão financeira desenvolvido para motoristas terceirizados e agregados que prestam serviços logísticos para plataformas como **Mercado Livre Flex** e **Shopee**.

O sistema transforma dados simples de rodagem em indicadores de lucro real, permitindo que o motorista saiba, no encerramento de cada rota, quanto efetivamente ficou no bolso depois de todos os custos — visíveis e invisíveis.

### Problema Resolvido

Motoristas agregados recebem valores brutos da transportadora e acreditam que a diferença entre o recebido e o combustível é o seu lucro. Na prática, custos invisíveis como depreciação, manutenção, impostos MEI, seguro e documentação consomem entre 16% e 25% do faturamento bruto.

### Funcionalidades

- **Configuração do Veículo** — cadastro de tipo de veículo, autonomia, custos fixos mensais (MEI, seguro, manutenção, IPVA, depreciação)
- **Lançamento Diário** — registro rápido de ganhos e gastos em menos de 2 minutos
- **Dashboard** — indicadores em tempo real: sobra limpa, lucro real, custo por KM, margem de lucro, alertas
- **Histórico** — lista de lançamentos com filtro por período e resumo mensal
- **Cálculos Automáticos** — fórmulas de negócio (RN01-RN06) aplicadas automaticamente

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend Mobile | React Native (Expo) + Expo Router |
| Backend | Node.js + Express |
| Banco de Dados | PostgreSQL (Supabase) |
| Autenticação | Supabase Auth |
| Validação | Zod |
| Estado | React Query + Zustand |
| Estilo | NativeWind (Tailwind CSS) |

---

## Estrutura do Projeto

```
SysMurillo/
├── apps/
│   ├── api/                    # Backend Express
│   │   └── src/
│   │       ├── config/         # Env e Supabase client
│   │       ├── controllers/    # Lógica das rotas
│   │       ├── middleware/     # Auth, validação, error handler
│   │       ├── routes/         # Definição de endpoints
│   │       ├── services/       # Acesso ao banco de dados
│   │       └── utils/          # Utilitários
│   │
│   └── mobile/                 # App Expo React Native
│       ├── app/                # Telas (Expo Router)
│       │   ├── (tabs)/         # Dashboard, Lançamento, Histórico
│       │   ├── login.tsx       # Autenticação
│       │   ├── configuracao.tsx# Config do veículo
│       │   └── detalhe/[id].tsx# Detalhe do lançamento
│       └── src/
│           ├── contexts/       # AuthContext
│           └── services/       # Supabase client, API client
│
├── packages/
│   └── shared/                 # Lógica compartilhada
│       └── src/
│           ├── calculations/   # Fórmulas RN01-RN06
│           ├── validators/     # Schemas Zod
│           ├── formatters/     # Formatação BRL, datas
│           └── types/          # TypeScript types
│
└── supabase/
    └── migrations/             # Schema SQL
```

---

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 10
- **Expo Go** instalado no celular Android (disponível na Play Store)
- Conta no **Supabase** (https://supabase.com)

---

## Configuração do Supabase

### 1. Criar projeto no Supabase

Acesse https://supabase.com/dashboard e crie um novo projeto.

### 2. Rodar a migration

No Supabase Dashboard, vá em **SQL Editor**, crie uma nova query e cole o conteúdo do arquivo:

```
supabase/migrations/001_initial_schema.sql
```

Execute o SQL. Isso criará as tabelas `profiles`, `configuracao_veiculo` e `lancamentos_diarios` com RLS (Row Level Security) habilitado.

### 3. Obter as credenciais

Vá em **Settings → API** e copie:

- **Project URL** (ex: `https://xxxxx.supabase.co`)
- **anon public key**
- **service_role secret**

---

## Configuração do Projeto

### 1. Instalar dependências

```bash
cd "/home/gibai/Área de trabalho/SysMurillo"
npm install
```

### 2. Configurar variáveis de ambiente

**API** — edite `apps/api/.env`:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

**Mobile** — edite `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Execução

Abra **dois terminais** simultaneamente:

### Terminal 1 — API (Backend)

```bash
cd "/home/gibai/Área de trabalho/SysMurillo/apps/api"
npx tsx src/index.ts
```

A API será iniciada em `http://localhost:3000`.

Para verificar se está rodando:

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2026-05-19T02:11:10.316Z"}
```

### Terminal 2 — App Mobile

```bash
cd "/home/gibai/Área de trabalho/SysMurillo/apps/mobile"
npx expo start
```

O Expo exibirá um QR Code. Escaneie com o app **Expo Go** no celular Android.

> **Nota:** O celular e o computador devem estar na mesma rede Wi-Fi. Se não estiverem, use o modo tunnel: `npx expo start --tunnel`

---

## Testes

### Testes unitários (packages/shared)

```bash
cd "/home/gibai/Área de trabalho/SysMurillo/packages/shared"
npx vitest run
```

Esperado: 20 testes passando.

### Verificação TypeScript (API)

```bash
cd "/home/gibai/Área de trabalho/SysMurillo/apps/api"
npx tsc --noEmit
```

Esperado: sem erros.

---

## API Endpoints

Todas as rotas (exceto `/api/health`) requerem autenticação via header `Authorization: Bearer <token>`.

### Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |

### Veículo

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/vehicle` | Buscar config do veículo |
| POST | `/api/vehicle` | Criar config do veículo |
| PUT | `/api/vehicle` | Atualizar config do veículo |

### Lançamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/lancamentos` | Listar lançamentos (filtro: `?from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=20`) |
| GET | `/api/lancamentos/:id` | Detalhe do lançamento |
| POST | `/api/lancamentos` | Criar lançamento |
| PUT | `/api/lancamentos/:id` | Atualizar lançamento |
| DELETE | `/api/lancamentos/:id` | Excluir lançamento |

### Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard` | Indicadores (filtro: `?period=7d` ou `?period=30d`) |

---

## Fórmulas de Negócio

Todas as fórmulas estão implementadas em `packages/shared/src/calculations/index.ts`:

| Código | Fórmula | Descrição |
|--------|---------|-----------|
| RN01 | `total_km = km_final - km_inicial` | Total de KM rodados |
| RN02 | `receita_bruta = diária + (pacotes × valor_pacote) + ajuda_custo` | Faturamento bruto diário |
| RN03 | `custos_diretos = combustível + pedágio + alimentação` | Custos diretos do dia |
| RN04 | `custo_fixo_km = custos_fixos_mensais ÷ km_estimado_mês` | Custo fixo por KM |
| RN05 | `custo_real_km = custo_fixo_km + (preço_combustível ÷ autonomia)` | Custo real por KM |
| RN06 | `lucro_real = sobra_limpa - (total_km × custo_fixo_km)` | Lucro real líquido |

---

## Modelo de Dados

### profiles
Estende `auth.users` do Supabase. Criado automaticamente via trigger no cadastro.

### configuracao_veiculo
- 1 registro por usuário (constraint `UNIQUE(user_id)`)
- Campos: tipo_veiculo, autonomia_kml, preco_combustivel, custos fixos mensais, km_estimado_mes

### lancamentos_diarios
- 1 registro por dia por usuário (constraint `UNIQUE(user_id, data)`)
- Colunas geradas automaticamente: `total_km`, `receita_bruta`, `custos_diretos`, `sobra_limpa`
- Validação: `CHECK (km_final > km_inicial)`

---

## Modelo de Monetização

| Plano | Recursos | Preço |
|-------|----------|-------|
| Gratuito | Registro diário, sobra limpa, 30 dias de histórico | R$ 0 |
| Profissional | Dashboard completo, custo real/KM, comparativo de rotas, alertas, exportação | R$ 19,90/mês |
| Anual | Todos os recursos + Relatório Fiscal MEI | R$ 179/ano |

---

## Tecnologias e Dependências

### Backend (apps/api)
- express, cors, helmet
- @supabase/supabase-js
- zod
- vitest, supertest

### Mobile (apps/mobile)
- expo, expo-router
- @supabase/supabase-js, expo-secure-store
- @tanstack/react-query, zustand
- react-hook-form, zod
- react-native-chart-kit, react-native-svg
- nativewind, tailwindcss
- react-native-mmkv
- react-native-toast-message

### Shared (packages/shared)
- zod
- vitest

---

## Licença

Projeto privado — ROTA CERTA © 2026
