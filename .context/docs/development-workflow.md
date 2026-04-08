# Development Workflow

This document outlines the engineering processes and standards for the **SGMU-Nova-Odessa** project. Following these guidelines ensures code quality, consistency across the team, and smooth deployment to Vercel.

## Branching & Releases

We follow a **GitHub Flow** model (a simplified version of Git Flow) optimized for Continuous Deployment on Vercel.

### Branching Strategy
- **`main`**: The stable production branch. Code here is automatically deployed to the production environment.
- **`develop`**: The integration branch for features. This branch is deployed to the staging environment.
- **Feature Branches**: Created from `develop` using the naming convention `feat/feature-name` or `fix/issue-description`.

### Release Process
1. Features are developed on feature branches.
2. A Pull Request (PR) is opened against `develop`.
3. Vercel generates a **Preview Deployment** for every PR.
4. Once reviewed and merged into `develop`, the changes are staged.
5. Periodically, `develop` is merged into `main` to trigger a production release.
6. **Tagging**: Use Semantic Versioning (SemVer). Create a tag for production releases: `git tag -a v1.0.0 -m "Release description"`.

## Local Development

### Prerequisites
- **Node.js**: v18 or higher.
- **npm**: v9 or higher.
- **Supabase CLI**: Required if you need to modify Edge Functions or database schemas.

### Environment Setup
Create a `.env` file in the root directory (refer to `.env.example` if available):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Essential Commands
- **Install Dependencies**: `npm install`
- **Start Local Server**: `npm run dev` (Runs the Vite dev server at `localhost:5173`)
- **Build for Production**: `npm run build`
- **Code Linting**: `npm run lint` (ESLint)
- **Code Formatting**: `npm run format` (Prettier - implied)

## Code Quality Standards

### Linting & Formatting
- All code must pass ESLint checks before merging.
- We use **Prettier** for opinionated code formatting. Configure your IDE (VS Code is recommended) to "Format on Save".
- **React Standards**:
  - Functional Components with Hooks.
  - PascalCase for component filenames (`UserProfile.jsx`).
  - Use `cn` from `src/lib/utils.js` for dynamic class merging (utility-first CSS with Tailwind).

### Component Structure
Components should be small and focused. If a component grows too large (>200 lines), consider breaking it down or moving logic to a custom hook (`src/hooks/`).

**Example Directory Structure for a Feature:**
```
src/components/orders/
├── OrderList.jsx       # Smart container
├── OrderItem.jsx       # Dumb presentational component
└── OrderFilters.jsx    # UI controls
```

## Definition of Done (DoD)
1. Code compiles without errors or warnings.
2. Feature matches the requirements.
3. Code is formatted and linted.
4. (Optional) Unit tests added for complex logic.
5. PR description explains the "Why" and "What", including screenshots for UI changes.

<!-- context-signature
{"timestamp":"2026-01-14T20:26:15.000Z","version":"1","generator":"ai-coders-context"}
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
