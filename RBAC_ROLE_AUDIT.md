# RBAC Role Audit

Date: 2026-05-19

This file records how the current codebase compares to the role/permission
screenshots provided by the product owner. It is written as an implementation
tracker for future AI agents and humans.

## Status Legend

- `[x]` Implemented and enforced in backend and/or frontend where relevant.
- `[~]` Partially implemented, incomplete, or enforced only in one layer.
- `[ ]` Not implemented.
- `[!]` Implemented incorrectly or creates an access-control risk.

## Source Of Truth From Screenshots

### System Admin

Global role, identified by `users.is_system_admin = 1`; no organization is
required. Bypasses organization checks.

Expected:

- Create, edit, deactivate organizations.
- Create users and assign them to any organization in any role.
- View all organizations and all data across organizations.
- Deactivate any user across any organization.
- Routes: `/admin/organizations`, `/admin/users`, `/admin/audit`, `/settings`.
- Post-login redirect: `/admin/organizations`.

### Manager

Organization-scoped admin role. Replaces the old `ADMIN` role.

Expected:

- Edit own organization settings.
- Add/deactivate doctors in own organization.
- Add/deactivate users of any role in own organization.
- Create, edit, deactivate appointment types.
- View all appointments across all doctors in own organization.
- View organization-scoped audit log.
- Cannot access other organizations' data.
- Routes: `/schedule`, `/patients`, `/appointment-types`, `/settings`,
  `/audit`, `/doctors`, `/users`.
- Post-login redirect: `/schedule`.
- Navbar: Schedule, Patients, Doctors, Appointment types, Users, Audit,
  Settings.

### Reception

Organization-scoped operational role.

Expected:

- Search, view, and create patients.
- Book, reschedule, cancel appointments for any patient.
- View daily and weekly schedule for all doctors.
- Select appointment type when booking.
- Cannot manage organization settings or users.
- Cannot manage appointment types.
- Cannot view audit log.
- Routes: `/schedule`, `/patients`.
- Post-login redirect: `/schedule`.
- Navbar: Schedule, Patients.

### Doctor

Organization-scoped role with read-only own schedule, except status updates.

Expected:

- View own daily and weekly schedule.
- View patient name, DOB, and contact for own appointments.
- See appointment type/reason for each slot.
- Mark appointment as `COMPLETED` or `NO_SHOW`.
- View own time-off entries.
- Cannot book, reschedule, or cancel appointments.
- Cannot see other doctors' schedules.
- Cannot see other patients' data.
- Route: `/doctor/schedule`.
- Post-login redirect: `/doctor/schedule`.
- Navbar: My schedule.

### Patient

Organization-scoped self-service role.

Expected:

- Register and manage own account/profile.
- Browse available slots for any doctor in own organization.
- Book appointment in a simple flow.
- Cancel own upcoming appointments.
- View own upcoming and past appointments.
- Cannot see other patients' data.
- Cannot see full doctor schedules.
- Cannot access staff pages.
- Routes: `/my-appointments`, `/book`, `/profile`.
- Post-login redirect: `/my-appointments`.
- Navbar: My appointments, Book appointment, Profile.

## Current Architecture Notes

- Role enum is in `contracts/src/enums/index.ts`.
- System admin is not an enum role. It is represented by
  `users.is_system_admin`.
- `backend/src/shared/middleware/auth.middleware.ts` builds the auth context.
  System admins get `organizationId: ""`, `organizationUserId: ""`, and
  `role: null`.
- `backend/src/shared/middleware/rbac.middleware.ts` implements
  `requireRoles(...)`.
- Important behavior: `requireRoles(...)` always allows system admins before
  checking role arguments. This means every route using `requireRoles` is also
  system-admin accessible unless the service/controller cannot work with the
  empty organization context.
- Frontend route guards are in `frontend/src/app/AuthRoutes.tsx`.
- Frontend route declarations are in `frontend/src/app/AppRoutes.tsx`.
- Frontend navigation items are in `frontend/src/app/config/navigation.ts`.

## Implementation Tracker

### Cross-Cutting

- [x] Role enum has `MANAGER`, `RECEPTION`, `DOCTOR`, `PATIENT`.
  - `contracts/src/enums/index.ts`
