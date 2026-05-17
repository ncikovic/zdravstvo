# Schema Migration Audit — ADMIN→MANAGER + is_system_admin

Tracks all breaking changes from two DB schema updates:
1. New column: `users.is_system_admin TINYINT(1) NOT NULL DEFAULT 0`
2. Enum rename in `organization_users.role`: `ADMIN` → `MANAGER`

Check off each item as it is fixed.

---

## CONTRACTS

### `contracts/src/enums/index.ts`
- [ ] Line 8 — rename `ADMIN = 'ADMIN'` to `MANAGER = 'MANAGER'` in `OrganizationRole` enum

### `contracts/src/dtos/auth.dto.ts`
- [ ] Lines 5-16 (`AuthUserDto`) — add `isSystemAdmin: boolean`
- [ ] Lines 69-74 (`SelectableOrganizationMembershipDto`) — add `isSystemAdmin: boolean`
- [ ] Lines 76-84 (`AuthenticatedAuthResponseDto`) — add `isSystemAdmin: boolean`

### `contracts/src/dtos/dashboard/Dashboard.dto.ts`
- [ ] Line 138 — replace `OrganizationUserRole.ADMIN` with `OrganizationUserRole.MANAGER` in role type union

---

## BACKEND

### Auth entities & repositories

#### `backend/src/types/entities/auth.entities.ts`
- [ ] Lines 3-9 — add `isSystemAdmin: boolean` to `UserRecord`

#### `backend/src/repositories/auth.repository.ts`
- [ ] Lines 3-9 — add `isSystemAdmin: boolean` to `UserRecord` type (if duplicated here)
- [ ] Lines 88-96 (`mapUserRecord`) — read and map `is_system_admin` from DB row
- [ ] `findAuthenticatedContext` — handle system admins who have no `organization_users` row (must not throw/return null for them)

#### `backend/src/shared/utils/jwt.ts`
- [ ] Lines 9-14 — add `isSystemAdmin?: boolean` to `AccessTokenClaims`
- [ ] Lines 67-104 (`verifyAccessToken`) — propagate `isSystemAdmin` from token claims

#### `backend/src/shared/context/auth.context.ts`
- [ ] Lines 11-20 — add `isSystemAdmin: boolean` to `AuthenticatedRequestContext`

### Auth service — critical login blocker

#### `backend/src/services/auth.service.ts`
- [ ] Lines 322-329 (login) — make the "no org row" rejection conditional on `is_system_admin = 0`; system admins must be allowed through without an `organization_users` row
- [ ] Lines 205-227 (`mapAuthenticatedResponse`) / line ~211-216 (token gen) — embed `isSystemAdmin` in JWT payload
- [ ] Lines 344-355 (org selection token) — also carry `isSystemAdmin` in selection token
- [ ] Add explicit system admin login path: if `is_system_admin = 1`, skip org lookup entirely and issue token with `isSystemAdmin: true`, no `orgId`/`role`

### Auth middleware

#### `backend/src/shared/middleware/auth.middleware.ts`
- [ ] Lines 61-117 (`authenticateRequest`) — read `isSystemAdmin` from token first; if true, skip `organization_users` lookup entirely

#### `backend/src/shared/middleware/rbac.middleware.ts`
- [ ] Lines 11-25 (`requireRoles`) — add system admin bypass: if `isSystemAdmin: true` in context, skip all role checks

### Routes — `ADMIN` → `MANAGER` rename

#### `backend/src/routes/appointments.routes.ts`
- [ ] Line 21 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/appointmentTypes.routes.ts`
- [ ] Line 14 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 20 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/audit.routes.ts`
- [ ] Line 11 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/dashboard.routes.ts`
- [ ] Line 14 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/doctors.routes.ts`
- [ ] Line 25 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 29 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 33 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/organizations.routes.ts`
- [ ] Line 19 — `OrganizationUserRole.ADMIN` → `MANAGER`

### Services — `ADMIN` → `MANAGER` rename

#### `backend/src/services/appointments.service.ts`
- [ ] Line 106 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 112 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/services/dashboard.service.ts`
- [ ] Line 462 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 544 — `OrganizationUserRole.ADMIN` → `MANAGER`

### Seeds — `ADMIN` → `MANAGER` rename

#### `backend/seeds/20260421120000_demo_data.ts`
- [ ] Line 243 — `role: "ADMIN"` → `"MANAGER"`

#### `backend/seeds/20260421180000_full_reseed.ts`
- [ ] Line 151 — `role: "ADMIN"` → `"MANAGER"`

