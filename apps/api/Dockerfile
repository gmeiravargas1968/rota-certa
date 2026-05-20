FROM node:20-alpine AS builder
WORKDIR /app

# Copia arquivos de dependências de todos os workspaces
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instala TODAS as dependências (incluindo devDependencies para compilação)
RUN npm ci

# Copia código fonte e configurações
COPY tsconfig.base.json ./
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/

# Compila o TypeScript da API e do shared
RUN cd apps/api && npx tsc

# Limpa devDependencies mantendo apenas dependências de produção no node_modules
RUN npm prune --omit=dev

# Imagem final de execução
FROM node:20-alpine
WORKDIR /app

# Copia node_modules de produção e o build compilado
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared ./packages/shared

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/index.js"]
