# 🔮 Guru das Bets

Previsões inteligentes com IA para loterias da Caixa e esportes brasileiros.
Motor de auto-atualização a cada 2 horas usando a API do Claude (Anthropic).

---

## 🚀 Deploy rápido (GitHub + Vercel)

### 1. Faça upload no GitHub

```bash
# Na pasta do projeto
git init
git add .
git commit -m "feat: Guru das Bets v1"
git branch -M main
git remote add origin https://github.com/SEU_USER/guru-das-bets.git
git push -u origin main
```

### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe o repositório `guru-das-bets` do GitHub
4. Em **Environment Variables**, adicione:
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-sua-chave-aqui`
5. Clique em **Deploy** ✅

---

## 🛠 Rodando localmente

```bash
# 1. Instale as dependências
npm install

# 2. Crie o arquivo .env com sua chave
cp .env.example .env
# Edite .env e coloque sua chave VITE_ANTHROPIC_API_KEY

# 3. Inicie o servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:5173
```

---

## 📁 Estrutura do projeto

```
guru-das-bets/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Componente principal + motor de IA
│   ├── main.jsx         # Entry point React
│   └── index.css        # Reset e animações globais
├── .env.example         # Template de variáveis de ambiente
├── .gitignore
├── index.html
├── package.json
├── vercel.json          # Config de deploy Vercel
└── vite.config.js
```

---

## ⚙️ Como funciona o motor de IA

- Na **abertura do app**, o primeiro ciclo é disparado automaticamente
- A cada **2 horas**, a API do Claude é chamada para reanalisar:
  - 🎰 **Loterias** — frequência histórica, atraso, paridade par/ímpar
  - ⚽ **Futebol** — forma recente, H2H, fator mandante, lesões
  - 🏀 **Basquete** — NBB 2025/26, sequências, classificação
  - 🏐 **Vôlei** — Superliga, playoffs
  - 🥊 **MMA/UFC** — cards confirmados, odds, estilo de luta
  - 🎾 **Tênis** — ATP/WTA, superfície, ranking
  - 🎮 **E-sports** — CBLOL 2026, forma das equipes

---

## 🔑 Obtendo sua chave da API Anthropic

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Vá em **API Keys** → **Create Key**
3. Copie a chave e adicione ao `.env` ou ao Vercel

---

## ⚠️ Aviso Legal

As previsões de loterias são baseadas em análise estatística histórica e **não garantem resultado**. Loteria é jogo de azar. Aposte com responsabilidade.
