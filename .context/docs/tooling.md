# Tooling & Productivity Guide

This guide outlines the development environment, automation scripts, and editor configurations used in the **SGMU-Nova-Odessa** project to ensure consistency and developer efficiency.

---

## Required Tooling

To develop and maintain this project, you must have the following tools installed:

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `^18.x` or `^20.x` | JavaScript runtime for the Vite build system and frontend. |
| **npm** | `Latest` | Package management and dependency resolution. |
| **Supabase CLI** | `Latest` | Local development, Edge Function testing, and database migrations. |
| **Git** | `^2.x` | Version control and deployment via Vercel integration. |

### Installation Commands

```bash
# Install Supabase CLI (Windows/Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Install Supabase CLI (macOS/Homebrew)
brew install supabase/tap/supabase
```

---

## Project Scripts & Automation

The project uses standard NPM scripts to manage the development lifecycle and backend integration.

### Frontend Development

Execute these commands from the repository root:

- `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Optimizes and bundles the application for production.
- `npm run lint`: Runs ESLint to identify and fix code style issues.
- `npm run preview`: Locally previews the production build.

### Backend & Edge Functions

The system relies on Supabase Edge Functions for complex operations like order creation (`create-order`).

```bash
# Serve Edge Functions locally for testing
supabase functions serve

# Deploy a specific function to production
supabase functions deploy create-order --project-ref <your-project-ref>
```

## IDE Configuration (VS Code)

We recommend using **Visual Studio Code** with the following extensions:

1.  **ESLint**: Real-time linting feedback.
2.  **Prettier**: Automatic code formatting.
3.  **Tailwind CSS IntelliSense**: Autocomplete for utility classes.
4.  **Supabase**: Syntax highlighting for Supabase configuration files.

### Workspace Settings
Ensure your `.vscode/settings.json` (if present) or global settings enable format-on-save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

<!-- context-signature
{"timestamp":"2026-01-14T20:31:00.000Z","version":"1","generator":"ai-coders-context"}
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