#### `backend/seeds/20260502120000_large_realistic_dataset.ts`
- [ ] Line 437 — `role: 'ADMIN'` → `'MANAGER'`

> `backend/seeds/20260517000000_croatian_healthcare_seed.ts` — already correct, no changes needed.

### Backend tests

#### `backend/tests/auth.service.test.ts`
- [ ] Line 288 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/tests/doctors.service.test.ts`
- [ ] Line 35 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/tests/rbac.middleware.test.ts`
- [ ] Line 51 — `ADMIN` → `MANAGER`
- [ ] Line 53 — `ADMIN` → `MANAGER`
- [ ] Line 63 — `ADMIN` → `MANAGER`
- [ ] Line 75 — `ADMIN` → `MANAGER`
- [ ] Line 87 — `ADMIN` → `MANAGER`

---

## FRONTEND

### Auth store

#### `frontend/src/stores/auth/auth.types.ts`
- [ ] Lines 9-15 (`AuthStateSnapshot`) — add `isSystemAdmin: boolean`

#### `frontend/src/stores/auth/auth.store.ts`
- [ ] Lines 9-15 — add `isSystemAdmin: null` to initial state
- [ ] Lines 17-25 (`mapAuthResponseToState`) — extract and store `isSystemAdmin` from auth response
- [ ] Lines 66-72 (auth validation) — treat `isSystemAdmin: true` with null `role`/`organizationId` as a valid authenticated state

### Routing / navigation / shell

#### `frontend/src/app/config/navigation.ts`
- [ ] Line 8 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 19 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 48 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 100 — `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Add system admin routes (no org context required)

#### `frontend/src/app/config/appShell.ts`
- [ ] Line 43 — `[OrganizationUserRole.ADMIN]:` key → `[OrganizationUserRole.MANAGER]:`
- [ ] Add shell config entry for `isSystemAdmin: true` case

### Pages & components

#### `frontend/src/pages/LoginPage.tsx`
- [ ] Lines ~41, 70-120 (`resolveRedirectPath`) — handle system admin case where `organizationId` is null; route to system admin dashboard instead of crashing

#### `frontend/src/pages/dashboard/DashboardPage.tsx`
- [ ] Line 96 — `role === OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 98 — `role === OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Add rendering path for `isSystemAdmin: true` (no org-scoped role)

### Service layer

#### `frontend/src/services/dashboard.service.ts`
- [ ] Line 107 — `dashboard.role === OrganizationUserRole.ADMIN` → `MANAGER`

#### `frontend/src/types/entities/Dashboard.entity.ts`
- [ ] Line 114 — role type union: `OrganizationUserRole.ADMIN` → `MANAGER`

### Frontend tests

#### `frontend/src/__tests__/pages/DashboardPage.test.tsx`
- [ ] Line 45 — mock uses `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 108 — mock uses `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 115 — mock uses `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 129 — mock uses `OrganizationUserRole.ADMIN` → `MANAGER`
- [ ] Line 143 — mock uses `OrganizationUserRole.ADMIN` → `MANAGER`

---

## Prioritized Fix Order

Fix phases in order to avoid cascading TypeScript errors:

| Phase | Files | Why first |
|---|---|---|
| **1 — Contracts** | `enums/index.ts`, `auth.dto.ts`, `Dashboard.dto.ts` | Everything in backend and frontend imports from here |
| **2 — Backend auth types** | `auth.entities.ts`, `auth.repository.ts`, `jwt.ts`, `auth.context.ts` | Foundational types used by service and middleware |
| **3 — Backend auth flow** | `auth.service.ts`, `auth.middleware.ts`, `rbac.middleware.ts` | Fixes the login blocker; depends on Phase 2 |
| **4 — Backend routes & services** | 6 route files, 2 service files | Simple rename, unblocked after Phase 1 |
| **5 — Seeds & backend tests** | 3 seed files, 3 test files | Not blocking but should be consistent |
| **6 — Frontend store** | `auth.types.ts`, `auth.store.ts` | Unblocked after contracts DTOs are updated |
| **7 — Frontend routing/shell** | `navigation.ts`, `appShell.ts` | Depends on store having `isSystemAdmin` |
| **8 — Frontend pages & services** | `LoginPage.tsx`, `DashboardPage.tsx`, `dashboard.service.ts`, `Dashboard.entity.ts` | Depends on store and routing |
| **9 — Frontend tests** | `DashboardPage.test.tsx` | Last; update mocks after pages are fixed |
