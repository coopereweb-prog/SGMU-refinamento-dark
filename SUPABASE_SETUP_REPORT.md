# Relatório de Inicialização do Supabase (Local)

Este documento registra a tentativa de inicialização do ambiente Supabase local, as migrações aplicadas, erros encontrados, correções realizadas e próximos passos recomendados.

> Referência complementar: ver `AMBIENTES_DEV_PROD.md` para a especificação completa de ambientes (desenvolvimento e produção), incluindo variáveis, segurança, automação e instruções de deploy.

## Resumo
- Supabase CLI: v2.51.0 (Docker Desktop v28.5.1 ativo)
- Ação executada: `supabase start` e `supabase db reset`
- Resultado: serviços não iniciados devido a falhas em migrações SQL
- Testes do projeto (Vitest): executados e aprovados, independentes do banco

## Principais Erros Encontrados
1) Migração `0000_adicionando_novas_colunas_tabela_profiles_...`
- Erro inicial: `relation "public.profiles" does not exist` ao tentar `ALTER TABLE`.
- Causa: a migração pressupunha a existência da tabela `profiles`.
- Correção aplicada: criação idempotente da tabela `profiles` e inclusão de colunas com `IF NOT EXISTS`.
- Ajuste adicional: `role` definido como `TEXT` para evitar dependência do enum `public.user_role` durante migração.

2) Migração `0001_create_pricing_tiers.sql`
- Erro: `relation "public.points" does not exist` ao executar `ALTER TABLE public.points`.
- Correção aplicada: uso de `ALTER TABLE IF EXISTS ... ADD COLUMN IF NOT EXISTS ...`.

3) Migração `0002_add_rls_policies_for_pricing_tiers.sql`
- Erro de sintaxe ao criar políticas com múltiplas operações em um único `CREATE POLICY`.
- Correção aplicada: criação de três políticas separadas (insert, update, delete) e uso de `role::text` para evitar erro de enum inexistente.

4) Migração `0008_inserir_dados_padrão_de_pricing_tiers.sql`
- Erro: violação de chave única ao reinserir registros (`name` único).
- Correção aplicada: `ON CONFLICT (name) DO NOTHING`.

5) Migração `0009_criar_trigger_para_updated_at_em_pricing_tiers.sql`
- Erro: função `public.update_updated_at_column()` não encontrada.
- Correção aplicada: `CREATE OR REPLACE FUNCTION ...` e recriação idempotente do trigger.

6) Migrações de verificação que dependem da tabela `public.points` (ex.: `0013_verificar_pontos_com_pricing_tiers.sql`, `0017_verificar_pontos_com_pricing_tiers.sql`, e similares)
- Erro: `relation "public.points" does not exist` em vários `SELECT`.
- Ação aplicada: desativação pontual de `0013_verificar_pontos_com_pricing_tiers.sql` renomeando para `.sql.disabled`.
- Observação: existem outras migrações de verificação que continuarão falhando enquanto `points` não existir ou não possuir as colunas esperadas (ex.: `price_1y`, `price_4y`, `price_5y`).

## Causa Raiz Provável
- Divergência entre o `schema.sql` e a ordem/assunções das migrações. O `schema.sql` contém `CREATE TABLE IF NOT EXISTS public.points`, mas na prática, durante `supabase start`, as migrações que referenciam `points` estão sendo aplicadas antes de a tabela estar disponível (ou a criação está sendo ignorada por algum estado prévio).
- Além disso, algumas migrações utilizam `DO $$ ... $$` (blocos PL/pgSQL) e seleções diretas que falham quando a tabela/coluna não existe, interrompendo todo o processo.

## Recomendações para Destravar o Start
1) Garantir criação de `public.points` antes de qualquer migração que a referencie.
   - Opção A: mover a criação para uma migração inicial com nome no padrão (`<timestamp>_criar_points.sql`).
   - Opção B: adaptar migrações existentes para `ALTER TABLE IF EXISTS` e converter verificações em `RAISE NOTICE` condicionais dentro de `DO $$` que não abortem.

2) Padronizar migrações para serem idempotentes e tolerantes a estado parcial:
   - Evitar `CREATE POLICY` com múltiplas operações; usar políticas por operação.
   - Preferir `ADD COLUMN IF NOT EXISTS` e `ALTER TABLE IF EXISTS` onde houver dependência de objetos.
   - Ao inserir dados default, usar `ON CONFLICT DO NOTHING`.

3) Adequar nomes das migrações ao padrão requerido pelo CLI:
   - O CLI reportou: `file name must match pattern "<timestamp>_name.sql"` para novas migrações.
   - Recomenda-se renomear os arquivos para o padrão, mantendo ordem lógica.

4) Reduzir/Desativar temporariamente migrações de verificação que apenas fazem `SELECT` e abortam quando a tabela não existe.
   - Renomear esses arquivos para `.sql.disabled` (temporário) até a criação garantida das tabelas.
   - Alternativamente, reescrever como blocos que apenas `RAISE NOTICE` quando a tabela/coluna não existe.

5) Reconciliar tipos enum:
   - O `schema.sql` usa `public.point_status` e `public.user_role`. Caso as migrações dependam desses tipos, garantir que sejam criados antes ou usar casts para `text` nas políticas.

## Status Atual
- Docker e Docker Compose validados e operacionais (hello-world OK).
- Supabase CLI instalado e funcional.
- `supabase start`: ainda bloqueado por falhas em migrações.
- Testes do projeto (front-end / Vitest): todos aprovados.

## Próximos Passos Propostos
1) Criar migração inicial compatível com o padrão `<timestamp>_name.sql` que garanta a criação de `public.points` com todas as colunas esperadas (incluindo `price_1y`, `price_4y`, `price_5y`).
2) Renomear as migrações atuais para o padrão de timestamp para assegurar ordenação.
3) Revisar e ajustar migrações de verificação (`verificar_*`) para não abortar o processo, trocando consultas diretas por verificações seguras.
4) Reexecutar `supabase start` e, se necessário, `supabase db reset` após a padronização.

### Plano de Ambientes (Dev/Prod)
- Implementar separação de ambientes conforme `AMBIENTES_DEV_PROD.md`.
- Utilizar Supabase local para desenvolvimento e Supabase Cloud dedicado para produção.
- Configurar `.env.development` e `.env.production` com chaves e URLs específicas.
- Automatizar build/test/deploy por ambiente e revisar políticas de segurança (RLS, CORS, chaves).

## Comandos Executados (referência)
```
supabase start
supabase start --debug
supabase db reset
```

---
Atualizado automaticamente pelo assistente em: <!-- data pelo histórico do VCS -->
