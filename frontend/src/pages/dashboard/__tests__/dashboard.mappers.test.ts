import { describe, expect, it } from 'vitest';

import { OrganizationUserRole } from '@zdravstvo/contracts';
import type {
  AdminReceptionDashboard,
  DashboardAppointment,
  DashboardFreeSlot,
  DoctorDashboard,
  PatientDashboard,
} from '@/types';

import {
  mapAdminReceptionDashboard,
  mapDoctorDashboard,
  mapPatientDashboard,
} from '../dashboard.mappers';

const makeAppointment = (
  overrides: Partial<DashboardAppointment> = {},
): DashboardAppointment => ({
  id: 'appt-1',
  startAt: new Date('2026-05-19T09:00:00.000Z'),
  endAt: new Date('2026-05-19T09:30:00.000Z'),
  status: 'CONFIRMED' as DashboardAppointment['status'],
  notes: null,
  cancellationReason: null,
  doctor: { id: 'doc-1', firstName: 'Marko', lastName: 'Marković', title: 'spec. interne medicine' },
  patient: { id: 'pat-1', firstName: 'Ana', lastName: 'Anić', dateOfBirth: null, oib: null },
  appointmentType: { id: 'type-1', name: 'Opći pregled', defaultDurationMinutes: 30 },
  ...overrides,
});

const makeAdminDashboard = (
  overrides: Partial<AdminReceptionDashboard> = {},
): AdminReceptionDashboard => ({
  generatedAt: new Date('2026-05-19T08:00:00.000Z'),
  todayStart: new Date('2026-05-19T00:00:00.000Z'),
  todayEnd: new Date('2026-05-19T23:59:59.000Z'),
  organization: { id: 'org-1', name: 'Poliklinika Zagreb', address: 'Ilica 1', city: 'Zagreb' },
  role: OrganizationUserRole.MANAGER,
  stats: {
    todayAppointmentCount: 5,
    activeDoctorCount: 3,
    recentPatientCount: 10,
    reminderCount: 2,
    completedAppointmentCount: 2,
    scheduledAppointmentCount: 3,
    cancelledAppointmentCount: 0,
    sentReminderCount: 1,
  },
  reminderSummary: { total: 2, pending: 1, sent: 1, failed: 0 },
  todaySchedule: [],
  availableSlots: [],
  recentActivity: [],
  ...overrides,
});

const makeDoctorDashboard = (
  overrides: Partial<DoctorDashboard> = {},
): DoctorDashboard => ({
  generatedAt: new Date('2026-05-19T08:00:00.000Z'),
  todayStart: new Date('2026-05-19T00:00:00.000Z'),
  todayEnd: new Date('2026-05-19T23:59:59.000Z'),
  organization: { id: 'org-1', name: 'Poliklinika Zagreb', address: null, city: null },
  role: OrganizationUserRole.DOCTOR,
  stats: {
    todayAppointmentCount: 4,
    patientsTodayCount: 4,
    freeBlockCount: 2,
    completedAppointmentCount: 1,
  },
  todaySchedule: [],
  nextAppointment: null,
  availableSlots: [],
  recentActivity: [],
  ...overrides,
});

const makePatientDashboard = (
  overrides: Partial<PatientDashboard> = {},
): PatientDashboard => ({
  generatedAt: new Date('2026-05-19T08:00:00.000Z'),
  todayStart: new Date('2026-05-19T00:00:00.000Z'),
  todayEnd: new Date('2026-05-19T23:59:59.000Z'),
  organization: { id: 'org-1', name: 'Poliklinika Zagreb', address: 'Ilica 1', city: 'Zagreb' },
  role: OrganizationUserRole.PATIENT,
  stats: { confirmedFutureAppointmentCount: 2, reminderCount: 1 },
  nextAppointment: null,
  upcomingAppointments: [],
  reminders: [],
  reminderSummary: { total: 1, pending: 1, sent: 0, failed: 0 },
  ...overrides,
});

