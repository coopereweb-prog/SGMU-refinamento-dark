# Documento de Requisitos do Produto (PRD)

## 1. Visão Geral

- Nome do produto: Placas Nova Odessa (SGMU)
- Stack principal: React (Vite), Next.js (módulo `sgmu-next`), Supabase, Google Maps, Radix UI, Tailwind CSS
- Objetivo: Gerenciar pontos (placas), pedidos, preços e instalação de forma eficiente, com visualização em mapa e fluxo de compra simplificado.
- Público: Equipes internas (admin/operação) e clientes.

## 2. Objetivos e Métricas de Sucesso

- Reduzir tempo de criação de pedidos em 30% (tempo da primeira interação até confirmação).
- Aumentar a precisão de localização em 95% (pontos corretos no mapa, sem duplicidades).
- Diminuir retrabalho na instalação em 25% via checklist e tarefas de instalação.
- Zero bloqueios de acessibilidade críticos em modais e formulários (WCAG 2.1 AA).

## 3. Escopo

- Autenticação: login, cadastro, recuperação de senha.
- Catálogo e Mapa: listar e filtrar pontos; detalhes de ponto.
- Carrinho e Pedidos: adicionar itens, checkout, impressão de pedido e relatórios.
- Gestão: usuários, pontos, preços (pricing tiers), tags.
- Instalação: pipeline de tarefas e acompanhamento.
- Comunicação: botão WhatsApp e notificações.
- Integrações: Supabase (auth/DB/functions), Google Maps.

## 4. Personas

- Administrador: gerencia usuários, política de preços, tags e aprova pedidos.
- Operador: cria e atualiza pedidos, acompanha tarefas de instalação.
- Cliente: consulta catálogo, faz pedido e acompanha status.

## 5. Fluxos Principais

- Login e sessão: via Supabase Auth, redirecionamento pós-login.
- Explorar mapa: filtros (tags, status), seleção de ponto e abertura de detalhes.
- Criar pedido: adicionar itens ao carrinho, confirmar, gerar número de pedido.
- Instalação: criar tarefas, marcar concluído, ver status agregado.
- Relatórios: imprimir pedido, imprimir relatório de pontos selecionados.

## 6. Requisitos Funcionais (por módulo)

### 6.1 Mapa e Pontos
- Visualizar pontos com pins, clustering, zoom.
- Filtrar por tags, status, faixa de preço.
- Abrir `PointDetails` com fotos, endereço, tags e preço.
- Editar atributos (admin/operação), com validação.

### 6.2 Catálogo e Carrinho
- Lista e busca de pontos e serviços.
- Adicionar/remover itens ao carrinho (componentes `Cart`, `GlobalCart`).
- Exibir subtotal, taxas e total.
- Persistência de carrinho por sessão.

### 6.3 Pedidos
- Criar pedido (dados do cliente, itens, total).
- Ver e atualizar status (e.g. reservado, instalado, concluído).
- Imprimir (`PrintableOrder`, `PrintablePointsReport`).

### 6.4 Preços e Tags
- CRUD de `PricingTiers`.
- CRUD de tags e associação a pontos.
- Regras: pontos sem `pricing_tier_id` devem ser sinalizados.

### 6.5 Instalação
- CRUD de `InstallationTasks` por pedido.
- Checklist por etapa, logs e datas.
- Notificações de conclusão.

### 6.6 Usuários e Acesso
- CRUD de usuários (admin), convite, redefinição de senha.
- Perfis com permissões.

### 6.7 Comunicação
- Botão WhatsApp com mensagem predefinida.
- Notificações in-app (componentes `NotificationBell`, `sonner`).

## 7. Requisitos de UX/UI

- Navegação clara por páginas (Home, Login, Gestão, etc.).
- Mapas responsivos (desktop/mobile).
- Modais acessíveis (Radix UI), com títulos e descrições anunciáveis.

## 8. Acessibilidade (WCAG 2.1 AA)

- Modais `DialogContent` devem possuir `DialogTitle` e descrição via:
  - `DialogDescription` com `id` referenciado em `aria-describedby`, ou
  - `description` prop (renderiza `Description` sr-only e linka automaticamente).
- Componentes interativos com foco visível, labels e sem duplicar descrições.
- Tests com Vitest/RTL garantem `aria-describedby` e ligação Radix.

## 9. Requisitos Não Funcionais

- Performance: lazy loading; divisão de chunks (Google Maps, Supabase, UI, React).
- Segurança: RLS em tabelas; validações de input; chaves via `.env` (não commitar).
- Confiabilidade: logs de erro e retries em funções de backend.
- Escalabilidade: Supabase gerencia banco; frontend estático em CDN.

## 10. Modelo de Dados (alto nível)

- Usuário: id, email, role, perfil.
- Ponto: id, coords, endereço, tags[], pricing_tier_id, status.
- Tag: id, nome.
- PricingTier: id, nome, preço base, regras.
- Pedido: id, cliente_id, itens[], total, status.
- OrderItem: id, pedido_id, ponto_id/serviço_id, preço.
- InstallationTask: id, pedido_id, etapa, status, data.

## 11. Integrações

- Supabase: Auth, DB, Functions (e.g. `create-order`, `expire_old_reservations`).
- Google Maps: exibição e interação com mapa.
- Radix UI: modais, tooltips, menus.

## 12. Configuração e Ambientes

- Desenvolvimento (Vite root): `pnpm dev` em `5173` (ou alternar porta); `.env.local` com `VITE_*` quando necessário.
- Next (`sgmu-next`): `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Build e preview: `pnpm build` e `pnpm preview` (Vite).

## 13. Dependências Principais

- React, Vite, Next.js, Supabase JS, @react-google-maps/api, Radix UI, Tailwind, Vitest/RTL.

## 14. Requisitos de Testes

- Unitários: Vitest + RTL; testes de a11y para `DialogContent`.
- Integração: supabase functions (mock/ambiente de teste).
- E2E (proposta): Playwright para fluxos principais (login, mapa, pedido).

## 15. Riscos e Mitigações

- Caminhos com espaços em Windows podem quebrar transformações Vite/Vitest.
  - Mitigação: usar caminhos sem espaços ou WSL.
- Falta de chaves Supabase impede execução do Next.
  - Mitigação: variáveis obrigatórias em `.env.local` e checks de inicialização.

## 16. Plano de Releases

- R1: Correções de acessibilidade em modais e testes Vitest (concluído).
- R2: Fluxo de pedido estável com impressão e checklist de instalação.
- R3: Gestão avançada de preços e tags; relatórios consolidados.

## 17. Critérios de Aceite (exemplos)

- Modais anunciam título e descrição corretamente via leitor de tela.
- Pedido contém itens, total e status, persistido com RLS habilitado.
- Mapa carrega pontos e filtros operam com feedback imediato.

## 18. Perguntas em Aberto

- Regras de precificação dinâmicas por zona? Precisam de parâmetros adicionais?
- SLA de instalação e notificações externas (e-mail/SMS)?

## 19. Glossário

- Ponto: localização de placa/serviço.
- Pedido: conjunto de itens selecionados por cliente.
- RLS: Row Level Security no banco Supabase.

## 20. Observações de Implementação Recentes

- `DialogContent` atualizado para linkar automaticamente `DialogDescription` via `aria-describedby` e suportar `description` prop.
- `vitest.config.ts` ajustado com alias `@` para resolver `@/lib/utils`.
- `package.json` corrigido (bloco `pnpm.onlyBuiltDependencies`).