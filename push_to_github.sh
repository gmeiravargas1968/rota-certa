#!/bin/bash

# Script auxiliar para enviar o projeto SysMurillo / Rota Certa para o GitHub

echo "=================================================="
echo "🚀 Enviando o Rota Certa para o GitHub"
echo "=================================================="
echo "Sua conta do GitHub: gmeiravargas1968"
echo ""

# Pergunta o nome do repositório
read -p "Digite o nome do repositório que você criou no GitHub (Pressione Enter para usar 'rota-certa'): " REPO_NAME
if [ -z "$REPO_NAME" ]; then
    REPO_NAME="rota-certa"
fi

echo ""
echo "📦 Preparando os arquivos locais..."
git add .

# Verifica se há algo a ser commitado
if git diff --cached --quiet; then
    echo "Nenhuma alteração para commitar."
else
    git commit -m "feat: estrutura inicial do monorepo Rota Certa"
fi

# Define a branch padrão como main
git branch -M main

# Remove remote origin se já existir para evitar conflitos
git remote remove origin 2>/dev/null

# Adiciona o novo remote
REMOTE_URL="https://github.com/gmeiravargas1968/${REPO_NAME}.git"
git remote add origin "$REMOTE_URL"

echo ""
echo "🔗 Repositório remoto configurado:"
echo "   $REMOTE_URL"
echo ""
echo "⚠️  Importante: Para realizar o push abaixo, o GitHub poderá solicitar:"
echo "   1. Seu usuário: gmeiravargas1968"
echo "   2. Sua senha (ou Token de Acesso Pessoal - PAT)"
echo ""
echo "Subindo os arquivos agora..."
echo "=================================================="

git push -u origin main

if [ $? -eq 0 ]; then
    echo "=================================================="
    echo "✅ Sucesso! Seu código está no GitHub!"
    echo "🔗 Acesse em: https://github.com/gmeiravargas1968/${REPO_NAME}"
    echo "=================================================="
else
    echo "=================================================="
    echo "❌ Erro ao enviar os arquivos."
    echo "Verifique sua conexão, credenciais ou se o repositório foi criado corretamente no GitHub."
    echo "=================================================="
fi
