# Estratégia de Testes - SGMU Nova Odessa

Este documento descreve a abordagem de garantia de qualidade, as ferramentas utilizadas e os padrões adotados para testes no projeto SGMU-Nova-Odessa.

## Visão Geral

Nossa estratégia de testes é baseada na pirâmide de testes, priorizando testes de unidade para lógica de negócio, seguidos por testes de integração para componentes e fluxos críticos, e testes de ponta a ponta (E2E) para jornadas principais do usuário.

---

## Tipos de Teste

### 1. Testes de Unidade
Focam em funções isoladas, utilitários e lógica pura (sem dependência de DOM ou rede).
- **Framework:** [Vitest](https://vitest.dev/) (compatível com Vite).
- **Convenção de Nomenclatura:** `*.test.js` ou `*.spec.js`.
- **Localização:** Mesma pasta do arquivo testado ou em uma subpasta `__tests__`.
- **Exemplos de Alvos:** 
  - `src/lib/utils.js` (Formatação de moeda, manipulação de classes).
  - `src/lib/maps-utils.js` (Cálculo de distância Haversine, ordenação de proximidade).
  - `src/lib/image-utils.js` (Compressão de imagens).

### 2. Testes de Integração & Componentes
Verificam a interação entre múltiplos componentes e o gerenciamento de estado (Context API).
- **Ferramentas:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + Vitest.
- **Scenarios:**
  - Renderização de formulários e validação de campos (ex: `EnhancedReservationForm`).
  - Fluxo do carrinho de compras (`CartProvider` + `CartModal`).
  - Lógica de autenticação e redirecionamento (`AuthProvider` + `ProtectedRoute`).
- **Mocking:** Utilizamos `msw` (Mock Service Worker) para interceptar chamadas à API do Supabase.

### 3. Testes End-to-End (E2E)
Validam o fluxo completo da aplicação em um navegador real.
- **Ferramenta Recomendada:** [Playwright](https://playwright.dev/) ou [Cypress](https://www.cypress.io/).
- **Fluxos Críticos:**
  1.  Login como Técnico -> Visualizar Mapa -> Gerar Rota.
  2.  Login como Admin -> Aprovar Usuário -> Verificar Permissão.
  3.  Fluxo de Checkout: Selecionar Ponto -> Adicionar ao Carrinho -> Confirmar Pedido.

---

## Padrões de Código e Linting

- **ESLint:** Regras estáticas para evitar erros comuns (ex: hooks fora de componentes).
- **Prettier:** Formatação automática para consistência visual.
- **Husky & Lint-staged:** (Recomendado) Hooks de pré-commit para rodar linters antes de aceitar código no repositório.

## Executando os Testes

```bash
# Rodar todos os testes de unidade/integração
npm run test

# Modo watch (desenvolvimento)
npm run test:watch

# Relatório de cobertura
npm run test:coverage

# Rodar linter
npm run lint
```

<!-- context-signature
{"timestamp":"2026-01-14T20:29:45.000Z","version":"1","generator":"ai-coders-context"}
-->
<!--
Semantic Context Analysis:
- `AdminLayout` (exported) @ src\components\admin\AdminLayout.jsx:7
- `AppLayout` (exported) @ src\components\AppLayout.jsx:4
- `AuthProvider` (exported) @ src\contexts\AuthContext.jsx:6
- `AuthRedirectHandler` (exported) @ src\components\AuthRedirectHandler.jsx:6
- `CartModal` (exported) @ src\components\CartModal.jsx:4
- `CartProvider` (exported) @ src\contexts\CartContext.jsx:7
- `cn` (exported) @ src\lib\utils.js:4
- `compressImage` (exported) @ src\lib\image-utils.js:12
- `FilterSheet` (exported) @ src\components\FilterSheet.jsx:10
- `formatCurrencyBRL` (exported) @ src\lib\utils.js:43
- `generateOptimizedRouteUrl` (exported) @ src\lib\maps-utils.js:73
- `getOrderStatusProps` (exported) @ src\lib\utils.js:13
- `GlobalCart` (exported) @ src\components\GlobalCart.jsx:10
- `GoogleMapsLoaderProvider` (exported) @ src\contexts\GoogleMapsLoaderContext.jsx:10
- `GuestRoute` (exported) @ src\components\GuestRoute.jsx:6
- `InstallationPipelinePage` (exported) @ src\pages\InstallationPipelinePage.jsx:4
- `ManageUsersPage` (exported) @ src\pages\ManageUsersPage.jsx:12
- `MapConfigProvider` (exported) @ src\contexts\MapConfigContext.jsx:10
- `MobileFilterButton` (exported) @ src\components\MobileFilterButton.jsx:4
- `Modal` (exported) @ src\components\Modal.jsx:6
- `OrderDetailPage` (exported) @ src\\pages\\OrderDetailPage.jsx:29
- `OrderList` (exported) @ src\components\OrderList.jsx:19
- `PrintableOrder` (exported) @ src\components\PrintableOrder.jsx:4
- `PrintablePointsReport` (exported) @ src\components\PrintablePointsReport.jsx:4
- `ProtectedRoute` (exported) @ src\components\ProtectedRoute.jsx:7
- `RouteGenerator` (exported) @ src\components\RouteGenerator.jsx:12
- `RoutePlannerModal` (exported) @ src\components\RoutePlannerModal.jsx:12
- `SettingsManager` (exported) @ src\components\admin\SettingsManager.jsx:8
-->