describe('mapAdminReceptionDashboard', () => {
  it('produces 4 stat items', () => {
    const view = mapAdminReceptionDashboard(makeAdminDashboard());
    expect(view.stats).toHaveLength(4);
  });

  it('dateLabel is a non-empty string', () => {
    const view = mapAdminReceptionDashboard(makeAdminDashboard());
    expect(typeof view.dateLabel).toBe('string');
    expect(view.dateLabel.length).toBeGreaterThan(0);
  });

  it('maps empty todaySchedule to empty scheduleRows', () => {
    const view = mapAdminReceptionDashboard(makeAdminDashboard({ todaySchedule: [] }));
    expect(view.scheduleRows).toHaveLength(0);
  });

  it('maps a schedule appointment to an AdminScheduleRow with correct fields', () => {
    const appt = makeAppointment({ status: 'CONFIRMED' as DashboardAppointment['status'] });
    const view = mapAdminReceptionDashboard(makeAdminDashboard({ todaySchedule: [appt] }));
    const row = view.scheduleRows[0];

    expect(row).toBeDefined();
    expect(row?.patientName).toBe('Ana Anić');
    expect(row?.doctorName).toBe('dr. Marko Marković');
    expect(row?.type).toBe('Opći pregled');
    expect(row?.status).toBe('Potvrđeno');
  });

  it('maps COMPLETED appointment status to Obavljeno', () => {
    const appt = makeAppointment({ status: 'COMPLETED' as DashboardAppointment['status'] });
    const view = mapAdminReceptionDashboard(makeAdminDashboard({ todaySchedule: [appt] }));
    expect(view.scheduleRows[0]?.status).toBe('Obavljeno');
  });

  it('maps CANCELLED appointment status to Otkazano', () => {
    const appt = makeAppointment({ status: 'CANCELLED' as DashboardAppointment['status'] });
    const view = mapAdminReceptionDashboard(makeAdminDashboard({ todaySchedule: [appt] }));
    expect(view.scheduleRows[0]?.status).toBe('Otkazano');
  });

  it('maps NO_SHOW appointment status to Nije dosao', () => {
    const appt = makeAppointment({ status: 'NO_SHOW' as DashboardAppointment['status'] });
    const view = mapAdminReceptionDashboard(makeAdminDashboard({ todaySchedule: [appt] }));
    expect(view.scheduleRows[0]?.status).toBe('Nije došao');
  });

  it('empty availableSlots returns single placeholder CompactItem', () => {
    const view = mapAdminReceptionDashboard(makeAdminDashboard({ availableSlots: [] }));
    expect(view.availableSlots).toHaveLength(1);
    expect(view.availableSlots[0]?.title).toBe('Nema slobodnih termina');
  });

  it('produces 5 activityMetrics items', () => {
    const view = mapAdminReceptionDashboard(makeAdminDashboard());
    expect(view.activityMetrics).toHaveLength(5);
  });
});

describe('mapDoctorDashboard', () => {
  it('produces 4 stat items', () => {
    const view = mapDoctorDashboard(makeDoctorDashboard());
    expect(view.stats).toHaveLength(4);
  });

  it('empty recentActivity returns single placeholder CompactItem', () => {
    const view = mapDoctorDashboard(makeDoctorDashboard({ recentActivity: [] }));
    expect(view.activities).toHaveLength(1);
    expect(view.activities[0]?.title).toBe('Nema nedavnih aktivnosti');
  });

  it('nextPatient is null when nextAppointment is null', () => {
    const view = mapDoctorDashboard(makeDoctorDashboard({ nextAppointment: null }));
    expect(view.nextPatient).toBeNull();
  });

  it('nextPatient contains correct patient name when nextAppointment is set', () => {
    const appt = makeAppointment();
    const view = mapDoctorDashboard(makeDoctorDashboard({ nextAppointment: appt }));
    expect(view.nextPatient?.name).toBe('Ana Anić');
  });
});

describe('mapPatientDashboard', () => {
  it('produces 4 stat items', () => {
    const view = mapPatientDashboard(makePatientDashboard());
    expect(view.stats).toHaveLength(4);
  });

  it('nextAppointment is null when dashboard has no nextAppointment', () => {
    const view = mapPatientDashboard(makePatientDashboard({ nextAppointment: null }));
    expect(view.nextAppointment).toBeNull();
  });

  it('nextAppointment contains doctor name when set', () => {
    const appt = makeAppointment({ status: 'CONFIRMED' as DashboardAppointment['status'] });
    const view = mapPatientDashboard(makePatientDashboard({ nextAppointment: appt }));
    expect(view.nextAppointment?.doctorName).toBe('dr. Marko Marković');
  });

  it('empty reminders array returns single placeholder PatientReminder', () => {
    const view = mapPatientDashboard(makePatientDashboard({ reminders: [] }));
    expect(view.reminders).toHaveLength(1);
    expect(view.reminders[0]?.title).toBe('Nema aktivnih podsjetnika');
  });
});
