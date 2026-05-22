import type { ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components';
import {
  AccessDeniedPage,
  AccessibilityPage,
  AccountCreatedPage,
  AppointmentDetailsPage,
  AppointmentTypesPage,
  AppointmentsPage,
  AuditPage,
  NotificationsPage,
  CancelAppointmentPage,
  ChangeAppointmentPage,
  ConfirmEmailPage,
  CreateAppointmentTypePage,
  CreateAppointmentPage,
  CreateDoctorPage,
  DashboardPage,
  DoctorDetailsPage,
  MyAppointmentsPage,
  DoctorExceptionsPage,
  DoctorSchedulePage,
  DoctorsPage,
  EditAppointmentTypePage,
  ForgotPasswordPage,
  LoginPage,
  NotFoundPage,
  PatientsPage,
  NewPatientPage,
  EditPatientPage,
  PatientDetailsPage,
  SettingsPage,
} from '@/pages';
import {
  AdminOrganizationsPage,
  AdminUsersPage,
  ManageAdminUserPage,
  AdminAuditPage,
} from '@/pages/admin';
import { DoctorOwnSchedulePage } from '@/pages/doctors/DoctorOwnSchedulePage';
import { BookAppointmentPage } from '@/pages/appointments/BookAppointmentPage';
import { ProfilePage } from '@/pages/patients/ProfilePage';
import { InternalPlaceholderPage } from '@/pages/InternalPlaceholderPage';

import {
  DoctorRoute,
  ManagerOrSystemAdminRoute,
  ManagerReceptionRoute,
  ManagerRoute,
  OrganizationDashboardRoute,
  PatientRoute,
  PublicOnlyRoute,
  ScheduleActionRoute,
  SystemAdminRoute,
} from './AuthRoutes';
import { APP_ROUTES } from './routes';

export function AppRoutes(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_ROUTES.accountCreated} element={<AccountCreatedPage />} />
        <Route path={APP_ROUTES.confirmEmail} element={<ConfirmEmailPage />} />
        <Route path={APP_ROUTES.forbidden} element={<AccessDeniedPage />} />
        <Route path={APP_ROUTES.notFound} element={<NotFoundPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path={APP_ROUTES.login} element={<LoginPage />} />
          <Route
            path={APP_ROUTES.register}
            element={<LoginPage initialStep="organizationSelection" />}
          />
          <Route path={APP_ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        </Route>

        {/* System-admin-only routes */}
        <Route element={<SystemAdminRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.adminOrganizations} element={<AdminOrganizationsPage />} />
            <Route path={APP_ROUTES.adminUsers} element={<AdminUsersPage />} />
            <Route path={APP_ROUTES.adminUserManage} element={<ManageAdminUserPage />} />
            <Route path={APP_ROUTES.adminAudit} element={<AdminAuditPage />} />
          </Route>
        </Route>

        {/* Settings: system admin and manager */}
        <Route element={<ManagerOrSystemAdminRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.settings} element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Dashboard: all organization roles */}
        <Route element={<OrganizationDashboardRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Manager-only routes */}
        <Route element={<ManagerRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.audit} element={<AuditPage />} />
            <Route path={APP_ROUTES.doctors} element={<DoctorsPage />} />
            <Route path={APP_ROUTES.doctorsCreate} element={<CreateDoctorPage />} />
            <Route path={APP_ROUTES.doctorDetails} element={<DoctorDetailsPage />} />
            <Route path={APP_ROUTES.doctorSchedule} element={<DoctorSchedulePage />} />
            <Route path={APP_ROUTES.doctorExceptions} element={<DoctorExceptionsPage />} />
            <Route path={APP_ROUTES.appointmentTypes} element={<AppointmentTypesPage />} />
            <Route path={APP_ROUTES.createAppointmentType} element={<CreateAppointmentTypePage />} />
            <Route path={APP_ROUTES.editAppointmentType} element={<EditAppointmentTypePage />} />
            <Route
              path={APP_ROUTES.users}
              element={
                <InternalPlaceholderPage
                  title="Korisnici"
                  description="Upravljanje korisnicima organizacije bit će dostupno ovdje."
                  icon="users"
                />
              }
            />
            <Route path={APP_ROUTES.accessibility} element={<AccessibilityPage />} />
          </Route>
        </Route>

        {/* Manager + Reception routes */}
        <Route element={<ManagerReceptionRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.notifications} element={<NotificationsPage />} />
            <Route path={APP_ROUTES.schedule} element={<AppointmentsPage />} />
            <Route path={APP_ROUTES.appointments} element={<AppointmentsPage />} />
            <Route path={APP_ROUTES.createAppointment} element={<CreateAppointmentPage />} />
            <Route path={APP_ROUTES.patients} element={<PatientsPage />} />
            <Route path={APP_ROUTES.patientsNew} element={<NewPatientPage />} />
            <Route path={APP_ROUTES.patientDetails} element={<PatientDetailsPage />} />
            <Route path={APP_ROUTES.patientEdit} element={<EditPatientPage />} />
          </Route>
        </Route>

        {/* Appointment detail actions: manager, reception, and patient */}
        <Route element={<ScheduleActionRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.appointmentDetails} element={<AppointmentDetailsPage />} />
            <Route path={APP_ROUTES.changeAppointment} element={<ChangeAppointmentPage />} />
            <Route path={APP_ROUTES.cancelAppointment} element={<CancelAppointmentPage />} />
          </Route>
        </Route>

        {/* Doctor-only routes */}
        <Route element={<DoctorRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.doctorOwnSchedule} element={<DoctorOwnSchedulePage />} />
          </Route>
        </Route>

        {/* Patient-only routes */}
        <Route element={<PatientRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.myAppointments} element={<MyAppointmentsPage />} />
            <Route path={APP_ROUTES.book} element={<BookAppointmentPage />} />
            <Route path={APP_ROUTES.profile} element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
