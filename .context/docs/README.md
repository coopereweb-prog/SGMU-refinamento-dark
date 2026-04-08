# SGMU Nova Odessa Documentation

Welcome to the technical documentation for the **SGMU-Nova-Odessa** repository. This system is designed for managing urban maintenance services, specifically focusing on lighting points, installations, and field operations management.

## 🚀 Getting Started

This repository contains a modern web application built with **React**, **Vite**, and **Supabase**. It follows a modular architecture designed for scalability and real-time updates.

### Core Documentation Guides
- [**Project Overview**](./project-overview.md) — High-level goals, roadmap, and stakeholder context.
- [**Architecture Notes**](./architecture.md) — Deep dive into the system design, service boundaries, and dependencies.
- [**Development Workflow**](./development-workflow.md) — How to set up, branch, and contribute to the codebase.
- [**Data Flow & Integrations**](./data-flow.md) — Understanding Supabase interactions, Edge Functions, and state management.
- [**Testing Strategy**](./testing-strategy.md) — Overview of the CI gates and testing patterns.
- [**Security & Compliance**](./security.md) — Authentication models (RBAC), secrets management, and data protection.
- [**Glossary & Domain Concepts**](./glossary.md) — Definition of business terms like "Points", "Installation Pipeline", and "Kanban Board".

---

## 🏗 System Architecture

The application is structured around a central dashboard system with role-based access control (RBAC):

- **Admin/Manager**: Accessible via `AdminLayout`, managing users (`ManageUsersPage`) and global settings (`SettingsManager`).
- **Field Technician**: Specialized views for on-site operations (`FieldTechnicianPage`) and route optimization.
- **Client**: Interaction through the `ClientDashboardPage` for monitoring services and contracted points.

### Key Components

- **Authentication**: Powered by `AuthContext.jsx` and `AuthProvider`, supporting JWT-based sessions and protected routes (`ProtectedRoute.jsx`, `GuestRoute.jsx`).
- **Maps & Location**: Extensive integration with Google Maps API (`GoogleMapsLoaderContext.jsx`, `MapConfigContext.jsx`) for plotting points, drawing polygons, and route planning (`RouteGenerator.jsx`).
- **Order Management**: A dedicated pipeline for installations and maintenance requests (`InstallationPipelinePage.jsx`, `OrderList.jsx`), including cart functionality (`CartContext.jsx`) and printable reports (`PrintableOrder.jsx`).

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS (for styling via `cn` utility).
- **Backend / BaaS**: Supabase (PostgreSQL, Auth, Storage).
- **State Management**: Context API (`AuthContext`, `CartContext`, etc.) and React Query (implied usage for data fetching patterns).
- **Maps**: Google Maps JavaScript API (Geocoding, Places, Maps).

## 🧩 Directory Structure Highlights

```
src/
├── components/       # Reusable UI components (Modals, Lists, Layouts)
├── contexts/         # Global state (Auth, Cart, Maps)
├── hooks/            # Custom React hooks
├── lib/              # Utilities (formatters, map helpers, validators)
├── pages/            # Top-level page components (Routing targets)
└── services/         # API wrappers (Supabase client interactions)
```

## 📝 Recent Context Updates

This documentation structure is being actively filled to provide better AI context and developer onboarding.

<!-- context-signature
{"timestamp":"2026-01-14T20:23:45.000Z","version":"1","generator":"ai-coders-context"}
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
- `OrderDetailPage` (exported) @ src\pages\OrderDetailPage.jsx:29
- `OrderList` (exported) @ src\components\\OrderList.jsx:19
- `PrintableOrder` (exported) @ src\components\PrintableOrder.jsx:4
- `PrintablePointsReport` (exported) @ src\components\PrintablePointsReport.jsx:4
- `ProtectedRoute` (exported) @ src\components\ProtectedRoute.jsx:7
- `RouteGenerator` (exported) @ src\components\RouteGenerator.jsx:12
- `RoutePlannerModal` (exported) @ src\components\RoutePlannerModal.jsx:12
- `SettingsManager` (exported) @ src\components\admin\SettingsManager.jsx:8
-->
