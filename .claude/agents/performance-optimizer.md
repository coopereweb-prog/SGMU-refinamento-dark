---
name: Performance Optimizer
description: Identify performance bottlenecks
status: unfilled
generated: 2026-01-14
---

# Performance Optimizer Agent Playbook

## Mission
Describe how the performance optimizer agent supports the team and when to engage it.

## Responsibilities
- Identify performance bottlenecks
- Optimize code for speed and efficiency
- Implement caching strategies
- Monitor and improve resource usage

## Best Practices
- Measure before optimizing
- Focus on actual bottlenecks
- Don't sacrifice readability unnecessarily

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `public/` — TODO: Describe the purpose of this directory.
- `src/` — TODO: Describe the purpose of this directory.
- `supabase/` — TODO: Describe the purpose of this directory.

## Key Files
**Entry Points:**
- [`supabase\functions\send-completion-email\index.ts`](supabase\functions\send-completion-email\index.ts)
- [`supabase\functions\invite-user\index.ts`](supabase\functions\invite-user\index.ts)
- [`supabase\functions\handle-daily-tasks\index.ts`](supabase\functions\handle-daily-tasks\index.ts)
- [`supabase\functions\get-users\index.ts`](supabase\functions\get-users\index.ts)
- [`supabase\functions\delete-user\index.ts`](supabase\functions\delete-user\index.ts)
- [`supabase\functions\create-order\index.ts`](supabase\functions\create-order\index.ts)
- [`src\main.jsx`](src\main.jsx)

## Architecture Context

### Config
Configuration and constants
- **Directories**: `.`, `src\config`, `src\contexts`
- **Symbols**: 2 total
- **Key exports**: [`useMapConfig`](src\contexts\MapConfigContext.jsx#L6), [`MapConfigProvider`](src\contexts\MapConfigContext.jsx#L10)

### Utils
Shared utilities and helpers
- **Directories**: `src\lib`
- **Symbols**: 7 total
- **Key exports**: [`cn`](src\lib\utils.js#L4), [`getOrderStatusProps`](src\lib\utils.js#L13), [`formatCurrencyBRL`](src\lib\utils.js#L43), [`generateOptimizedRouteUrl`](src\lib\maps-utils.js#L73), [`compressImage`](src\lib\image-utils.js#L12)

### Components
UI components and views
- **Directories**: `src\pages`, `src\components`, `src\components\ui`, `src\components\admin`
- **Symbols**: 55 total
- **Key exports**: [`OrderDetailPage`](src\pages\OrderDetailPage.jsx#L29), [`ManageUsersPage`](src\pages\ManageUsersPage.jsx#L12), [`InstallationPipelinePage`](src\pages\InstallationPipelinePage.jsx#L4), [`PrintablePointsReport`](src\components\PrintablePointsReport.jsx#L4), [`PrintableOrder`](src\components\PrintableOrder.jsx#L4), [`OrderList`](src\components\OrderList.jsx#L19), [`Modal`](src\components\Modal.jsx#L6), [`MobileFilterButton`](src\components\MobileFilterButton.jsx#L4), [`GlobalCart`](src\components\GlobalCart.jsx#L10), [`FilterSheet`](src\components\FilterSheet.jsx#L10), [`CartModal`](src\components\CartModal.jsx#L4), [`AppLayout`](src\components\AppLayout.jsx#L4), [`SettingsManager`](src\components\admin\SettingsManager.jsx#L8), [`AdminLayout`](src\components\admin\AdminLayout.jsx#L7)

### Controllers
Request handling and routing
- **Directories**: `src\components`
- **Symbols**: 5 total
- **Key exports**: [`RoutePlannerModal`](src\components\RoutePlannerModal.jsx#L12), [`RouteGenerator`](src\components\RouteGenerator.jsx#L12), [`ProtectedRoute`](src\components\ProtectedRoute.jsx#L7), [`GuestRoute`](src\components\GuestRoute.jsx#L6), [`AuthRedirectHandler`](src\components\AuthRedirectHandler.jsx#L6)
## Key Symbols for This Agent
- *No relevant symbols detected.*

## Documentation Touchpoints
- [Documentation Index](../docs/README.md)
- [Project Overview](../docs/project-overview.md)
- [Architecture Notes](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [Glossary & Domain Concepts](../docs/glossary.md)
- [Data Flow & Integrations](../docs/data-flow.md)
- [Security & Compliance Notes](../docs/security.md)
- [Tooling & Productivity Guide](../docs/tooling.md)

## Collaboration Checklist

1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above.
4. Capture learnings back in [docs/README.md](../docs/README.md).

## Hand-off Notes

Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.
