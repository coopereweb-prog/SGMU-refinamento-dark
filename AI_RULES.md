# AI Rules for SGUM Application Development

This document outlines the core technologies used in the SGUM application and provides clear guidelines for library usage to ensure consistency, maintainability, and adherence to best practices.

## Tech Stack Description

*   **Frontend Framework**: React for building interactive user interfaces.
*   **Language**: TypeScript for type safety and improved developer experience.
*   **Styling**: Tailwind CSS for utility-first styling, enabling rapid and consistent UI development.
*   **UI Components**: shadcn/ui, built on top of Radix UI primitives, for accessible and customizable UI components.
*   **Routing**: React Router for declarative navigation and managing application routes.
*   **Backend & Database**: Supabase, providing a PostgreSQL database, authentication, and serverless functions (Edge Functions).
*   **Form Management**: React Hook Form for efficient and flexible form handling, paired with Zod for schema validation.
*   **Mapping**: `@react-google-maps/api` for integrating Google Maps functionalities.
*   **Icons**: Lucide React for a comprehensive set of customizable SVG icons.
*   **Notifications**: Sonner for elegant and accessible toast notifications.
*   **Build Tool**: Vite for a fast development server and optimized production builds.

## Library Usage Rules

To maintain a consistent and efficient development workflow, please adhere to the following guidelines when choosing and using libraries:

*   **UI Components**: Always prioritize using components from the `shadcn/ui` library. If a specific component is not available or requires significant customization, create a new component within the `src/components/` directory. **Do not modify the original `shadcn/ui` component files located in `src/components/ui/`**.
*   **Styling**: All styling must be implemented using **Tailwind CSS classes**. Avoid inline styles or separate CSS files for component-specific styling, except for global styles defined in `src/index.css` or `src/App.css`.
*   **Routing**: Utilize **React Router** for all navigation within the application. All primary routes should be defined and managed within the `src/App.tsx` file.
*   **State Management**: For managing component-specific or local state, use React's built-in `useState` and `useContext` hooks.
*   **Backend Interactions**: All interactions with the database, authentication, and serverless functions must be handled through the **Supabase client library** and its associated functions (e.g., `supabase.from`, `supabase.auth`, `supabase.functions.invoke`).
*   **Forms and Validation**: For any form creation and management, use **React Hook Form**. For defining and validating form schemas, use **Zod**.
*   **Icons**: Integrate icons exclusively from the **Lucide React** library.
*   **Notifications**: For displaying user feedback messages (e.g., success, error, info toasts), use the **Sonner** library.
*   **Mapping**: For any map-related features, use the `@react-google-maps/api` library.
*   **File Structure**:
    *   All application source code resides in the `src/` directory.
    *   Top-level views or pages should be placed in `src/pages/`.
    *   Reusable UI elements and logical components should be organized within `src/components/`.
    *   Utility functions and Supabase client initialization should be in `src/lib/`.
*   **TypeScript**: All new files and modifications should adhere to TypeScript best practices, including explicit typing for props, state, and function arguments.