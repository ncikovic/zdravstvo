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
  AdminAuditPage,
} from '@/pages/admin';
import { DoctorOwnSchedulePage } from '@/pages/doctors/DoctorOwnSchedulePage';
import { BookAppointmentPage } from '@/pages/appointments/BookAppointmentPage';
import { ProfilePage } from '@/pages/patients/ProfilePage';

import {
  ProtectedRoute,
  PublicOnlyRoute,
  SystemAdminRoute,
  DoctorRoute,
  PatientRoute,
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

        {/* System admin routes */}
        <Route element={<SystemAdminRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.adminOrganizations} element={<AdminOrganizationsPage />} />
            <Route path={APP_ROUTES.adminUsers} element={<AdminUsersPage />} />
            <Route path={APP_ROUTES.adminAudit} element={<AdminAuditPage />} />
            <Route path={APP_ROUTES.settings} element={<SettingsPage />} />
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
            <Route path={APP_ROUTES.appointmentDetails} element={<AppointmentDetailsPage />} />
            <Route path={APP_ROUTES.cancelAppointment} element={<CancelAppointmentPage />} />
            <Route path={APP_ROUTES.changeAppointment} element={<ChangeAppointmentPage />} />
          </Route>
        </Route>

        {/* General protected routes (MANAGER, RECEPTION, DOCTOR share these where applicable) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={APP_ROUTES.schedule} element={<AppointmentsPage />} />
            <Route path={APP_ROUTES.appointments} element={<AppointmentsPage />} />
            <Route path={APP_ROUTES.createAppointment} element={<CreateAppointmentPage />} />
            <Route path={APP_ROUTES.changeAppointment} element={<ChangeAppointmentPage />} />
            <Route path={APP_ROUTES.cancelAppointment} element={<CancelAppointmentPage />} />
            <Route path={APP_ROUTES.appointmentDetails} element={<AppointmentDetailsPage />} />
            <Route path={APP_ROUTES.doctors} element={<DoctorsPage />} />
            <Route path={APP_ROUTES.doctorsCreate} element={<CreateDoctorPage />} />
            <Route path={APP_ROUTES.doctorDetails} element={<DoctorDetailsPage />} />
            <Route path={APP_ROUTES.doctorSchedule} element={<DoctorSchedulePage />} />
            <Route path={APP_ROUTES.doctorExceptions} element={<DoctorExceptionsPage />} />
            <Route path={APP_ROUTES.patients} element={<PatientsPage />} />
            <Route path={APP_ROUTES.patientsNew} element={<NewPatientPage />} />
            <Route path={APP_ROUTES.patientDetails} element={<PatientDetailsPage />} />
            <Route path={APP_ROUTES.patientEdit} element={<EditPatientPage />} />
            <Route path={APP_ROUTES.appointmentTypes} element={<AppointmentTypesPage />} />
            <Route path={APP_ROUTES.createAppointmentType} element={<CreateAppointmentTypePage />} />
            <Route path={APP_ROUTES.editAppointmentType} element={<EditAppointmentTypePage />} />
            <Route path={APP_ROUTES.audit} element={<AuditPage />} />
            <Route path={APP_ROUTES.settings} element={<SettingsPage />} />
            <Route path={APP_ROUTES.accessibility} element={<AccessibilityPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
