# Schema Migration Audit — ADMIN→MANAGER + is_system_admin

Tracks all breaking changes from two DB schema updates:
1. New column: `users.is_system_admin TINYINT(1) NOT NULL DEFAULT 0`
2. Enum rename in `organization_users.role`: `ADMIN` → `MANAGER`

Check off each item as it is fixed.

---

## CONTRACTS

### `contracts/src/enums/index.ts`
- [x] Line 8 — rename `ADMIN = 'ADMIN'` to `MANAGER = 'MANAGER'` in `OrganizationRole` enum

### `contracts/src/dtos/auth.dto.ts`
- [x] Lines 5-16 (`AuthUserDto`) — add `isSystemAdmin: boolean`
- [x] Lines 69-74 (`SelectableOrganizationMembershipDto`) — add `isSystemAdmin: boolean`
- [x] Lines 76-84 (`AuthenticatedAuthResponseDto`) — add `isSystemAdmin: boolean`, make `organizationId`, `orgUserId`, `role` nullable

### `contracts/src/dtos/dashboard/Dashboard.dto.ts`
- [x] Line 138 — replace `OrganizationUserRole.ADMIN` with `OrganizationUserRole.MANAGER` in role type union

---

## BACKEND

### Auth entities & repositories

#### `backend/src/types/entities/auth.entities.ts`
- [x] Lines 3-9 — add `isSystemAdmin: boolean` to `UserRecord`

#### `backend/src/repositories/users.repository.ts`
- [x] `UserRow` — add `is_system_admin: number | boolean`
- [x] `mapUserRecord` — map `is_system_admin` → `isSystemAdmin: Boolean(...)`
- [x] `findById`, `findByEmailOrPhone` — select `is_system_admin` from DB

#### `backend/src/repositories/auth.repository.ts`
- [x] `UserRow` — add `is_system_admin: number | boolean`
- [x] `mapUserRecord` — map `is_system_admin`
- [x] `findUserByEmail`, `findUserByPhone`, `findUserByEmailOrPhone` — select `is_system_admin`
- [x] `createUser` return value — set `isSystemAdmin: false` for new users
- [x] `findAuthenticatedContext` — no change needed; system admins skip this call entirely

#### `backend/src/shared/utils/jwt.ts`
- [x] Introduce `SystemAdminAccessTokenClaims` and `OrgScopedAccessTokenClaims` as a discriminated union for `AccessTokenClaims`
- [x] `verifyAccessToken` — branch on `isSystemAdmin: true` to return system admin claims without org fields

#### `backend/src/shared/context/auth.context.ts`
- [x] `AuthenticatedRequestContext` — add `isSystemAdmin: boolean`, make `role: OrganizationUserRole | null`

### Auth service — critical login blocker

#### `backend/src/services/auth.service.ts`
- [x] `mapAuthUser` — embed `isSystemAdmin` from `UserRecord`
- [x] `mapAuthenticatedResponse` — add `isSystemAdmin: false` to token and response
- [x] `mapSystemAdminAuthResponse` — new function; issues token with `isSystemAdmin: true`, no org fields
- [x] `login` — if `user.isSystemAdmin`, call `mapSystemAdminAuthResponse` and return early (skip org lookup)

### Auth middleware

#### `backend/src/shared/middleware/auth.middleware.ts`
- [x] System admin path: if `claims.isSystemAdmin`, fetch user via `UsersRepository`, verify active + still system admin, set `request.auth` with `isSystemAdmin: true` and empty org fields
- [x] Org-scoped path: unchanged logic; only reached when `claims.isSystemAdmin === false`

#### `backend/src/shared/middleware/rbac.middleware.ts`
- [x] `requireRoles` — check `auth.isSystemAdmin` first; if true, call `next()` immediately

### Routes — `ADMIN` → `MANAGER` rename

#### `backend/src/routes/appointments.routes.ts`
- [x] Line 21 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/appointmentTypes.routes.ts`
- [x] Lines 14, 20 — `OrganizationUserRole.ADMIN` → `MANAGER` (2×)

#### `backend/src/routes/audit.routes.ts`
- [x] Line 11 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/dashboard.routes.ts`
- [x] Line 14 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/routes/doctors.routes.ts`
- [x] Lines 25, 29, 33 — `OrganizationUserRole.ADMIN` → `MANAGER` (3×)

#### `backend/src/routes/organizations.routes.ts`
- [x] Line 19 — `OrganizationUserRole.ADMIN` → `MANAGER`

### Services — `ADMIN` → `MANAGER` rename

#### `backend/src/services/appointments.service.ts`
- [x] `SCHEDULING_ROLES` and `MANAGER_ROLES` — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/src/services/dashboard.service.ts`
- [x] Role check in `getCurrent` — `OrganizationUserRole.ADMIN` → `MANAGER`
- [x] Role cast in `getAdminReceptionDashboard` return — `OrganizationUserRole.ADMIN` → `MANAGER`

