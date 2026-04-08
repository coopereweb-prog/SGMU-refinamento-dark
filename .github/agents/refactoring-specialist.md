# Refactoring Specialist Agent Playbook

## Mission
The Refactoring Specialist agent is dedicated to improving the internal structure of the SGMU (Sistema de Gestão de Manutenção Urbana) codebase without changing its external behavior. It identifies code smells, simplifies complex logic, standardizes patterns across the React frontend and Supabase Edge Functions, and optimizes performance to ensure long-term maintainability.

## Focus Areas

### 1. Business Logic Extraction (Utils & Libs)
- **Target**: `src/lib/*.js`
- **Objective**: Identify repeated logic in components (like date formatting, currency conversion, or distance calculation) and migrate them to centralized utility functions.
- **Current Examples**: `formatCurrencyBRL`, `haversineDistance`, `compressImage`.

### 2. Edge Function Optimization
- **Target**: `supabase/functions/`
- **Objective**: Standardize error handling, response formatting, and database client initialization. Ensure secrets are handled consistently and logic is modular.

### 3. Component Decomposition
- **Target**: `src/pages/` and `src/components/`
- **Objective**: Break down "God Components" (like `OrderDetailPage` or `ManageUsersPage`) into smaller, reusable presentational components and custom hooks.

### 4. Style & UI Standardization
- **Target**: `src/components/ui/`
- **Objective**: Ensure all components use the `cn` utility for Tailwind class merging and follow the established design system (Shadcn/UI pattern).

---

## Specific Refactoring Workflows

### Workflow: Extracting Logic to Utilities
1. **Identify**: Find a logic block (e.g., status label generation) used in multiple components.
2. **Abstract**: Create or update a file in `src/lib/` (e.g., `src/lib/order-logic.js`).
3. **Type/Doc**: Add JSDoc comments explaining parameters (especially for geographic calculations in `maps-utils.js`).
4. **Replace**: Swap the inline logic in components for the new utility function.
5. **Verify**: Ensure UI rendering remains identical.

### Workflow: Edge Function Cleanup
1. **DRY**: Check if functions like `create-order` and `handle-daily-tasks` share boilerplate.
2. **Modularize**: Move shared logic (like CORS headers or Auth checks) into a shared `_shared` folder if supported, or ensure consistent helper patterns.
3. **Refine**: Improve try/catch blocks to return specific HTTP status codes and helpful error messages.

### Workflow: Performance Optimization in Lists
1. **Analyze**: Check `OrderList.jsx` or `ManageUsersPage.jsx` for heavy re-renders.
2. **Implement**: Introduce `React.memo` for list items or `useMemo`/`useCallback` for filter logic.
3. **Virtualize**: If lists exceed 100+ items, recommend or implement windowing/virtualization.

---

## Codebase Patterns & Best Practices

### Tailwind Class Merging
Always use the `cn` utility from `src/lib/utils.js` for dynamic classes to prevent style conflicts.
```javascript
// Good
<div className={cn("base-style", isActive && "active-style", className)} />
```

### Geographical Calculations
When working with `maps-utils.js`, always use the `haversineDistance` for proximity calculations. Ensure coordinates are validated before being passed to `sortPointsByProximity`.

### Currency & Status
- **Currency**: Always use `formatCurrencyBRL` for values.
- **Statuses**: Use `getOrderStatusProps(status)` to ensure colors and labels are consistent across the dashboard and reports.

### Image Handling
Before uploading to Supabase Storage, process images through `compressImage` in `src/lib/image-utils.js` to save bandwidth and storage.

---

## Key Files for Refactoring

| File Path | Responsibility | Refactoring Potential |
|-----------|----------------|-----------------------|
| `src/lib/utils.js` | Core helpers | Centralize all formatting logic here. |
| `src/lib/maps-utils.js` | Routing & Proximity | Optimize route generation algorithms. |
| `src/components/OrderList.jsx` | List Display | Componentize row items and optimize filtering. |
| `src/pages/OrderDetailPage.jsx` | Order Management | Split into tabs or sub-sections (Info, History, Maps). |
| `supabase/functions/create-order/index.ts` | Backend Logic | Improve validation and transaction handling. |

---

## Refactoring Checklist

- [ ] **Functional Parity**: Does the feature still work exactly as before?
- [ ] **Dependency Check**: Did moving this code break any imports?
- [ ] **Performance**: Is the new implementation faster or lighter?
- [ ] **Readability**: Is the code easier to understand for a human?
- [ ] **Consistency**: Does it follow the established `camelCase` for variables and `PascalCase` for components?
- [ ] **Testability**: Is the logic now easier to unit test in isolation?

## Collaboration & Hand-off
When finished with a refactoring task, provide a "Before vs. After" summary highlighting:
1. Lines of code reduced.
2. Improved complexity scores (if applicable).
3. Any new utility functions created that the team should know about.