- [x] Migration adds `users.is_system_admin` and renames `ADMIN` to `MANAGER`.
  - `backend/migrations/20260517000000_add_system_admin_rename_manager.ts`
- [x] System admin login produces a token with `isSystemAdmin: true`.
  - `backend/src/services/auth.service.ts`
- [x] Auth middleware validates system admin against active user status and
  `users.is_system_admin`.
  - `backend/src/shared/middleware/auth.middleware.ts`
- [x] Auth middleware validates org-scoped membership activity, user status,
  role, and org-user id.
  - `backend/src/shared/middleware/auth.middleware.ts`
- [~] Frontend navigation matches expected sidebar links for most roles.
  - `frontend/src/app/config/navigation.ts`
  - Mismatch: manager "Users" currently links to `/settings`, not `/users`.
- [!] Frontend route access is too broad.
  - `ProtectedRoute` only checks authentication.
  - The generic protected route group exposes schedule, appointments, doctors,
    patients, appointment types, audit, settings, and accessibility to any
    authenticated role if they enter the URL.
  - Backend rejects many calls, but the route layer does not match the
    screenshots.

### System Admin

- [x] Post-login redirect to `/admin/organizations`.
  - `frontend/src/app/AuthRoutes.tsx`
- [x] Frontend system admin route group exists.
  - `frontend/src/app/AppRoutes.tsx`
- [x] Can create organizations through backend.
  - `POST /organizations`
  - `backend/src/routes/organizations.routes.ts`
- [x] Can list organizations through backend.
  - `GET /organizations`
  - Allowed because `requireRoles(MANAGER)` bypasses for system admin.
- [x] Can update organizations through backend.
  - `PATCH /organizations/:id`
  - Allowed because `requireRoles(MANAGER)` bypasses for system admin.
- [!] "Deactivate organization" is implemented as hard delete.
  - `backend/src/repositories/organizations.repository.ts`
  - The screenshot says deactivate. No active/inactive organization status was
    found.
- [ ] Create users and assign to any organization in any role.
  - `/admin/users` exists in frontend but is a placeholder.
  - No backend admin user-management routes were found.
- [ ] Deactivate any user across any organization.
  - No backend admin user-management route was found.
- [~] View all organizations is implemented.
- [ ] View all data across organizations is not generally implemented.
  - Most services require an organization-scoped context.
- [!] Global audit is not implemented correctly.
  - `/admin/audit` calls `/audit`.
  - `/audit` is org-scoped and reads `context.organizationId`.
  - System admin auth context has `organizationId: ""`, so this is not a true
    global audit view and may fail.

System admin follow-up tasks:

- [ ] Add explicit backend system-admin-only middleware or helper for global
  admin routes.
- [ ] Add organization soft-deactivation model if product means deactivate,
  not delete.
- [ ] Add global admin users API.
- [ ] Add global audit API, separate from org audit.
- [ ] Decide whether system admin should access org-scoped operational APIs
  directly or only through global admin APIs.

### Manager

- [x] Post-login redirect to `/schedule`.
  - `frontend/src/app/AuthRoutes.tsx`
- [x] Backend can manage doctors in own auth context.
  - `POST /doctors`, `PATCH /doctors/:id`
  - `backend/src/routes/doctors.routes.ts`
  - `backend/src/services/doctors.service.ts`
- [x] Doctor deactivate/reactivate exists via `isActive`.
  - `PATCH /doctors/:id`
- [x] Backend can manage doctor working hours/time off.
  - `PUT /doctors/:id/working-hours`
  - `POST /doctors/:id/time-off`
  - `DELETE /doctors/:id/time-off/:timeOffId`
- [x] Backend can manage appointment types.
  - `POST /appointment-types`
  - `PUT /appointment-types/:id`
  - `DELETE /appointment-types/:id`
- [x] Appointment type deactivate is represented by `isActive`.
  - `contracts/src/dtos/appointment-types/*`
  - `backend/src/services/appointmentTypes.service.ts`
- [x] Backend can view all appointments across all doctors in own org.
  - `backend/src/services/appointments.service.ts`
- [x] Backend can view org-scoped audit log.
  - `GET /audit`
