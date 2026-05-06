import type { ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components';
import {
  AccessDeniedPage,
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
  DoctorExceptionsPage,
  DoctorSchedulePage,
  DoctorsPage,
  EditAppointmentTypePage,
  ForgotPasswordPage,
  InternalPlaceholderPage,
  LoginPage,
  NotFoundPage,
  PatientsPage,
  NewPatientPage,
  EditPatientPage,
  PatientDetailsPage,
  SettingsPage,
} from '@/pages';
import type { AppIconName } from '@/types';

import { ProtectedRoute, PublicOnlyRoute } from './AuthRoutes';
import { APP_ROUTES } from './routes';

interface InternalRouteDefinition {
  path: string;
  title: string;
  description: string;
  icon: AppIconName;
}

const INTERNAL_PLACEHOLDER_ROUTES: readonly InternalRouteDefinition[] = [
  {
    path: APP_ROUTES.schedule,
    title: 'Moj raspored',
    description: 'Raspored liječnika bit će izdvojen iz dnevnog pregleda na nadzornoj ploči.',
    icon: 'calendarCheck',
  },
  {
    path: APP_ROUTES.myAppointments,
    title: 'Moji termini',
    description: 'Pacijentov popis termina bit će prikazan na zasebnoj stranici.',
    icon: 'calendar',
  },
  {
    path: APP_ROUTES.accessibility,
    title: 'Pristupacnost',
    description: 'Postavke pristupačnosti bit će dostupne bez utjecaja na zdravstvene podatke.',
    icon: 'accessibility',
  },
];

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
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={APP_ROUTES.appointments} element={<AppointmentsPage />} />
            <Route path={APP_ROUTES.createAppointment} element={<CreateAppointmentPage />} />
            <Route path={APP_ROUTES.changeAppointment} element={<ChangeAppointmentPage />} />
            <Route path={APP_ROUTES.cancelAppointment} element={<CancelAppointmentPage />} />
            <Route path={APP_ROUTES.appointmentDetails} element={<AppointmentDetailsPage />} />
            <Route path={APP_ROUTES.doctors} element={<DoctorsPage />} />
            <Route path={APP_ROUTES.doctorsCreate} element={<CreateDoctorPage />} />
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
            {INTERNAL_PLACEHOLDER_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <InternalPlaceholderPage
                    title={route.title}
                    description={route.description}
                    icon={route.icon}
                  />
                }
              />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
