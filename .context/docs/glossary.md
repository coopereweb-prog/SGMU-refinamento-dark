# Glossary & Domain Concepts

This document defines the terminology, technical concepts, and domain-specific logic used throughout the SGMU-Nova-Odessa platform.

## Core Terms

| Term | Definition | Context/Usage |
| :--- | :--- | :--- |
| **Ponto (Point)** | A geographic location representing a light pole or infrastructure unit that requires maintenance or installation. | `PointData`, `OrderList` |
| **Ordem de Serviço (Order)** | A service request or task associated with one or more Points. It tracks status, assigned technician, and required actions. | `OrderDetailPage`, `ManageOrdersPage` |
| **Pipeline de Instalação** | A visual Kanban-style board used to track the progress of installations from "Pending" to "Completed". | `InstallationPipelinePage`, `KanbanBoard` |
| **Carrinho (Cart)** | A temporary collection of Points selected by a user (usually a client) to be included in a service request. | `CartProvider`, `CartModal` |
| **Rota Otimizada** | A sequence of Points ordered by geographic proximity to minimize travel time for field technicians. | `generateOptimizedRouteUrl`, `sortPointsByProximity` |

## Personas / Actors

### Administrador (Admin)
*   **Goal:** Manage the entire system, including user permissions, global settings, and system-wide order monitoring.
*   **Key Workflows:** User management, configuring global parameters, viewing all orders.
*   **Components:** `AdminLayout`, `ManageUsersPage`, `SettingsManager`.

### Técnico de Campo (Field Technician)
*   **Goal:** Execute service orders efficiently at physical locations.
*   **Key Workflows:** Viewing assigned tasks, generating optimized travel routes between points, updating order status upon completion.
*   **Components:** `FieldTechnicianPage`, `RouteGenerator`, `RoutePlannerModal`.

### Cliente (Client)
*   **Goal:** Request new installations or maintenance and track their status.
*   **Key Workflows:** Browsing the map, adding points to the cart, submitting orders.
*   **Components:** `ClientDashboardPage`, `GlobalCart`.

## System Statuses

### Order Status
-   **Pending**: Order created but not yet assigned or started.
-   **In Progress**: Technician has started working on the order.
-   **Completed**: Work is finished.
-   **Cancelled**: Request was rejected or withdrawn.

### Authorization Roles
Defined in `AuthContext` and enforced by `ProtectedRoute`:
-   `admin`: Full access.
-   `tecnico`: Access to field operations and route planning.
-   `cliente`: Access to request creation and personal dashboard.

<!-- context-signature
{"timestamp":"2026-01-14T20:27:30.000Z","version":"1","generator":"ai-coders-context"}
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
- `OrderList` (exported) @ src\\components\\OrderList.jsx:19
- `PrintableOrder` (exported) @ src\components\PrintableOrder.jsx:4
- `PrintablePointsReport` (exported) @ src\components\PrintablePointsReport.jsx:4
- `ProtectedRoute` (exported) @ src\components\ProtectedRoute.jsx:7
- `RouteGenerator` (exported) @ src\components\RouteGenerator.jsx:12
- `RoutePlannerModal` (exported) @ src\components\RoutePlannerModal.jsx:12
- `SettingsManager` (exported) @ src\components\admin\SettingsManager.jsx:8
-->