- [!] Manager can access and update other organizations through organization
  routes.
  - `GET /organizations` returns all organizations.
  - `GET /organizations/:id` accepts arbitrary `id`.
  - `PATCH /organizations/:id` accepts arbitrary `id`.
  - Controller does not compare the requested organization id to
    `request.auth.organizationId`.
- [ ] Add/deactivate users of any role in own organization.
  - No generic org user-management API was found.
  - Doctors can be added/deactivated, and patients can be created/deleted, but
    this does not cover "users any role".
- [~] Frontend manager navigation mostly matches.
  - Missing real `/users` route.
  - Users nav item points to `/settings`.
- [!] Frontend direct route access is broader than manager/reception/doctor
  expectations because of the generic `ProtectedRoute` group.

Manager follow-up tasks:

- [ ] Restrict manager organization read/update to `context.organizationId`.
- [ ] Add manager org-user management API and UI.
- [ ] Add frontend role-specific route guards for manager-only routes.
- [ ] Add tests for cross-organization access denial.

### Reception

- [x] Post-login redirect to `/schedule`.
  - `frontend/src/app/AuthRoutes.tsx`
- [x] Backend can list/search/view/create patients in own org.
  - `GET /patients`
  - `GET /patients/:id`
  - `POST /patients`
- [x] Backend can book appointments for any patient in own org.
  - `POST /appointments`
- [x] Backend can reschedule appointments for any patient in own org.
  - `PATCH /appointments/:id/schedule`
- [x] Backend can cancel appointments for any patient in own org.
  - `PATCH /appointments/:id/cancel`
- [x] Backend can select appointment type when booking.
  - `appointmentTypeId` is required in appointment create payload.
- [x] Backend can view all doctors' schedule via appointment listing.
- [x] Backend blocks appointment type management.
  - `POST/PUT/DELETE /appointment-types` are manager-only.
- [x] Backend blocks audit.
  - `/audit` is manager-only.
- [x] Backend blocks doctor management.
  - `POST/PATCH /doctors` are manager-only.
- [x] Backend blocks organization settings update.
  - `/organizations/:id` update is manager-only.
- [~] Frontend nav matches expected Schedule + Patients.
- [!] Frontend direct routes still expose more pages than expected.
  - Reception can load URLs like `/appointment-types`, `/audit`, or `/settings`
    in the UI route tree, though backend calls should fail.

Reception follow-up tasks:

- [ ] Add frontend role guard for reception routes.
- [ ] Ensure `/schedule` supports both daily and weekly view as product expects.

### Doctor

- [x] Post-login redirect to `/doctor/schedule`.
  - `frontend/src/app/AuthRoutes.tsx`
- [x] Frontend doctor-only route exists.
  - `/doctor/schedule`
- [x] Backend appointment list is scoped to own doctor id.
  - `buildListFilters` forces `filters.doctorUserId = context.userId`.
- [x] Backend appointment detail visibility is restricted to own appointments.
  - `ensureAppointmentIsVisible`
- [x] Backend can mark own appointment as `COMPLETED` or `NO_SHOW`.
  - `PATCH /appointments/:id/status`
  - Service rejects doctor updates on appointments for other doctors.
- [x] Backend blocks doctor booking.
  - `POST /appointments` does not allow `DOCTOR`.
- [x] Backend blocks doctor cancellation.
  - `PATCH /appointments/:id/cancel` does not allow `DOCTOR`.
- [!] Backend allows doctor rescheduling of own appointments.
  - `PATCH /appointments/:id/schedule` has no role-specific route guard.
  - `ensureUpdateAccess` allows visible appointments, so doctors can reschedule
    their own appointments.
  - This violates "Cannot book or cancel appointments" and the status-only
    schedule view requirement.
- [!] Backend allows doctors to read other doctors' profiles, working hours,
  and time-off entries in the same org.
  - `GET /doctors`
  - `GET /doctors/:id`
  - `GET /doctors/:id/working-hours`
  - `GET /doctors/:id/time-off`
  - This conflicts with "Cannot see other doctors' schedules."
- [x] Backend blocks patient list access.
  - `GET /patients` is manager/reception only.
- [x] Backend blocks arbitrary patient detail access.
  - `GET /patients/:id` does not allow `DOCTOR`.
