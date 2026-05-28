# SGMU - Sistema de Gerenciamento de Mobiliário Urbano

Sistema para gestão de pontos de propaganda em mobiliários urbanos da cidade.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL)
- **Mapas**: Google Maps API
- **UI**: Tailwind CSS + Radix UI
- **Estado**: Zustand

## 📋 Funcionalidades Principais

### 1. Mapa Interativo de Pontos
- Visualização de pontos de propaganda no mapa
- Filtros por status, tags e preços
- Detalhes completos de cada ponto

### 2. Carrinho de Compras
- Reserva de pontos com diferentes períodos (1, 4 ou 5 anos)
- Cálculo automático de preços
- Checkout simplificado

### 3. Gestão de Pedidos
- Administração completa do ciclo de vida dos pedidos
- Impressão de pedidos e relatórios
- Acompanhamento de status

### 4. Pipeline de Instalação
- Gerenciamento de tarefas para técnicos de campo
- Checklist de instalação
- Acompanhamento em tempo real

### 5. Sistema Multi-tenant
- Suporte para clientes, técnicos e administradores
- Controle de acesso baseado em roles
- Perfis personalizados por tipo de usuário

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
SGMU/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   ├── hooks/             # Hooks customizados
│   ├── lib/               # Utilitários
│   └── stores/            # Estado global (Zustand)
├── supabase/              # Configurações Supabase
│   ├── migrations/        # Migrações SQL
│   └── functions/         # Edge Functions
└── public/                # Assets estáticos
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