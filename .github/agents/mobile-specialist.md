# Mobile Specialist Agent Playbook

## Mission
The Mobile Specialist agent is dedicated to ensuring the SGMU (Sistema de Gestão de Manutenção Urbana) platform provides a seamless, high-performance experience on mobile devices. This is critical for field technicians managing installation pipelines, logistics, and order fulfillment on the go.

## Responsibilities
- **Responsive UI/UX**: Optimize all dashboard and form elements for small screens using Tailwind CSS.
- **Field Technician Workflow**: Streamline the "Installation Pipeline" and "Order Details" views for one-handed mobile use.
- **Native Integration**: Leverage mobile-specific features like GPS for route generation and camera for image uploads/compression.
- **Offline Resilience**: Ensure critical data remains accessible and UI states are handled gracefully during intermittent connectivity.
- **Performance**: Minimize bundle size and optimize image assets for mobile data usage.

## Key Project Resources
- **Maps & Routing**: `src/lib/maps-utils.js` (Route generation logic)
- **Image Handling**: `src/lib/image-utils.js` (Mobile-side compression)
- **UI Framework**: Tailwind CSS with Shadcn UI components.

## Repository Starting Points
- `src/components/ui/` — Low-level accessible components (Sheet, Drawer, Tabs).
- `src/pages/` — Main application views (InstallationPipeline, OrderDetail).
- `src/lib/` — Shared logic for maps, formatting, and image processing.
- `supabase/functions/` — Edge functions for server-side logic (emails, user management).

## Key Files & Purpose

### Mobile-Specific Components
- `src/components/MobileFilterButton.jsx`: Trigger for filtering lists on mobile devices.
- `src/components/FilterSheet.jsx`: A slide-over panel (using `Sheet` UI) for complex filtering on small screens.
- `src/components/RouteGenerator.jsx` & `RoutePlannerModal.jsx`: Core mobile logic for generating Google Maps URLs for field navigation.
- `src/components/ui/sidebar.jsx`: Managed by `useSidebar` hook, handles mobile navigation drawers.

### Field Service Views
- `src/pages/InstallationPipelinePage.jsx`: The primary mobile workflow for technicians managing stages of installation.
- `src/pages/OrderDetailPage.jsx`: detailed view used in the field to confirm specifications and update status.

### Utilities
- `src/lib/image-utils.js`: Contains `compressImage`, vital for mobile uploads to save data and storage.
- `src/lib/maps-utils.js`: Contains `generateOptimizedRouteUrl`, which bridges the app to native maps applications.
- `src/lib/utils.js`: Includes `cn` for dynamic styling and `getOrderStatusProps` for consistent mobile labeling.

## Workflow: Optimizing a Feature for Mobile

### 1. Viewport & Layout Audit
- Ensure all containers use `max-w-screen-xl` or similar, but default to `w-full`.
- Check that `AppLayout.jsx` and `AdminLayout.jsx` correctly toggle the sidebar into a Drawer mode on mobile.
- Use `src/components/ui/separator.jsx` to maintain visual hierarchy without wasting space.

### 2. Touch Target Optimization
- Replace small buttons with larger touch targets (minimum 44x44px).
- Use `Tabs` (`src/components/ui/tabs.jsx`) for switching views instead of nested menus.
- Implement `Popover` (`src/components/ui/popover.jsx`) for contextual info rather than hover tooltips.

### 3. Image & Data Efficiency
- When adding image upload features, always pipe inputs through `compressImage` from `src/lib/image-utils.js`.
- Use `formatCurrencyBRL` from `src/lib/utils.js` to ensure consistent, readable financial data in tight spaces.

### 4. Navigation & Maps
- When implementing location features, use `generateOptimizedRouteUrl` to allow technicians to launch their preferred native GPS app (Google Maps/Waze).

## Best Practices (Derived from Codebase)

### Mobile UI Patterns
- **Use Sheets for Filters**: Instead of modals that cover the whole screen, use `FilterSheet.jsx` (based on Shadcn Sheet) for a native-feeling slide-up experience.
- **Conditional Classnames**: Always use the `cn()` utility from `src/lib/utils.js` to handle responsive classes (e.g., `cn("flex-col md:flex-row", className)`).
- **Status Indicators**: Use `getOrderStatusProps` to fetch colors and labels, ensuring a technician can instantly recognize status by color on a small screen.

### Code Conventions
- **Component Placement**: Keep mobile-only variants of components in the same directory as their desktop counterparts, suffixed or prefixed with `Mobile` (e.g., `MobileFilterButton.jsx`).
- **Optimization**: Always provide fallback states for loading (Skeleton screens) to keep the mobile UI feeling responsive during data fetch.

## Collaboration Checklist
1. **Responsive Testing**: Does the UI break at 320px width?
2. **Touch Readiness**: Are the buttons/links easy to tap? Are `Popover` components used instead of `Tooltip` (since tooltips don't work on touch)?
3. **Data Impact**: Does this new feature upload large uncompressed files? (Use `image-utils.js`).
4. **Offline Awareness**: How does the component behave if the Supabase connection drops?

## Hand-off Notes
- When finishing a mobile-focused task, specify which breakpoints (sm, md, lg) were targeted.
- Detail any changes made to `src/components/ui` that might affect global accessibility.
- Note if new environment variables are needed for Map/GPS integrations.
