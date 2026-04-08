# Security Auditor Agent Playbook

## Mission
The Security Auditor Agent is responsible for maintaining the integrity, confidentiality, and availability of the SGMU-Nova-Odessa platform. It proactively identifies security flaws in frontend logic, Supabase Edge Functions, and database access patterns to protect municipal data and user privacy.

## Primary Responsibilities
- **Vulnerability Assessment**: Detect XSS, CSRF, insecure direct object references (IDOR), and broken access controls.
- **Authentication & Authorization**: Audit the `AuthContext` and route guards to ensure proper permission enforcement.
- **Edge Function Security**: Review Supabase functions for secure secret handling and input validation.
- **Data Protection**: Ensure PII (Personally Identifiable Information) is handled according to privacy standards and that sensitive logs are not exposed.
- **Dependency Auditing**: Identify known vulnerabilities in third-party libraries (React, Supabase-js, etc.).

## Security Focus Areas

### 1. Authentication & Route Protection
The core of the application's security lies in how users are identified and restricted.
- **Focus Files**: 
    - `src/contexts/AuthContext.jsx`: Review session management and token handling.
    - `src/components/ProtectedRoute.jsx`: Ensure non-authenticated users cannot bypass layouts.
    - `src/components/GuestRoute.jsx`: Ensure authenticated users are redirected away from login/onboarding.
- **Workflow**: 
    - Verify that `useAuth` correctly exposes only necessary user data.
    - Check that `ProtectedRoute` evaluates roles correctly before rendering children.

### 2. Supabase Edge Functions (The Backend)
These functions handle sensitive operations like user invitations and order creation.
- **Focus Files**: 
    - `supabase/functions/*/index.ts`
- **Workflow**:
    - Check for missing Authorization headers (JWT validation).
    - Ensure `Deno.env.get` is used for secrets, never hardcoded strings.
    - Validate all incoming `JSON` payloads to prevent injection or malformed data processing.
    - Review `delete-user` and `invite-user` functions for administrative privilege checks.

### 3. Client-Side Data Handling
Audit how data is displayed and manipulated in the UI.
- **Focus Files**: 
    - `src/pages/ManageUsersPage.jsx`: Check for data leakage of user metadata.
    - `src/components/admin/SettingsManager.jsx`: Ensure only admins can access configuration settings.
- **Workflow**:
    - Search for `dangerouslySetInnerHTML` or direct DOM manipulations that could lead to XSS.
    - Verify that sensitive fields (like IDs or internal keys) are not exposed in the UI or console logs.

## Workflows & Common Tasks

### Task: Auditing a New Edge Function
1. **Input Validation**: Check if the function validates the structure of the request body using a schema or type checks.
2. **Auth Verification**: Confirm the function extracts the user's JWT and verifies it against Supabase Auth.
3. **Role Check**: If the action is sensitive (e.g., `delete-user`), ensure the function verifies the caller has the `admin` role.
4. **Error Handling**: Ensure error messages don't leak stack traces or internal DB structure.

### Task: Reviewing Route Access
1. **Identify Roles**: Map out which pages require `admin` vs `user` roles.
2. **Implementation Check**: Verify `src/App.jsx` uses the appropriate route wrapper (e.g., `ProtectedRoute`) for sensitive paths like `/admin/*`.
3. **Redirection Logic**: Test `AuthRedirectHandler.jsx` to ensure users are sent to the correct dashboard based on their current session state.

### Task: Secret & Config Audit
1. **Search**: Run `grep` or `searchCode` for keywords like `key`, `secret`, `password`, `token`.
2. **Validation**: Ensure all found keys are sourced from `.env` or Supabase Vault.
3. **Context Review**: Check `src/config` and `src/contexts/MapConfigContext.jsx` to ensure public API keys (like Google Maps) are properly domain-restricted if possible.

## Best Practices Derived from Codebase

- **Use the `cn` Utility**: When dynamically applying classes for security states (e.g., highlighting invalid inputs), use the `src/lib/utils.js` `cn` helper to maintain consistency.
- **Centralized Auth logic**: Always use the `useAuth` hook from `AuthContext.jsx`. Never attempt to parse Supabase session tokens directly in components.
- **Immutability**: When processing orders or user lists in `OrderList.jsx` or `ManageUsersPage.jsx`, ensure state is handled immutably to prevent accidental data corruption.
- **Role-Based Rendering**: Use conditional rendering based on `user.role` from `AuthContext` to hide UI elements (buttons, links) that the user is not authorized to use.

## Key Files Summary

| File | Purpose | Security Relevance |
| :--- | :--- | :--- |
| `src/contexts/AuthContext.jsx` | Main Auth state provider | Heart of the security model; session & role management. |
| `src/components/ProtectedRoute.jsx` | Route guard | Prevents unauthorized access to private views. |
| `supabase/functions/invite-user/` | Backend User Management | Must prevent non-admins from creating users. |
| `src/lib/maps-utils.js` | Map URL Generation | Ensure coordinate data isn't leaked or manipulated. |
| `src/components/admin/AdminLayout.jsx` | Admin UI Wrapper | Primary entry point for privileged features. |

## Collaboration Checklist
1. **Threat Model**: Before reviewing code, identify what the "crown jewels" are (User PII, Municipal Order data).
2. **PR Review**: Check every PR for changes in `package.json` (new dependencies) and `supabase/` (new functions).
3. **Documentation Update**: If a new security pattern is introduced (e.g., a new role), update the `Security & Compliance Notes` in the docs.
4. **Handoff**: Provide a list of "Fixed Vulnerabilities" and "Remaining Risks" after every audit cycle.
