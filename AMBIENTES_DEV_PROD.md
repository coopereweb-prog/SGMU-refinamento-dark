# Especificação e Provisionamento dos Ambientes: Desenvolvimento e Produção

Este documento define, de forma objetiva e acionável, a configuração, automação e o processo de deploy para dois ambientes distintos do projeto: desenvolvimento e produção. Inclui separação de banco de dados, variáveis de ambiente, políticas de segurança, pipelines de build/teste e instruções passo a passo de deploy.

## Objetivos
- Manter ambientes isolados com configurações específicas e seguras.
- Otimizar o ciclo de desenvolvimento com depuração facilitada e logs detalhados.
- Garantir alta disponibilidade, performance e segurança no ambiente de produção.
- Automatizar o provisionamento e documentar claramente a operação.

## Entregáveis
- Arquivos de variáveis de ambiente separados: `.env.development` e `.env.production` (exemplos abaixo).
- Diretriz de banco de dados por ambiente (Supabase local para dev; Supabase Cloud para prod).
- Fluxos de build, teste e deploy independentes.
- Políticas de segurança adequadas por ambiente (RLS, chaves, CORS, acesso).
- Instruções de provisionamento e operação (passo a passo de deploy).

---

## Ambiente de Desenvolvimento

### Banco de Dados
- Utilizar Supabase local com `supabase start`.
- Migrações devem ser idempotentes e tolerantes ao estado parcial; preferir `ALTER TABLE IF EXISTS` e `ADD COLUMN IF NOT EXISTS`.
- Dados de seed opcionais para acelerar testes manuais.

### Variáveis de Ambiente
Crie um arquivo `.env.development` na raiz do projeto com, no mínimo:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=chave_anon_local
LOG_LEVEL=debug
ENABLE_DEV_TOOLS=true
NODE_ENV=development
```
Observações:
- Não expor `SERVICE_ROLE_KEY` no front-end. Caso necessário, usar apenas em serviços locais seguros.
- Ajustar a URL/porta conforme o Supabase local reportar.

### Build e Testes
- Build com sourcemaps habilitados para depuração.
- Testes unitários em modo watch (`vitest` já validado no projeto).
- Testes de integração opcionais contra o banco local.

### Logs e Depuração
- Logs detalhados (`debug`) com etiqueta de ambiente.
- Ativar ferramentas de desenvolvimento quando disponíveis.

### Deploy (Desenvolvimento)
Objetivo: ambiente local rápido com iteração curta.
Passo a passo:
1. Instalar dependências: `npm install`.
2. Inicializar banco local: `supabase start`.
3. Aplicar migrações se necessário: `supabase db reset` ou `supabase db push`.
4. Carregar variáveis do dev: `.env.development`.
5. Subir o servidor de desenvolvimento: `npm run dev`.
6. Validar acesso local: `http://localhost:<porta_dev>`.

---

## Ambiente de Produção

### Banco de Dados
- Utilizar Supabase Cloud (projeto separado do dev) para alta disponibilidade.
- Migrações aplicadas via pipeline (CI) com validações e backups.
- Política de backup e retenção habilitadas no fornecedor.

### Variáveis de Ambiente
Crie um arquivo `.env.production` (apenas para referência local; em produção usar secret manager da plataforma):
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon_key_prod>
NODE_ENV=production
LOG_LEVEL=info
```
Observações:
- Definir as variáveis diretamente no provedor de hospedagem (secret manager). Nunca commitar chaves.
- Chaves de serviço (service role) apenas em backends/rotinas privadas.

### Build e Testes
- Build otimizado (minificação, remoção de sourcemaps públicos quando necessário).
- Testes unitários e integração completos antes do deploy.
- Gate de qualidade no CI (linters, typecheck, cobertura mínima).

### Segurança
- RLS ativo e revisado em todas as tabelas de dados sensíveis.
- CORS restrito aos domínios de produção.
- Rotação periódica de chaves e tokens.
- Monitoramento de acesso e auditoria.

### Monitoramento e Observabilidade
- Monitoramento de disponibilidade (uptime) e métricas de performance.
- Logs centralizados e alertas (erros, latência, taxas de falha).
- Telemetria opcional (integrar ferramentas como Sentry/Logflare, se adotadas no projeto).

### Escalabilidade
- Uso de CDN para ativos estáticos.
- Auto-escalonamento da aplicação conforme suporte da plataforma de hospedagem.
- Estratégias de cache (HTTP, aplicação) quando aplicáveis.

### Deploy (Produção)
Objetivo: publicação segura e reprodutível.
Passo a passo (exemplo genérico):
1. Garantir que as variáveis estejam configuradas no provedor (secret manager).
2. Executar pipeline de build: `npm ci && npm run build`.
3. Aplicar migrações ao banco gerenciado (automatizado no CI).
4. Publicar artefatos estáticos no provedor (CDN/hosting) ou iniciar container.
5. Validar saúde pós-deploy (checks, logs, métricas).

---

## Automação e Provisionamento

### Provisionamento Dev
- Script padrão: `supabase start` para serviços locais.
- Migrações em sequência com verificação de dependências.
- Seeds opcionais para dados iniciais.

### Provisionamento Prod
- CI pipeline com etapas:
  - Instalação e build (cache de dependências).
  - Testes (unitários e integração).
  - Migrações no banco gerenciado.
  - Deploy dos artefatos.
  - Verificações pós-deploy (smoke tests).

### Documentação Operacional
- Checklist para cada ambiente (pré-deploy, deploy, pós-deploy).
- Registro de mudanças e versões.
- Guia de rolagem (rollback) em caso de falha.

---

## Políticas de Segurança por Ambiente

### Desenvolvimento
- CORS liberado para `localhost` e redes locais.
- Dados de teste não sensíveis.
- Chaves com escopo mínimo para dev.

### Produção
- RLS obrigatório e políticas revisadas.
- CORS estrito (apenas domínios oficiais).
- Rotação de credenciais e auditorias periódicas.

---

## Modelos de Arquivos de Variáveis

`.env.development`
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=chave_anon_local
LOG_LEVEL=debug
ENABLE_DEV_TOOLS=true
NODE_ENV=development
```

`.env.production` (usar apenas como referência; em produção configurar via secret manager)
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon_key_prod>
NODE_ENV=production
LOG_LEVEL=info
```

---

## Instruções Resumidas de Deploy

### Dev
- `npm install`
- `supabase start`
- `supabase db push` (ou `db reset` conforme necessidade)
- Criar `.env.development`
- `npm run dev`

### Prod
- Configurar secrets no provedor
- `npm ci && npm run build`
- Aplicar migrações via CI
- Publicar artefatos / iniciar serviço
- Verificar saúde e métricas

---

## Observações Finais
- Este documento complementa o `SUPABASE_SETUP_REPORT.md`, focando na operação por ambiente.
- Manter este guia atualizado conforme alterações no stack, políticas ou provedores.

