# Test Writer Agent Playbook

## Mission
The Test Writer Agent is responsible for ensuring the reliability and stability of the SGMU-Nova-Odessa platform. It focuses on validating business logic in Supabase Edge Functions, ensuring UI consistency in React components, and verifying utility function correctness.

## Core Responsibilities
- **Edge Function Testing**: Validate Supabase Edge Functions (Deno/TypeScript) for API integrity.
- **Component Testing**: Verify React components behave correctly under various states (Auth, Loading, Data).
- **Utility Validation**: Ensure formatting, calculations, and mapping logic (BRL currency, Route optimization) are accurate.
- **Regression Prevention**: Create tests for fixed bugs to prevent re-emergence.

## Key Areas of Focus

### 1. Supabase Edge Functions (`/supabase/functions/`)
Crucial for backend logic like order creation, user invitations, and daily tasks.
- **Target**: `create-order`, `invite-user`, `send-completion-email`.
- **Workflow**: Mock the `supabase-js` client and Deno environment. Test success responses and error handling (401 Unauthorized, 400 Bad Request).

### 2. Utility Libraries (`src/lib/`)
The foundation of data processing in the app.
- **`utils.js`**: `formatCurrencyBRL` and `getOrderStatusProps`.
- **`maps-utils.js`**: Logic for `generateOptimizedRouteUrl`.
- **`image-utils.js`**: Image compression logic.

### 3. Auth & Routing (`src/components/`)
Ensures the security of the application.
- **Target**: `ProtectedRoute`, `GuestRoute`, `AuthRedirectHandler`.
- **Workflow**: Mock the `AuthContext` to simulate logged-in/logged-out states.

### 4. Complex UI Components (`src/components/`)
Interactive elements that handle complex state.
- **Target**: `RoutePlannerModal`, `OrderList`, `GlobalCart`, `SettingsManager`.

---

## Workflow: Writing a New Test

### Step 1: Context Gathering
- Identify if the target is a **Pure Function** (Unit Test), a **React Component** (Integration Test), or an **Edge Function** (API Test).
- Read the corresponding file to understand dependencies (e.g., `useCart`, `useAuth`, `supabase`).

### Step 2: Setup Fixtures
- Use standard mock data for "Orders", "Users", and "Products".
- Location: Create or update `src/tests/fixtures/` for reusable data.

### Step 3: Implement Tests
- **For Utils**: Use Vitest/Jest. Focus on boundary conditions (null values, empty strings).
- **For Components**: Use React Testing Library. Focus on user interactions (clicks, input changes) rather than implementation details.
- **For Edge Functions**: Use Deno's built-in test runner or Vitest for local simulation.

### Step 4: Verification
- Run the test suite.
- Ensure coverage for the specific module is > 80%.
- Check for "Leaking Tests" (tests that affect the global state).

---

## Best Practices

### 1. Naming Conventions
- Test files: `[filename].test.js` or `[filename].spec.js`.
- Test blocks: `describe('FunctionName', ...)` and `it('should [expected behavior] when [condition]')`.

### 2. Mocking Strategy
- **Supabase**: Always mock `supabase.from().select()` etc., to avoid hitting the real database.
- **Contexts**: Wrap components in necessary providers (`MapConfigProvider`, `AuthProvider`) during testing.
- **Images**: Mock `compressImage` to return a static Blob to speed up tests.

### 3. Domain-Specific Testing
- **Currency**: `formatCurrencyBRL` must be tested with integer and float inputs.
- **Routes**: `generateOptimizedRouteUrl` must be tested with varying numbers of coordinates.

---

## Repository Resource Map

### Key Directories
- `src/lib`: Logic to be unit tested.
- `src/components`: UI to be integration tested.
- `supabase/functions`: Backend logic to be API tested.
- `src/contexts`: Global state providers that need mocking in tests.

### Essential Files for Reference
- `src/lib/utils.js`: Common formatting logic.
- `src/lib/maps-utils.js`: Map and routing logic.
- `src/main.jsx`: Application entry point and provider hierarchy.

---

## Collaboration & Hand-off
- **When finished**: Provide a summary of the test coverage added.
- **Edge Cases**: Explicitly list any edge cases that were difficult to mock or require manual verification.
- **CI/CD**: Ensure the new tests are compatible with the project's Vercel/GitHub Actions pipeline.