- [~] Doctor can view patient info attached to own appointments.
  - Appointment DTO includes patient name, DOB, and OIB.
  - Contact fields were not visible in `AppointmentResponseDto`.
- [~] Doctor can view own time-off only indirectly.
  - Backend has `/doctors/:id/time-off`, but it is not self-scoped for doctor.
  - Frontend `/doctor/schedule` did not appear to show time-off entries.

Doctor follow-up tasks:

- [ ] Restrict `PATCH /appointments/:id/schedule` to manager/reception/patient,
  then ensure patient can only reschedule own appointment.
- [ ] Limit doctor access to `/doctors/me` and own working-hours/time-off, or
  remove doctor access from broad doctor routes.
- [ ] Add doctor self time-off view to `/doctor/schedule`, if required.
- [ ] Add tests that doctors cannot reschedule appointments.
- [ ] Add tests that doctors cannot read other doctors' working hours/time off.

### Patient

- [x] Registration creates a patient membership in the selected/default org.
  - `backend/src/services/auth.service.ts`
- [x] Post-login redirect to `/my-appointments`.
  - `frontend/src/app/AuthRoutes.tsx`
- [x] Patient-only routes exist.
  - `/my-appointments`, `/book`, `/profile`
- [x] Backend appointment listing is scoped to own patient id.
  - `buildListFilters` forces `filters.patientUserId = context.userId`.
- [x] Backend appointment detail visibility is restricted to own appointments.
  - `ensureAppointmentIsVisible`
- [x] Backend can browse available slots for doctors in own organization.
  - `GET /appointments/available-slots`
- [x] Backend can book own appointment.
  - `ensureCreateAccess` requires `payload.patientId === context.userId`.
- [x] Backend can cancel own appointment.
  - `ensureUpdateAccess` allows own appointment only.
- [x] Backend can reschedule own appointment.
  - `PATCH /appointments/:id/schedule`
- [x] Backend can view/update own patient profile by id.
  - `GET /patients/:id`
  - `PUT /patients/:id`
- [x] Backend blocks patient list access.
  - `GET /patients` is manager/reception only.
- [x] Backend blocks other patient detail/update access.
  - Patient id must equal `context.userId`.
- [x] Backend blocks staff appointment type management.
  - `POST/PUT/DELETE /appointment-types` are manager-only.
- [x] Backend blocks audit.
  - `/audit` is manager-only.
- [!] Backend allows patients to read doctor profiles, working hours, and
  time-off entries for doctors in the org.
  - This may exceed "Cannot see full doctor schedules."
- [!] Frontend direct route access still exposes staff URLs through the generic
  protected route group, although backend calls should fail.
- [~] Accessibility requirements exist globally.
  - `frontend/src/styles/accessibility.css`
  - `frontend/src/pages/accessibility/AccessibilityPage.tsx`
  - Needs product review to confirm patient booking has large buttons, font
    scale control, high contrast toggle, simplified mode, and max four steps.

Patient follow-up tasks:

- [ ] Restrict patient access to doctor schedule metadata. Prefer available
  slots API over full working-hours/time-off APIs.
- [ ] Add frontend role guards so patients cannot load staff pages.
- [ ] Verify booking flow accessibility requirements against screenshots.

## Backend Route Permission Matrix

Current backend behavior:

