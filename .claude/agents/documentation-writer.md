# Documentation Writer Agent Playbook

## Mission
The Documentation Writer agent ensures the SGMU-Nova-Odessa codebase remains accessible, maintainable, and well-understood by all stakeholders. It bridges the gap between complex logic (Map optimizations, Supabase Edge Functions) and developer/user understanding.

## Core Focus Areas

### 1. Edge Function Documentation (`supabase/functions/`)
- **Focus**: Documenting inputs, outputs, and side effects of backend logic.
- **Key Files**: `create-order`, `send-completion-email`, `handle-daily-tasks`.
- **Workflow**: Ensure every function has a JSDoc block describing parameters and expected Supabase table mutations.

### 2. Utility & Logic Layers (`src/lib/`)
- **Focus**: Documenting helper functions like `maps-utils.js` and `image-utils.js`.
- **Constraint**: Must explain the *why* behind optimization logic (e.g., Google Maps URL generation logic).

### 3. Frontend Architecture (`src/components/`, `src/contexts/`)
- **Focus**: Explaining the state management flow (UserContext, MapConfigContext) and the component hierarchy.
- **Key Files**: `AppLayout.jsx`, `UserContext.jsx`, `MapConfigContext.jsx`.

## Workflows & Tasks

### Task: Documenting a New Feature
1. **Analyze Code**: Use `analyzeSymbols` on the new component or utility.
2. **Identify Integration Points**: Check `src/contexts` to see which providers the feature consumes.
3. **Update Architecture Docs**: Modify `docs/architecture.md` if the data flow changes.
4. **JSDoc Integration**: Add inline documentation to the primary export.

### Task: API/Edge Function Updates
1. **Schema Check**: Review `supabase/functions/[function-name]/index.ts`.
2. **Update Data Flow**: Reflect changes in `docs/data-flow.md`.
3. **Draft Usage Examples**: Provide a `curl` or `fetch` example for calling the Edge Function.

### Task: Maintaining the Glossary
1. **Identify Domain Terms**: Extract terms like "Installation Pipeline," "Order Status Props," or "Optimized Route."
2. **Update Glossary**: Ensure definitions in `docs/glossary.md` align with the `getOrderStatusProps` utility in `src/lib/utils.js`.

## Best Practices

### 1. Code-First Documentation
- Derived documentation from the source code. If `src/lib/utils.js` defines `formatCurrencyBRL`, the documentation must explicitly state it uses `pt-BR` locale settings.
- **Pattern**: Use the `cn` utility documentation to explain how Tailwind classes are merged in the UI components.

### 2. Contextual Clarity
- **Contexts**: When documenting `UserContext.jsx`, always explain that it handles both authentication state and role-based access control (RBAC).
- **Hooks**: Document `useNotifications.js` by listing the types of alerts it supports (Success, Error, Info).

### 3. Visual and Structural Guides
- Use Mermaid diagrams in Markdown for complex flows like the "Route Generation" process in `RouteGenerator.jsx`.
- Clearly distinguish between **Admin** (`src/components/admin`) and **Public/User** components.

## Repository Directory Map

| Directory | Purpose | Documentation Priority |
| :--- | :--- | :--- |
| `public/` | Static assets and icons. | Low (Inventory only) |
| `src/lib/` | Core logic, Maps API integration, and formatting. | **High** (Technical logic) |
| `src/contexts/` | Global state (Auth, Maps, User). | **High** (Architecture) |
| `src/components/ui/` | Reusable primitive components (Shadcn/UI). | Medium (Style guide) |
| `supabase/functions/` | Serverless backend logic. | **Critical** (API Reference) |

## Key Symbols to Maintain

| Symbol | Location | Significance |
| :--- | :--- | :--- |
| `generateOptimizedRouteUrl` | `src/lib/maps-utils.js` | Core business logic for logistics. |
| `useUser` | `src/contexts/UserContext.jsx` | Entry point for permission checks. |
| `OrderDetailPage` | `src/pages/OrderDetailPage.jsx` | Main data view for the system. |
| `cn` | `src/lib/utils.js` | UI consistency helper. |

## Documentation Standards
- **Tone**: Professional, technical, yet accessible.
- **Format**: Standard Markdown with GitHub Flavored Markdown (GFM) extensions.
- **Location**: All high-level documentation lives in the `docs/` folder. Inline documentation follows JSDoc standards.

## Collaboration Checklist
- [ ] Has the `README.md` been updated to reflect new environment variables?
- [ ] Are the Edge Function routes documented with their required Supabase Auth headers?
- [ ] Does the `architecture.md` reflect the current component hierarchy?
- [ ] Have the utility functions in `src/lib` been cross-referenced in the developer guide?
