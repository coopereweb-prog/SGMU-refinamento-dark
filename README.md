# noPortal - Portal Cívico-Comercial com IA

Sistema de portal urbano que conecta moradores com informações essenciais, serviços públicos, estabelecimentos locais e oportunidades.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estado**: Zustand
- **UI**: Tailwind CSS + Radix UI
- **IA**: Integração com APIs de LLM

## 📋 Funcionalidades Principais

### 1. Busca Comercial Inteligente
- Sistema de ranqueamento com 6 critérios
- Separação Free/Premium
- Geolocalização integrada

### 2. Hotsite Premium com IA
- Sites dinâmicos com domínio próprio
- Assistente IA vendedor omnichannel
- Templates personalizáveis

### 3. Portal Cívico
- Serviços municipais
- Agenda de eventos
- Classificados
- Notícias locais

### 4. Sistema de IA (15 Agentes)
- Onboarding automatizado
- Moderação de conteúdo
- Atendimento ao cliente
- Geração de conteúdo

## 🛠️ Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar em desenvolvimento
pnpm dev
```

## 📁 Estrutura do Projeto

```
noPortal/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   ├── hooks/             # Hooks customizados
│   ├── lib/               # Utilitários
│   └── stores/            # Estado global (Zustand)
├── api/                    # Backend Express
│   ├── routes/            # Rotas da API
│   └── middleware/        # Middlewares
├── supabase/              # Configurações Supabase
│   ├── migrations/        # Migrações SQL
│   └── functions/         # Edge Functions
└── shared/                # Tipos compartilhados
```

## 🔧 Configuração

### Supabase
1. Criar projeto no Supabase
2. Configurar variáveis de ambiente
3. Executar migrações

### IA e APIs
- OpenAI API
- Google Maps API
- WhatsApp Business API

## 🚀 Deploy

### Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/noPortal)

### Supabase (Backend)
O backend é hospedado automaticamente pelo Supabase.

## 📄 Licença

Este projeto está sob a licença MIT.