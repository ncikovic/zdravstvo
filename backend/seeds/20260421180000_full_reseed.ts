import bcrypt from "bcrypt";
import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

import { uuidToBuffer } from "../src/shared/utils/uuid.js";

const PASSWORD = "Demo1234!";
const PASSWORD_SALT_ROUNDS = 12;

const toBinaryUuid = (value: string): Buffer => uuidToBuffer(value);
const newUuid = (): string => uuidv4();

const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60 * 1000);

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const utcDate = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date => new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

const dateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const deleteExistingData = async (knex: Knex): Promise<void> => {
  await knex("user_accessibility_settings").del();
  await knex("activity_log").del();
  await knex("appointment_reminders").del();
  await knex("appointments").del();
  await knex("appointment_types").del();
  await knex("doctor_time_off").del();
  await knex("doctor_working_hours").del();
  await knex("organization_doctors").del();
  await knex("doctor_profiles").del();
  await knex("patient_profiles").del();
  await knex("organization_users").del();
  await knex("users").del();
  await knex("organizations").del();
};

export async function seed(knex: Knex): Promise<void> {
  await deleteExistingData(knex);

  const passwordHash = await bcrypt.hash(PASSWORD, PASSWORD_SALT_ROUNDS);
  const organizationId = newUuid();

  const adminUserId = newUuid();
  const receptionUserId = newUuid();
  const doctorUserId = newUuid();
  const secondDoctorUserId = newUuid();
  const patientUserId = newUuid();
  const secondPatientUserId = newUuid();
  const thirdPatientUserId = newUuid();

  const adminOrgUserId = newUuid();
  const receptionOrgUserId = newUuid();
  const doctorOrgUserId = newUuid();
  const secondDoctorOrgUserId = newUuid();
  const patientOrgUserId = newUuid();
  const secondPatientOrgUserId = newUuid();
  const thirdPatientOrgUserId = newUuid();

  const firstExamTypeId = newUuid();
  const followUpTypeId = newUuid();
  const phoneConsultationTypeId = newUuid();
  const preventiveExamTypeId = newUuid();

  const firstAppointmentId = newUuid();
  const secondAppointmentId = newUuid();
  const thirdAppointmentId = newUuid();
  const fourthAppointmentId = newUuid();
  const fifthAppointmentId = newUuid();

  const firstAppointmentStart = utcDate(2026, 4, 22, 8, 30);
  const secondAppointmentStart = utcDate(2026, 4, 23, 10, 0);
  const thirdAppointmentStart = utcDate(2026, 4, 24, 13, 30);
  const fourthAppointmentStart = utcDate(2026, 4, 17, 9, 15);
  const fifthAppointmentStart = utcDate(2026, 4, 20, 15, 0);

  await knex("organizations").insert({
    id: toBinaryUuid(organizationId),
    name: "Poliklinika Zdravstvo Centar",
    address: "Ilica 87",
    city: "Zagreb",
    phone: "+385 1 555 0100",
    email: "kontakt@zdravstvo-centar.test",
    timezone: "Europe/Zagreb",
  });

  await knex("users").insert([
    {
      id: toBinaryUuid(adminUserId),
      email: "admin@zdravstvo-demo.test",
      phone: "+385 91 100 0001",
      password_hash: passwordHash,
      status: "ACTIVE",
    },
    {
      id: toBinaryUuid(receptionUserId),
      email: "recepcija@zdravstvo-demo.test",
      phone: "+385 91 100 0002",
      password_hash: passwordHash,
      status: "ACTIVE",
    },
    {
      id: toBinaryUuid(doctorUserId),
      email: "dr.ana.horvat@zdravstvo-demo.test",
      phone: "+385 91 100 0003",
      password_hash: passwordHash,
      status: "ACTIVE",
    },
    {
      id: toBinaryUuid(secondDoctorUserId),
      email: "dr.marko.kovac@zdravstvo-demo.test",
      phone: "+385 91 100 0004",
      password_hash: passwordHash,
      status: "ACTIVE",
    },
    {
      id: toBinaryUuid(patientUserId),
      email: "petra.novak@zdravstvo-demo.test",
      phone: "+385 91 100 0005",
      password_hash: passwordHash,
      status: "ACTIVE",
    },
    {
      id: toBinaryUuid(secondPatientUserId),
      email: "ivan.maric@zdravstvo-demo.test",
      phone: "+385 91 100 0006",
      password_hash: passwordHash,
      status: "ACTIVE",
    },
    {
      id: toBinaryUuid(thirdPatientUserId),
      email: "lucija.babic@zdravstvo-demo.test",
      phone: "+385 91 100 0007",
      password_hash: passwordHash,
      status: "ACTIVE",
    },
  ]);

  await knex("organization_users").insert([
    {
      id: toBinaryUuid(adminOrgUserId),
      organization_id: toBinaryUuid(organizationId),
      user_id: toBinaryUuid(adminUserId),
      role: "ADMIN",
      is_active: true,
    },
    {
      id: toBinaryUuid(receptionOrgUserId),
      organization_id: toBinaryUuid(organizationId),
      user_id: toBinaryUuid(receptionUserId),
      role: "RECEPTION",
      is_active: true,
    },
    {
      id: toBinaryUuid(doctorOrgUserId),
      organization_id: toBinaryUuid(organizationId),
      user_id: toBinaryUuid(doctorUserId),
      role: "DOCTOR",
      is_active: true,
    },
    {
      id: toBinaryUuid(secondDoctorOrgUserId),
      organization_id: toBinaryUuid(organizationId),
      user_id: toBinaryUuid(secondDoctorUserId),
      role: "DOCTOR",
      is_active: true,
    },
    {
      id: toBinaryUuid(patientOrgUserId),
      organization_id: toBinaryUuid(organizationId),
      user_id: toBinaryUuid(patientUserId),
      role: "PATIENT",
      is_active: true,
    },
    {
      id: toBinaryUuid(secondPatientOrgUserId),
      organization_id: toBinaryUuid(organizationId),
      user_id: toBinaryUuid(secondPatientUserId),
      role: "PATIENT",
      is_active: true,
    },
    {
      id: toBinaryUuid(thirdPatientOrgUserId),
      organization_id: toBinaryUuid(organizationId),
      user_id: toBinaryUuid(thirdPatientUserId),
      role: "PATIENT",
      is_active: true,
    },
  ]);

  await knex("doctor_profiles").insert([
    {
      user_id: toBinaryUuid(doctorUserId),
      first_name: "Ana",
      last_name: "Horvat",
      title: "spec. obiteljske medicine",
      license_number: "HR-OM-24017",
      bio: "Lijecnica s iskustvom u obiteljskoj medicini, preventivnim pregledima i pracenju kronickih bolesti.",
    },
    {
      user_id: toBinaryUuid(secondDoctorUserId),
      first_name: "Marko",
      last_name: "Kovac",
      title: "spec. interne medicine",
      license_number: "HR-IM-31542",
      bio: "Internist usmjeren na kardiometabolicku prevenciju, kontrolne preglede i savjetovanje pacijenata.",
    },
  ]);

  await knex("patient_profiles").insert([
    {
      user_id: toBinaryUuid(patientUserId),
      first_name: "Petra",
      last_name: "Novak",
      date_of_birth: dateOnly(utcDate(1988, 3, 14)),
      oib: "12345678901",
      address: "Tratinska ulica 23, Zagreb",
      emergency_contact_name: "Maja Novak",
      emergency_contact_phone: "+385 98 200 0101",
    },
    {
      user_id: toBinaryUuid(secondPatientUserId),
      first_name: "Ivan",
      last_name: "Maric",
      date_of_birth: dateOnly(utcDate(1976, 9, 2)),
      oib: "12345678902",
      address: "Radnicka cesta 45, Zagreb",
      emergency_contact_name: "Ana Maric",
      emergency_contact_phone: "+385 98 200 0102",
    },
    {
      user_id: toBinaryUuid(thirdPatientUserId),
      first_name: "Lucija",
      last_name: "Babic",
      date_of_birth: dateOnly(utcDate(2001, 11, 27)),
      oib: "12345678903",
      address: "Maksimirska cesta 112, Zagreb",
      emergency_contact_name: "Tomislav Babic",
      emergency_contact_phone: "+385 98 200 0103",
    },
  ]);

  await knex("organization_doctors").insert([
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(doctorUserId),
      is_active: true,
    },
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(secondDoctorUserId),
      is_active: true,
    },
  ]);

  await knex("doctor_working_hours").insert([
    ...[1, 2, 3, 4, 5].map((dayOfWeek) => ({
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(doctorUserId),
      day_of_week: dayOfWeek,
      start_time: "08:00:00",
      end_time: "14:00:00",
      is_off: false,
    })),
    ...[1, 2, 3, 4, 5].map((dayOfWeek) => ({
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(secondDoctorUserId),
      day_of_week: dayOfWeek,
      start_time: "12:00:00",
      end_time: "18:00:00",
      is_off: false,
    })),
  ]);

  await knex("doctor_time_off").insert([
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(doctorUserId),
      start_at: utcDate(2026, 5, 7, 8, 0),
      end_at: utcDate(2026, 5, 8, 16, 0),
      reason: "Strucno usavrsavanje",
    },
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(secondDoctorUserId),
      start_at: utcDate(2026, 5, 14, 12, 0),
      end_at: utcDate(2026, 5, 14, 18, 0),
      reason: "Godisnji odmor",
    },
  ]);

  await knex("appointment_types").insert([
    {
      id: toBinaryUuid(firstExamTypeId),
      organization_id: toBinaryUuid(organizationId),
      name: "Prvi pregled",
      default_duration_minutes: 45,
      is_active: true,
    },
    {
      id: toBinaryUuid(followUpTypeId),
      organization_id: toBinaryUuid(organizationId),
      name: "Kontrolni pregled",
      default_duration_minutes: 30,
      is_active: true,
    },
    {
      id: toBinaryUuid(phoneConsultationTypeId),
      organization_id: toBinaryUuid(organizationId),
      name: "Telefonske konzultacije",
      default_duration_minutes: 15,
      is_active: true,
    },
    {
      id: toBinaryUuid(preventiveExamTypeId),
      organization_id: toBinaryUuid(organizationId),
      name: "Preventivni pregled",
      default_duration_minutes: 40,
      is_active: true,
    },
  ]);

  await knex("appointments").insert([
    {
      id: toBinaryUuid(firstAppointmentId),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(doctorUserId),
      patient_user_id: toBinaryUuid(patientUserId),
      appointment_type_id: toBinaryUuid(firstExamTypeId),
      start_at: firstAppointmentStart,
      end_at: addMinutes(firstAppointmentStart, 45),
      status: "SCHEDULED",
      created_by_org_user_id: toBinaryUuid(receptionOrgUserId),
      updated_by_org_user_id: null,
      cancellation_reason: null,
      notes: "Pacijent dolazi na prvi pregled i donosi starije nalaze.",
    },
    {
      id: toBinaryUuid(secondAppointmentId),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(doctorUserId),
      patient_user_id: toBinaryUuid(secondPatientUserId),
      appointment_type_id: toBinaryUuid(followUpTypeId),
      start_at: secondAppointmentStart,
      end_at: addMinutes(secondAppointmentStart, 30),
      status: "SCHEDULED",
      created_by_org_user_id: toBinaryUuid(receptionOrgUserId),
      updated_by_org_user_id: null,
      cancellation_reason: null,
      notes: "Kontrola tlaka i dogovor oko nastavka terapije.",
    },
    {
      id: toBinaryUuid(thirdAppointmentId),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(secondDoctorUserId),
      patient_user_id: toBinaryUuid(thirdPatientUserId),
      appointment_type_id: toBinaryUuid(preventiveExamTypeId),
      start_at: thirdAppointmentStart,
      end_at: addMinutes(thirdAppointmentStart, 40),
      status: "SCHEDULED",
      created_by_org_user_id: toBinaryUuid(adminOrgUserId),
      updated_by_org_user_id: null,
      cancellation_reason: null,
      notes: "Preventivni pregled prije sportskih aktivnosti.",
    },
    {
      id: toBinaryUuid(fourthAppointmentId),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(secondDoctorUserId),
      patient_user_id: toBinaryUuid(secondPatientUserId),
      appointment_type_id: toBinaryUuid(phoneConsultationTypeId),
      start_at: fourthAppointmentStart,
      end_at: addMinutes(fourthAppointmentStart, 15),
      status: "COMPLETED",
      created_by_org_user_id: toBinaryUuid(receptionOrgUserId),
      updated_by_org_user_id: toBinaryUuid(secondDoctorOrgUserId),
      cancellation_reason: null,
      notes: "Telefonski dogovorena kontrola laboratorijskih nalaza.",
    },
    {
      id: toBinaryUuid(fifthAppointmentId),
      organization_id: toBinaryUuid(organizationId),
      doctor_user_id: toBinaryUuid(doctorUserId),
      patient_user_id: toBinaryUuid(thirdPatientUserId),
      appointment_type_id: toBinaryUuid(followUpTypeId),
      start_at: fifthAppointmentStart,
      end_at: addMinutes(fifthAppointmentStart, 30),
      status: "CANCELLED",
      created_by_org_user_id: toBinaryUuid(receptionOrgUserId),
      updated_by_org_user_id: toBinaryUuid(receptionOrgUserId),
      cancellation_reason: "Pacijent je zatrazio novi termin.",
      notes: "Termin otkazan na zahtjev pacijenta.",
    },
  ]);

  await knex("appointment_reminders").insert([
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      appointment_id: toBinaryUuid(firstAppointmentId),
      channel: "SMS",
      scheduled_for: addDays(firstAppointmentStart, -1),
      sent_at: null,
      status: "PENDING",
      attempt_count: 0,
      last_error: null,
    },
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      appointment_id: toBinaryUuid(secondAppointmentId),
      channel: "EMAIL",
      scheduled_for: addDays(secondAppointmentStart, -1),
      sent_at: null,
      status: "PENDING",
      attempt_count: 0,
      last_error: null,
    },
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      appointment_id: toBinaryUuid(fourthAppointmentId),
      channel: "SMS",
      scheduled_for: addDays(fourthAppointmentStart, -1),
      sent_at: addDays(fourthAppointmentStart, -1),
      status: "SENT",
      attempt_count: 1,
      last_error: null,
    },
  ]);

  await knex("activity_log").insert([
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      actor_org_user_id: toBinaryUuid(receptionOrgUserId),
      entity_type: "APPOINTMENT",
      action: "CREATE",
      entity_id: toBinaryUuid(firstAppointmentId),
      metadata: JSON.stringify({ status: "SCHEDULED", source: "full-reseed" }),
      created_at: addMinutes(firstAppointmentStart, -90),
    },
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      actor_org_user_id: toBinaryUuid(secondDoctorOrgUserId),
      entity_type: "APPOINTMENT",
      action: "STATUS_CHANGE",
      entity_id: toBinaryUuid(fourthAppointmentId),
      metadata: JSON.stringify({ from: "SCHEDULED", to: "COMPLETED" }),
      created_at: addMinutes(fourthAppointmentStart, 20),
    },
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      actor_org_user_id: toBinaryUuid(receptionOrgUserId),
      entity_type: "APPOINTMENT",
      action: "CANCEL",
      entity_id: toBinaryUuid(fifthAppointmentId),
      metadata: JSON.stringify({ reason: "Pacijent je zatrazio novi termin." }),
      created_at: addMinutes(fifthAppointmentStart, -180),
    },
    {
      id: toBinaryUuid(newUuid()),
      organization_id: toBinaryUuid(organizationId),
      actor_org_user_id: toBinaryUuid(adminOrgUserId),
      entity_type: "PATIENT",
      action: "CREATE",
      entity_id: toBinaryUuid(patientUserId),
      metadata: JSON.stringify({ source: "full-reseed" }),
      created_at: utcDate(2026, 4, 15, 9, 0),
    },
  ]);

  await knex("user_accessibility_settings").insert([
    {
      user_id: toBinaryUuid(adminUserId),
      font_scale: 1.0,
      high_contrast: false,
      simple_mode: false,
      voice_confirmations: false,
    },
    {
      user_id: toBinaryUuid(receptionUserId),
      font_scale: 1.0,
      high_contrast: false,
      simple_mode: false,
      voice_confirmations: true,
    },
    {
      user_id: toBinaryUuid(doctorUserId),
      font_scale: 1.0,
      high_contrast: false,
      simple_mode: false,
      voice_confirmations: false,
    },
    {
      user_id: toBinaryUuid(secondDoctorUserId),
      font_scale: 1.1,
      high_contrast: false,
      simple_mode: false,
      voice_confirmations: false,
    },
    {
      user_id: toBinaryUuid(patientUserId),
      font_scale: 1.2,
      high_contrast: true,
      simple_mode: true,
      voice_confirmations: true,
    },
    {
      user_id: toBinaryUuid(secondPatientUserId),
      font_scale: 1.0,
      high_contrast: false,
      simple_mode: false,
      voice_confirmations: false,
    },
    {
      user_id: toBinaryUuid(thirdPatientUserId),
      font_scale: 1.0,
      high_contrast: false,
      simple_mode: true,
      voice_confirmations: false,
    },
  ]);
}
