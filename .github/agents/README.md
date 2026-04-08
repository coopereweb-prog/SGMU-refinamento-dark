# Feature Developer Agent Playbook - SGMU Nova Odessa

This playbook provides the specific context, workflows, and standards required for a Feature Developer Agent to effectively implement new features within the SGMU Nova Odessa repository.

## 1. Role & Scope
The Feature Developer Agent is responsible for end-to-end implementation of user stories, UI enhancements, and functional modules. This includes creating React components, managing state, integrating with existing services, and ensuring responsive design.

### Core Areas of Focus
- **Pages (`src/pages`)**: High-level view components and route-level logic.
- **Components (`src/components`)**: Business-specific reusable components (Orders, Cart, Route Planning).
- **UI Primitives (`src/components/ui`)**: Low-level, design-system components based on Radix UI/shadcn patterns.
- **Routing & Auth**: Integration with `ProtectedRoute` and `AppLayout`.

---

## 2. Technical Stack & Patterns

### UI Development
- **Framework**: React (.jsx).
- **Styling**: Tailwind CSS for utility-first styling.
- **Components**: shadcn/ui pattern (Radix UI primitives). Always check `src/components/ui` before creating new low-level elements.
- **Icons**: Lucide React (standard across the project).

### Key Patterns
- **Layouts**: Wrap new pages in `AppLayout` to maintain sidebar and navigation consistency.
- **Modals**: Use the standard `Modal` component or `Dialog` primitives for overlays.
- **Data Fetching**: Look for existing patterns in `OrderList.jsx` or `ManageUsersPage.jsx` for API interactions.
- **Conditional Routing**: Use `ProtectedRoute` for admin/staff features and `GuestRoute` for auth pages.

---

## 3. Development Workflow

### Step 1: Context Analysis
1.  **Check for Existing Components**: Before building, search `src/components/ui` to see if a primitive (Button, Input, Popover) exists.
2.  **Identify Data Requirements**: Determine if the feature requires new state management or if it can hook into existing contexts (like `GlobalCart`).

### Step 2: Component Scaffolding
- Create new logic-heavy components in `src/components`.
- Create new page-level components in `src/pages`.
- If a component exceeds 200 lines, extract sub-components into a dedicated folder.

### Step 3: Implementation Steps
1.  **Define Props/Types**: Clearly define expected props.
2.  **UI Construction**: Use Tailwind classes. Follow the "mobile-first" approach as seen in `MobileFilterButton.jsx`.
3.  **State Management**: Use standard React hooks (`useState`, `useEffect`, `useMemo`).
4.  **Routing**: Register the new page in the main router (usually `App.jsx` or similar) using the appropriate Route wrapper.

### Step 4: Integration & Testing
1.  **Layout Integration**: Ensure the page fits within the `AppLayout`.
2.  **Empty States**: Always implement empty or loading states (e.g., "Nenhum pedido encontrado").
3.  **Responsive Check**: Verify the UI on mobile, tablet, and desktop.

---

## 4. Key Files & Their Purposes

| Path | Purpose |
| :--- | :--- |
| `src/components/AppLayout.jsx` | Main wrapper for the application shell. |
| `src/components/ProtectedRoute.jsx` | Logic for guarding routes based on authentication. |
| `src/components/GlobalCart.jsx` | Centralized cart logic used across the shopping/ordering flow. |
| `src/components/ui/` | Design system primitives (Tabs, Popovers, Buttons). |
| `src/pages/InstallationPipelinePage.jsx` | Reference for complex state-based workflows. |
| `src/components/OrderList.jsx` | Reference for list rendering and filtering patterns. |

---

## 5. Best Practices & Conventions

- **Naming**: Use PascalCase for components (`RouteGenerator.jsx`) and camelCase for helper functions.
- **Internationalization**: Ensure UI text is in Portuguese (PT-BR) as per existing codebase standards.
- **Filtering**: Use the `FilterSheet` or `MobileFilterButton` patterns for list-heavy pages.
- **Reports**: For printable features, refer to `PrintableOrder.jsx` or `PrintablePointsReport.jsx` to maintain print styling consistency.
- **Clean Code**:
    - Keep components focused on one responsibility.
    - Use `lucide-react` for all icons.
    - Avoid hard-coded styles; use Tailwind utility classes.

## 6. Common Task Recipes

### Adding a New Admin Page
1.  Create `src/pages/NewAdminFeaturePage.jsx`.
2.  Implement the component using `AppLayout`.
3.  Add the route to the main router wrapped in `<ProtectedRoute role="admin">`.
4.  Add a link to the page in the Sidebar component (`src/components/ui/sidebar.jsx`).

### Creating a New Modal Form
1.  Import `Modal` from `src/components/Modal.jsx`.
2.  Use `src/components/ui/label.jsx` and `src/components/ui/input.jsx` for form fields.
3.  Follow the submission pattern found in `RoutePlannerModal.jsx`.
