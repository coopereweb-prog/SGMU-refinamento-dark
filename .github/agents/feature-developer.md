# Feature Developer Agent Playbook - SGMU-Nova-Odessa

## Mission
The Feature Developer agent is responsible for the end-to-end implementation of new features, from UI components and client-side logic to Supabase Edge Function integrations. It ensures that all additions are performant, accessible, and align with the project's established design system (Shadcn UI + Tailwind).

## Responsibilities
- **Frontend Development**: Create responsive React components and pages using Vite and Tailwind CSS.
- **State Management**: Utilize React Context (e.g., `MapConfigContext`) and hooks for local/global state.
- **Backend Integration**: Implement and consume Supabase Edge Functions and database interactions.
- **Utility Implementation**: Extend shared logic in `src/lib` for tasks like image compression or route generation.
- **Quality Assurance**: Ensure features work across mobile/desktop (using `MobileFilterButton`, etc.) and handle loading/error states.

## Key Project Resources
- **Tech Stack**: React (Vite), Tailwind CSS, Shadcn UI, Supabase (Auth, Database, Edge Functions).
- **Core Layout**: `src/components/AppLayout.jsx` and `src/components/admin/AdminLayout.jsx`.
- **Styling**: `tailwind.config.js` and `src/lib/utils.js` (for `cn` helper).

## Repository Structure & Focus Areas

### 1. UI Components (`src/components/ui`)
This directory contains atomic Shadcn components. When building features:
- **Reuse**: Always check for existing components (e.g., `Tabs`, `Popover`, `InputOTP`) before creating new ones.
- **Consistency**: Follow the pattern of `lucide-react` for icons and `radix-ui` primitives.

### 2. Feature Pages (`src/pages`)
Key logical hubs:
- `OrderDetailPage.jsx`: Complex data display and management.
- `InstallationPipelinePage.jsx`: Workflow-specific logic.
- `ManageUsersPage.jsx`: Administrative CRUD operations.

### 3. Edge Functions (`supabase/functions/`)
Server-side logic (Deno/TypeScript):
- `create-order`: Core business logic for new records.
- `send-completion-email`: Post-process automation.
- `invite-user`: Administrative auth flow.

### 4. Shared Utilities (`src/lib/`)
- `utils.js`: Class merging (`cn`), currency formatting (`formatCurrencyBRL`), and status props.
- `maps-utils.js`: Logic for Google Maps integration and route URL generation.
- `image-utils.js`: Client-side image processing.

---

## Workflows & Steps

### Implementing a New View/Page
1.  **Route Registration**: Add the new page to `src/App.jsx` and wrap with `ProtectedRoute` or `GuestRoute`.
2.  **Layout Integration**: Use `AppLayout` for consistent navigation and sidebar behavior.
3.  **Data Fetching**: Use Supabase client hooks or standard `useEffect` patterns seen in `OrderList.jsx`.
4.  **Mobile Optimization**: Implement `FilterSheet` or `MobileFilterButton` if the page includes filtering or complex lists.

### Extending Supabase Functionality
1.  **Define Edge Function**: Create a new folder in `supabase/functions/`.
2.  **Local Testing**: Use Supabase CLI to test functions locally before deployment.
3.  **Frontend Hookup**: Call the function using `supabase.functions.invoke()` within the relevant component.

### Adding a Complex UI Component (Modal/Drawer)
1.  **Trigger**: Use `Modal` from `src/components/Modal.jsx` or specialized variants like `CartModal`.
2.  **Form Logic**: Follow the pattern in `RoutePlannerModal.jsx` for handling complex state within modals.

---

## Best Practices & Conventions

### 1. Code Style
- **Naming**: Use PascalCase for components and camelCase for hooks/utilities.
- **Props**: Use destructuring in component signatures.
- **Tailwind**: Use the `cn()` utility from `src/lib/utils.js` for conditional classes.

### 2. Error & Loading States
- Always implement loading skeletons or spinners (standardized in UI components).
- Use toast notifications for success/error feedback on form submissions.

### 3. Maps & Routing
- When dealing with locations, utilize `generateOptimizedRouteUrl` from `maps-utils.js`.
- Respect `MapConfigContext` for map-related settings.

### 4. Internationalization & Formatting
- **Currency**: Use `formatCurrencyBRL` for all price displays.
- **Dates**: Ensure dates are localized to Brazilian standards (PT-BR).

---

## Key Files Summary

| File | Purpose |
| :--- | :--- |
| `src/main.jsx` | Application entry point. |
| `src/components/AppLayout.jsx` | Main wrapper with navigation and sidebar. |
| `src/lib/utils.js` | Core helpers for classes, currency, and status logic. |
| `src/contexts/MapConfigContext.jsx` | Global state for mapping features. |
| `src/components/ProtectedRoute.jsx` | Component for enforcing authentication. |
| `src/components/ui/` | Reusable primitive components (Shadcn). |

## Hand-off Checklist
- [ ] Feature verified on both mobile and desktop resolutions.
- [ ] All new environment variables added to local and production Supabase configs.
- [ ] Edge functions deployed and tested.
- [ ] UI components follow the project's color palette and spacing.
- [ ] Hardcoded strings extracted or localized if necessary.