### Seeds — `ADMIN` → `MANAGER` rename

#### `backend/seeds/20260421120000_demo_data.ts`
- [x] Line 243 — `role: "ADMIN"` → `"MANAGER"`

#### `backend/seeds/20260421180000_full_reseed.ts`
- [x] Line 151 — `role: "ADMIN"` → `"MANAGER"`

#### `backend/seeds/20260502120000_large_realistic_dataset.ts`
- [x] Line 437 — `role: 'ADMIN'` → `'MANAGER'`

> `backend/seeds/20260517000000_croatian_healthcare_seed.ts` — already correct, no changes needed.

### Backend tests

#### `backend/tests/auth.service.test.ts`
- [x] Line 288 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/tests/doctors.service.test.ts`
- [x] Line 35 — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `backend/tests/rbac.middleware.test.ts`
- [x] Lines 51, 53, 63, 75, 87 — `ADMIN` → `MANAGER` (5×)
- [x] Added new test: "allows system admin regardless of required roles"

---

## FRONTEND

### Auth store

#### `frontend/src/stores/auth/auth.types.ts`
- [x] `AuthStateSnapshot` — add `isSystemAdmin: boolean | null`

#### `frontend/src/stores/auth/auth.store.ts`
- [x] `createUnauthenticatedState` — add `isSystemAdmin: null`
- [x] `mapAuthResponseToState` — extract and store `isSystemAdmin` from auth response
- [x] `isAuthenticatedState` helper — treats `isSystemAdmin: true` with valid token/user as authenticated (no role/orgId required)
- [x] `partialize` — include `isSystemAdmin` in persisted state

### Routing / navigation / shell

#### `frontend/src/app/config/navigation.ts`
- [x] Lines 8, 19, 48, 100 — `OrganizationUserRole.ADMIN` → `MANAGER` (4×)

#### `frontend/src/app/config/appShell.ts`
- [x] Config key — `[OrganizationUserRole.ADMIN]` → `[OrganizationUserRole.MANAGER]`
- [x] `roleLabel` — `'Administrator'` → `'Upravitelj'`

### Pages & components

#### `frontend/src/pages/LoginPage.tsx`
- [x] No changes needed — `resolveRedirectPath` uses `location.state`, not role/orgId. System admins navigate to `/` which hits `DashboardPage`, which now shows a placeholder for system admins.

#### `frontend/src/pages/dashboard/DashboardPage.tsx`
- [x] `isSystemAdmin` guard — added at top of render; shows a system admin placeholder before checking `role`
- [x] Lines 96, 98 — `OrganizationUserRole.ADMIN` → `MANAGER`

### Service layer

#### `frontend/src/services/dashboard.service.ts`
- [x] `isAdminReceptionDashboard` type guard — `OrganizationUserRole.ADMIN` → `MANAGER`

#### `frontend/src/types/entities/Dashboard.entity.ts`
- [x] `AdminReceptionDashboard.role` — `OrganizationUserRole.ADMIN` → `MANAGER`

### Frontend tests

#### `frontend/src/__tests__/pages/DashboardPage.test.tsx`
- [x] `adminDashboard` fixture role — `OrganizationUserRole.ADMIN` → `MANAGER`
- [x] All `mockRole(OrganizationUserRole.ADMIN)` calls — → `MANAGER`
- [x] `mockRole` helper — added optional `isSystemAdmin` parameter to supply both fields the page now reads

---

## Prioritized Fix Order (all complete)

| Phase | Files | Status |
|---|---|---|
| **1 — Contracts** | `enums/index.ts`, `auth.dto.ts`, `Dashboard.dto.ts` | ✅ Done |
| **2 — Backend auth types** | `auth.entities.ts`, `auth.repository.ts`, `users.repository.ts` | ✅ Done |
| **3 — Backend JWT + context** | `jwt.ts`, `auth.context.ts` | ✅ Done |
| **4 — Backend auth flow** | `auth.service.ts` | ✅ Done |
| **5 — Backend middleware** | `auth.middleware.ts`, `rbac.middleware.ts` | ✅ Done |
| **6 — Backend routes & services** | 6 route files, 2 service files | ✅ Done |
| **7 — Seeds & backend tests** | 3 seed files, 3 test files | ✅ Done |
| **8 — Frontend store** | `auth.types.ts`, `auth.store.ts` | ✅ Done |
| **9 — Frontend UI** | `navigation.ts`, `appShell.ts`, `LoginPage.tsx`, `DashboardPage.tsx`, `dashboard.service.ts`, `Dashboard.entity.ts`, `DashboardPage.test.tsx` | ✅ Done |