| Endpoint | System Admin | Manager | Reception | Doctor | Patient | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /organizations` | Yes | No | No | No | No | System-admin-only via `requireRoles()` with no args. |
| `GET /organizations` | Yes | Yes | No | No | No | Manager sees all orgs: mismatch. |
| `GET /organizations/:id` | Yes | Yes | No | No | No | Manager can request arbitrary org id: mismatch. |
| `PATCH /organizations/:id` | Yes | Yes | No | No | No | Manager can update arbitrary org id: critical mismatch. |
| `DELETE /organizations/:id` | Yes | No | No | No | No | Hard delete, not deactivate. |
| `GET /patients` | Yes | Yes | Yes | No | No | System admin may fail semantically due empty org context. |
| `GET /patients/:id` | Yes | Yes | Yes | No | Own only | Patient ownership enforced in service. |
| `POST /patients` | Yes | Yes | Yes | No | No | System admin may fail semantically due empty org context. |
| `PUT /patients/:id` | Yes | Yes | Yes | No | Own only | Patient ownership enforced in service. |
| `DELETE /patients/:id` | Yes | Yes | Yes | No | No | Screenshot does not explicitly mention reception delete/deactivate. |
| `GET /doctors` | Yes | Yes | Yes | Yes | Yes | Too broad for doctor/patient. |
| `GET /doctors/:id` | Yes | Yes | Yes | Yes | Yes | Too broad for doctor/patient. |
| `POST /doctors` | Yes | Yes | No | No | No | Manager add doctor implemented. |
| `PATCH /doctors/:id` | Yes | Yes | No | No | No | Manager deactivate doctor implemented through `isActive`. |
| `GET /doctors/me` | Yes | No | No | Yes | No | System admin bypass may fail because no org context. |
| `PATCH /doctors/me` | Yes | No | No | Yes | No | System admin bypass may fail because no org context. |
| `GET /doctors/:id/working-hours` | Yes | Yes | Yes | Yes | Yes | Too broad for doctor/patient. |
| `PUT /doctors/:id/working-hours` | Yes | Yes | No | No | No | Manager schedule management. |
| `GET /doctors/:id/time-off` | Yes | Yes | Yes | Yes | Yes | Too broad for doctor/patient. |
| `POST /doctors/:id/time-off` | Yes | Yes | No | No | No | Manager-only. |
| `DELETE /doctors/:id/time-off/:timeOffId` | Yes | Yes | No | No | No | Manager-only. |
| `GET /appointment-types` | Yes | Yes | Yes | Yes | Yes | Required for booking, but patient/doctor broad read may be acceptable. |
| `POST /appointment-types` | Yes | Yes | No | No | No | Manager-only plus system admin bypass. |
| `PUT /appointment-types/:id` | Yes | Yes | No | No | No | Manager-only plus system admin bypass. |
| `DELETE /appointment-types/:id` | Yes | Yes | No | No | No | Manager-only plus system admin bypass. |
| `GET /appointments` | Yes | All own/role-scoped | All own/role-scoped | Own doctor | Own patient | System admin likely fails due empty org context. |
| `GET /appointments/:id` | Yes | Org visible | Org visible | Own doctor | Own patient | Service visibility enforced. |
| `GET /appointments/available-slots` | Yes | Yes | Yes | Own doctor constraint | Yes | Doctors constrained to own doctor id. |
| `POST /appointments` | Yes | Yes | Yes | No | Own patient only | Patient ownership enforced. |
| `PATCH /appointments/:id/schedule` | Yes | Yes | Yes | Own doctor allowed | Own patient allowed | Doctor access is a mismatch. |
| `PATCH /appointments/:id/status` | Yes | Yes | Yes | Own doctor only | No | Matches doctor status update. |
| `PATCH /appointments/:id/cancel` | Yes | Yes | Yes | No | Own patient only | Matches. |
| `GET /audit` | Yes | Yes | No | No | No | System admin global audit mismatch. |
| `GET /dashboard` | Yes | Yes | Yes | Yes | Yes | System admin likely forbidden in service because role is null. |

## Recommended Fix Order

1. Fix manager cross-organization access.
   - Highest security risk.
   - Add tests for `GET/PATCH /organizations/:id` using another org id.
2. Fix frontend role route guards.
   - Prevent accidental access to wrong pages and reduce confusing API errors.
3. Block doctor appointment rescheduling.
   - Add backend route/service tests.
4. Add or explicitly defer system admin user management.
   - Current `/admin/users` is a placeholder.
5. Add global audit or make `/admin/audit` clearly unavailable until backed by
   a global endpoint.
6. Narrow doctor/patient access to doctor working-hours/time-off APIs.
7. Decide and implement "deactivate organization" semantics.

## Suggested Test Additions

- Manager cannot read/update an organization that is not `context.organizationId`.
- Reception cannot load/update organization settings.
- Reception cannot create/update/delete appointment types.
- Doctor cannot call `PATCH /appointments/:id/schedule`.
- Doctor cannot read another doctor's working hours or time off.
- Patient cannot read doctor working hours or time off directly.
- Patient cannot read/update another patient profile.
- System admin can list global audit logs once a global audit endpoint exists.
- System admin can create/deactivate users once user-management API exists.

