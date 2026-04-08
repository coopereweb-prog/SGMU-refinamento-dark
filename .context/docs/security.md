# Security & Compliance

This document outlines the security architecture, data protection measures, and compliance protocols for the SGMU-Nova-Odessa platform.

## Authentication & Authorization

The system implements a multi-tiered authentication and authorization strategy powered by **Supabase Auth** and React-based routing guards.

### Identity Management
- **Provider**: Supabase Auth (GoTrue).
- **Session Management**: JWT (JSON Web Tokens) stored in browser local storage, with automatic refresh handling.
- **Redirection**: Managed by `AuthRedirectHandler`, ensuring users are routed to their appropriate dashboard based on their role after login.

### Role-Based Access Control (RBAC)
User permissions are dictated by the `role` field in the user profile. The application defines three primary roles:
1.  **Admin**: Full access to system settings, user management, and global data.
2.  **Field Technician**: Access to assigned routes, installation pipelines, and point status updates.
3.  **Client**: Access to personal dashboards, order history, and point monitoring.

### Route Protection
- **`ProtectedRoute`**: Wraps routes requiring authentication. Optionally checks for specific roles.
- **`GuestRoute`**: Prevents authenticated users from accessing login/signup pages.
- **`AdminLayout`**: A specific layout wrapper that enforces administrative privileges for all nested sub-routes.

```javascript
// Example of a Protected Admin Route
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  } 
/>
```

---

## Secrets & Sensitive Data

The project adheres to strict separation of configuration and secrets.

### Storage & Management
- **Environment Variables**: Sensitive keys (Supabase URL, Anon Key, Google Maps API Key) are loaded via Vite's environment variable system (`import.meta.env`).
- **Client-Side Exposure**: `VITE_SUPABASE_ANON_KEY` is public by design, but restricted by Row Level Security (RLS) policies on the backend. `VITE_GOOGLE_MAPS_API_KEY` should be restricted by HTTP referrer in the Google Cloud Console.

### Data Privacy & RLS
We rely on Supabase's **Row Level Security (RLS)** to protect user data.
- **Policy**: "Users can only see their own profile."
- **Policy**: "Admins have full access to all tables."
- **Policy**: "Field Technicians can read orders assigned to them."
- *Note*: Ensure RLS is enabled on all tables in Supabase.

---

## Infrastructure Security

### HTTPS / TLS
All data in transit is encrypted via HTTPS. This is enforced by Vercel for the frontend and Supabase for the backend API.

### Input Validation
- **Frontend**: Form inputs are validated before submission (e.g., email format, required fields).
- **Backend (Supabase)**: Database constraints (Foreign Keys, Not Null, Check Constraints) ensure data integrity.

### Image Processing
Uploaded images are compressed on the client-side (`src/lib/image-utils.js`) before upload to minimize bandwidth and storage abuse.

---

## Security Audit Checklist (Manual)

- [ ] Verify that RLS policies are active for all tables.
- [ ] Ensure `VITE_GOOGLE_MAPS_API_KEY` has referrer restrictions.
- [ ] Audit user list for unauthorized Admin accounts.
- [ ] Check Supabase logs for unusual authentication patterns.

<!-- context-signature
{"timestamp":"2026-01-14T20:28:45.000Z","version":"1","generator":"ai-coders-context"}
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
