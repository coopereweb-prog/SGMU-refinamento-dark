# Frontend Specialist Agent Playbook

## Mission
The Frontend Specialist Agent is responsible for designing, implementing, and maintaining the user interface of the SGMU (Sistema de Gestão Municipal Unificada) platform. Its mission is to deliver a responsive, accessible, and high-performance web experience that integrates seamlessly with Supabase services and Google Maps APIs.

## Responsibilities
- **UI/UX Implementation**: Develop modular components using React and Tailwind CSS.
- **State Management**: Manage application state using React Contexts (Auth, Cart, User, Maps).
- **Routing & Protection**: Implement and secure routes using `react-router-dom` and internal protection components.
- **Third-Party Integration**: Maintain Google Maps functionality and Supabase Edge Function triggers.
- **Reporting & Printables**: Manage specialized views for document generation (e.g., `PrintableOrder`).

## Core Frontend Stack
- **Framework**: React (Vite-based)
- **Styling**: Tailwind CSS + `shadcn/ui` components
- **Backend-as-a-Service**: Supabase (Auth, Database, Storage, Edge Functions)
- **Maps**: Google Maps Platform (custom integration)
- **Utilities**: `lucide-react` (icons), `clsx` + `tailwind-merge` (styling)

---

## Directory & File Guide

### 1. UI Foundation (`src/components/ui`)
Standardized primitive components.
- **Focus**: Modification of these should be rare. Use them to build higher-level features.
- **Key Files**: `button.jsx`, `dialog.jsx`, `sidebar.jsx`, `tabs.jsx`, `popover.jsx`.

### 2. Layouts & Routing (`src/components`)
Structure of the application.
- `AppLayout.jsx`: Main wrapper for standard pages.
- `AdminLayout.jsx`: Wrapper for administrative interfaces.
- `ProtectedRoute.jsx` / `GuestRoute.jsx`: Handles authentication-based redirection.

### 3. Business Logic Contexts (`src/contexts`)
The "brain" of the frontend.
- `AuthContext.jsx`: Supabase session management.
- `CartContext.jsx`: Global state for ordering/selection.
- `MapConfigContext.jsx`: Centralized configuration for Google Maps.
- `GoogleMapsLoaderContext.jsx`: Manages the async loading of the Maps API.

### 4. Domain Pages (`src/pages`)
Feature-specific views.
- **Admin**: `ManageOrdersPage.jsx`, `ManageUsersPage.jsx`, `InstallationPipelinePage.jsx`.
- **Public**: `AboutUsPage.jsx`, `TrabalheConoscoPage.jsx`, `NossosServicosPage.jsx`.

---

## Standard Workflows

### Creating a New Page
1.  **Define Route**: Add the route to `src/App.jsx`.
2.  **Determine Protection**: Wrap in `<ProtectedRoute>` for admin/user pages or `<GuestRoute>` for auth pages.
3.  **Choose Layout**: Wrap the page content in `<AppLayout>` or `<AdminLayout>`.
4.  **Implement Logic**: Use existing hooks (`useAuth`, `useCart`) to interact with global state.

### Implementing UI Components
1.  **Check shadcn**: Verify if the component exists in `src/components/ui`.
2.  **Styling**: Use Tailwind CSS classes exclusively.
3.  **Utility Usage**: Always use the `cn` utility from `src/lib/utils.js` for conditional class merging.
    ```javascript
    import { cn } from "@/lib/utils";
    // ...
    <div className={cn("base-class", isActive && "active-class")}>
    ```

### Handling Maps and Routes
1.  **Loader**: Ensure components requiring maps are wrapped by or check the `GoogleMapsLoaderContext`.
2.  **Utils**: Use `src/lib/maps-utils.js` for coordinate calculations or URL generation.
3.  **Planning**: Use `RouteGenerator.jsx` and `RoutePlannerModal.jsx` as templates for map-heavy interactions.

---

## Best Practices & Conventions

### 1. Internationalization & Formatting
- **Currency**: Always use `formatCurrencyBRL` from `src/lib/utils.js` for financial displays.
- **Dates**: Use standard Brazilian format (DD/MM/YYYY) for UI display.

### 2. State Access
- Prefer specialized hooks over consuming contexts directly:
    - `useAuth()` instead of `useContext(AuthContext)`.
    - `useNotifications()` for toast/alert feedback.

### 3. Styling Patterns
- **Responsive Design**: Use Tailwind's mobile-first prefixes (`md:`, `lg:`).
- **Consistency**: Use the theme colors defined in `tailwind.config.js`.

### 4. Performance
- **Image Optimization**: Use `compressImage` from `src/lib/image-utils.js` before uploading to Supabase Storage.
- **Conditional Rendering**: Use `Suspense` for heavy components where appropriate.

---

## Key Symbols Reference

| Symbol | Location | Purpose |
| :--- | :--- | :--- |
| `cn` | `src/lib/utils.js` | Merges Tailwind classes safely. |
| `useAuth` | `src/contexts/AuthContext.jsx` | Accesses Supabase user/session. |
| `GlobalCart` | `src/components/GlobalCart.jsx` | Manages persistent shopping cart UI. |
| `getOrderStatusProps` | `src/lib/utils.js` | Maps database status to UI colors/labels. |
| `generateOptimizedRouteUrl` | `src/lib/maps-utils.js` | Creates Google Maps navigation links. |

## Collaboration Checklist
- [ ] Confirm if a new UI component should be a primitive (`ui/`) or feature-specific.
- [ ] Ensure all API calls to Supabase are handled via existing contexts or edge functions.
- [ ] Verify that new pages are correctly integrated into the `AppLayout` or `AdminLayout` sidebars.
- [ ] Test responsive behavior for both the management dashboard and public-facing forms.
