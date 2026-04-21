import bcrypt from "bcrypt";
import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

import { uuidToBuffer } from "../src/shared/utils/uuid.js";

const DEMO_PASSWORD = "Demo1234!";
const PASSWORD_SALT_ROUNDS = 12;

const firstNamesFemale = [
  "Ana",
  "Petra",
  "Ivana",
  "Marija",
  "Lucija",
  "Nina",
  "Maja",
  "Katarina",
  "Tea",
  "Dora",
  "Lea",
  "Mia",
  "Sara",
  "Iva",
  "Lana",
  "Ema",
  "Paula",
  "Martina",
  "Jelena",
  "Tena",
];

const firstNamesMale = [
  "Luka",
  "Ivan",
  "Marko",
  "Josip",
  "Filip",
  "Matej",
  "David",
  "Karlo",
  "Petar",
  "Ante",
  "Nikola",
  "Tin",
  "Lovro",
  "Roko",
  "Dino",
  "Borna",
  "Leon",
  "Vito",
  "Stjepan",
  "Tomislav",
];

const lastNames = [
  "Horvat",
  "Novak",
  "Kovac",
  "Babic",
  "Maric",
  "Juric",
  "Vidovic",
  "Pavlovic",
  "Bozic",
  "Knezevic",
  "Peric",
  "Matijevic",
  "Grgic",
  "Simic",
  "Lovric",
  "Rukavina",
  "Kolar",
  "Vukovic",
  "Jakic",
  "Radic",
  "Boric",
  "Milic",
  "Barisic",
  "Skoric",
  "Kralj",
];

const streets = [
  "Ilica",
  "Vukovarska ulica",
  "Radnicka cesta",
  "Savska cesta",
  "Maksimirska cesta",
  "Ulica grada Vukovara",
  "Heinzelova ulica",
  "Zvonimirova ulica",
  "Palmoticeva ulica",
  "Teslina ulica",
  "Meduliceva ulica",
  "Tratinska ulica",
  "Dubrovacka avenija",
  "Osjecka ulica",
  "Splitska ulica",
];

const appointmentNotes = [
  "Pacijent dolazi na dogovoreni termin, bez posebnih napomena.",
  "Potrebno provjeriti prethodne nalaze i terapiju.",
  "Kontrolni pregled nakon promjene terapije.",
  "Pacijent je trazio jutarnji termin zbog posla.",
  "Uputiti pacijenta na dodatnu laboratorijsku obradu ako bude potrebno.",
  "Ponijeti nalaze starije od sest mjeseci radi usporedbe.",
  "Kratak administrativni upit prije pregleda.",
  "Pacijent preferira SMS podsjetnik dan prije termina.",
];

const organizations = [
  {
    name: "Poliklinika Centar Zagreb",
    address: "Ilica 42",
    city: "Zagreb",
    phone: "+385 1 4812 300",
    email: "info@poliklinika-centar.test",
  },
  {
    name: "Dom zdravlja Maksimir",
    address: "Maksimirska cesta 128",
    city: "Zagreb",
    phone: "+385 1 2334 810",
    email: "kontakt@dz-maksimir.test",
  },
  {
    name: "Ordinacija Jarun",
    address: "Hrgovici 61",
    city: "Zagreb",
    phone: "+385 1 3099 224",
    email: "ordinacija@jarun.test",
  },
  {
    name: "Poliklinika Split Riva",
    address: "Obala hrvatskog narodnog preporoda 10",
    city: "Split",
    phone: "+385 21 344 908",
    email: "info@split-riva.test",
  },
];

const appointmentTypeTemplates = [
  ["Prvi pregled", 45],
  ["Kontrolni pregled", 30],
  ["Telefonske konzultacije", 15],
  ["Laboratorijska obrada", 20],
  ["Preventivni pregled", 40],
  ["Hitni pregled", 30],
] as const;

const doctorTitles = [
  "spec. obiteljske medicine",
  "spec. interne medicine",
  "spec. pedijatrije",
  "spec. dermatologije",
  "spec. ginekologije",
  "spec. kardiologije",
];

type Row = Record<string, unknown>;

interface OrgSeed {
  id: string;
  staffOrgUserIds: string[];
  doctors: string[];
  patients: string[];
  appointmentTypes: Array<{ id: string; duration: number }>;
}

const id = () => uuidv4();
const bin = (value: string) => uuidToBuffer(value);
const pick = <T>(items: readonly T[], index: number) =>
  items[index % items.length];
const pad = (value: number, size = 2) => String(value).padStart(size, "0");

const dateAtUtc = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
) => new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);

const batchInsert = async (knex: Knex, tableName: string, rows: Row[]) => {
  if (rows.length === 0) {
    return;
  }

  await knex.batchInsert(tableName, rows, 250);
};

export async function seed(knex: Knex): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, PASSWORD_SALT_ROUNDS);
  const now = new Date();

  const orgRows: Row[] = [];
  const userRows: Row[] = [];
  const orgUserRows: Row[] = [];
  const patientRows: Row[] = [];
  const doctorRows: Row[] = [];
  const orgDoctorRows: Row[] = [];
  const workingHourRows: Row[] = [];
  const timeOffRows: Row[] = [];
  const appointmentTypeRows: Row[] = [];
  const appointmentRows: Row[] = [];
  const reminderRows: Row[] = [];
  const activityRows: Row[] = [];
  const accessibilityRows: Row[] = [];
  const orgSeeds: OrgSeed[] = [];

  organizations.forEach((organization, orgIndex) => {
    const organizationId = id();
    const orgSeed: OrgSeed = {
      id: organizationId,
      staffOrgUserIds: [],
      doctors: [],
      patients: [],
      appointmentTypes: [],
    };

    orgRows.push({
      id: bin(organizationId),
      name: organization.name,
      address: organization.address,
      city: organization.city,
      phone: organization.phone,
      email: organization.email,
      timezone: "Europe/Zagreb",
    });

    const staffMembers = [
      {
        role: "ADMIN",
        firstName: "Admin",
        lastName: organization.city,
        email: `admin.${orgIndex + 1}@zdravstvo-demo.test`,
        phone: `+385 91 700 ${pad(orgIndex + 1, 3)}`,
      },
      {
        role: "RECEPTION",
        firstName: pick(firstNamesFemale, orgIndex + 3),
        lastName: pick(lastNames, orgIndex + 7),
        email: `recepcija.${orgIndex + 1}@zdravstvo-demo.test`,
        phone: `+385 91 710 ${pad(orgIndex + 1, 3)}`,
      },
      {
        role: "RECEPTION",
        firstName: pick(firstNamesMale, orgIndex + 8),
        lastName: pick(lastNames, orgIndex + 12),
        email: `frontdesk.${orgIndex + 1}@zdravstvo-demo.test`,
        phone: `+385 91 720 ${pad(orgIndex + 1, 3)}`,
      },
    ];

    staffMembers.forEach((staff, staffIndex) => {
      const userId = id();
      const orgUserId = id();

      userRows.push({
        id: bin(userId),
        email: staff.email,
        phone: staff.phone,
        password_hash: passwordHash,
        status: "ACTIVE",
      });

      orgUserRows.push({
        id: bin(orgUserId),
        organization_id: bin(organizationId),
        user_id: bin(userId),
        role: staff.role,
        is_active: true,
      });

      accessibilityRows.push({
        user_id: bin(userId),
        font_scale: staffIndex === 0 ? 1.0 : 1.1,
        high_contrast: staffIndex === 2,
        simple_mode: false,
        voice_confirmations: staffIndex === 1,
      });

      orgSeed.staffOrgUserIds.push(orgUserId);
    });

    doctorTitles.forEach((title, doctorIndex) => {
      const userId = id();
      const orgUserId = id();
      const firstName =
        doctorIndex % 2 === 0
          ? pick(firstNamesFemale, orgIndex * 4 + doctorIndex)
          : pick(firstNamesMale, orgIndex * 5 + doctorIndex);
      const lastName = pick(lastNames, orgIndex * 6 + doctorIndex);

      userRows.push({
        id: bin(userId),
        email: `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${orgIndex + 1}@zdravstvo-demo.test`,
        phone: `+385 92 ${pad(orgIndex + 1)}${pad(doctorIndex + 1)} ${pad(doctorIndex * 37 + 120, 3)}`,
        password_hash: passwordHash,
        status: "ACTIVE",
      });

      doctorRows.push({
        user_id: bin(userId),
        first_name: firstName,
        last_name: lastName,
        title,
        license_number: `HR-${orgIndex + 1}${pad(doctorIndex + 1)}-${pad(2800 + orgIndex * 70 + doctorIndex)}`,
        bio: `${firstName} ${lastName} je ${title} s iskustvom u ambulantnom radu, preventivi i pracenju kronickih pacijenata.`,
      });

      orgUserRows.push({
        id: bin(orgUserId),
        organization_id: bin(organizationId),
        user_id: bin(userId),
        role: "DOCTOR",
        is_active: true,
      });

      orgDoctorRows.push({
        id: bin(id()),
        organization_id: bin(organizationId),
        doctor_user_id: bin(userId),
        is_active: true,
      });

      for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek += 1) {
        const startsEarly = (doctorIndex + dayOfWeek) % 2 === 0;

        workingHourRows.push({
          id: bin(id()),
          organization_id: bin(organizationId),
          doctor_user_id: bin(userId),
          day_of_week: dayOfWeek,
          start_time: startsEarly ? "08:00:00" : "12:00:00",
          end_time: startsEarly ? "14:00:00" : "18:00:00",
          is_off: false,
        });
      }

      if (doctorIndex % 3 === 0) {
        const startAt = addDays(
          dateAtUtc(2026, 5, 4 + orgIndex, 9),
          doctorIndex,
        );

        timeOffRows.push({
          id: bin(id()),
          organization_id: bin(organizationId),
          doctor_user_id: bin(userId),
          start_at: startAt,
          end_at: addDays(startAt, 2),
          reason: "Edukacija i strucno usavrsavanje",
        });
      }

      accessibilityRows.push({
        user_id: bin(userId),
        font_scale: 1.0,
        high_contrast: doctorIndex === 4,
        simple_mode: false,
        voice_confirmations: false,
      });

      orgSeed.doctors.push(userId);
    });

    appointmentTypeTemplates.forEach(([name, duration]) => {
      const appointmentTypeId = id();

      appointmentTypeRows.push({
        id: bin(appointmentTypeId),
        organization_id: bin(organizationId),
        name,
        default_duration_minutes: duration,
        is_active: true,
      });

      orgSeed.appointmentTypes.push({ id: appointmentTypeId, duration });
    });

    for (let patientIndex = 0; patientIndex < 45; patientIndex += 1) {
      const userId = id();
      const isFemale = patientIndex % 2 === 0;
      const firstName = isFemale
        ? pick(firstNamesFemale, patientIndex + orgIndex)
        : pick(firstNamesMale, patientIndex + orgIndex);
      const lastName = pick(lastNames, patientIndex * 2 + orgIndex);
      const birthYear = 1948 + ((patientIndex * 7 + orgIndex * 3) % 57);
      const birthMonth = 1 + ((patientIndex + orgIndex) % 12);
      const birthDay = 1 + ((patientIndex * 3 + orgIndex) % 27);
      const phoneSuffix = pad(orgIndex + 1) + pad(patientIndex + 1, 3);

      userRows.push({
        id: bin(userId),
        email: `pacijent.${orgIndex + 1}.${pad(patientIndex + 1)}@zdravstvo-demo.test`,
        phone: `+385 95 ${phoneSuffix} ${pad(100 + patientIndex * 11, 3)}`,
        password_hash: passwordHash,
        status: patientIndex % 41 === 0 ? "DISABLED" : "ACTIVE",
      });

      patientRows.push({
        user_id: bin(userId),
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOnly(dateAtUtc(birthYear, birthMonth, birthDay)),
        oib: `${orgIndex + 1}${pad(patientIndex + 1, 4)}${pad(730000 + patientIndex * 97 + orgIndex, 6)}`,
        address: `${pick(streets, patientIndex + orgIndex)} ${1 + ((patientIndex * 5) % 144)}, ${organization.city}`,
        emergency_contact_name: `${pick(firstNamesFemale, patientIndex + 4)} ${pick(lastNames, patientIndex + 9)}`,
        emergency_contact_phone: `+385 98 ${pad(orgIndex + 1)}${pad(patientIndex + 200, 3)} ${pad(300 + patientIndex, 3)}`,
      });

      orgUserRows.push({
        id: bin(id()),
        organization_id: bin(organizationId),
        user_id: bin(userId),
        role: "PATIENT",
        is_active: patientIndex % 41 !== 0,
      });

      accessibilityRows.push({
        user_id: bin(userId),
        font_scale: patientIndex % 10 === 0 ? 1.2 : 1.0,
        high_contrast: patientIndex % 17 === 0,
        simple_mode: patientIndex % 13 === 0,
        voice_confirmations: patientIndex % 19 === 0,
      });

      orgSeed.patients.push(userId);
    }

    orgSeeds.push(orgSeed);
  });

  orgSeeds.forEach((orgSeed, orgIndex) => {
    let appointmentCount = 0;

    for (let dayOffset = -90; dayOffset <= 60; dayOffset += 1) {
      const baseDate = addDays(dateAtUtc(2026, 4, 21, 0), dayOffset);
      const dayOfWeek = baseDate.getUTCDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      orgSeed.doctors.forEach((doctorUserId, doctorIndex) => {
        const slotsPerDay = (doctorIndex + dayOffset + 200) % 3 === 0 ? 2 : 1;

        for (let slotIndex = 0; slotIndex < slotsPerDay; slotIndex += 1) {
          if ((dayOffset + doctorIndex + slotIndex + orgIndex) % 5 === 0) {
            continue;
          }

          const appointmentType = pick(
            orgSeed.appointmentTypes,
            dayOffset + doctorIndex + slotIndex + 500,
          );
          const patientUserId = pick(
            orgSeed.patients,
            dayOffset * 7 + doctorIndex * 11 + slotIndex * 13 + 2000,
          );
          const startsAfternoon = (doctorIndex + dayOfWeek) % 2 !== 0;
          const startHour = startsAfternoon ? 12 : 8;
          const startAt = addMinutes(
            dateAtUtc(
              baseDate.getUTCFullYear(),
              baseDate.getUTCMonth() + 1,
              baseDate.getUTCDate(),
              startHour,
              0,
            ),
            slotIndex * 75 + ((doctorIndex + dayOffset + 100) % 2) * 15,
          );
          const endAt = addMinutes(startAt, appointmentType.duration);
          const status =
            dayOffset < -3
              ? pick(
                  [
                    "COMPLETED",
                    "COMPLETED",
                    "COMPLETED",
                    "NO_SHOW",
                    "CANCELLED",
                  ],
                  appointmentCount,
                )
              : dayOffset < 0
                ? pick(["COMPLETED", "NO_SHOW", "CANCELLED"], appointmentCount)
                : "SCHEDULED";
          const appointmentId = id();
          const actorOrgUserId = pick(
            orgSeed.staffOrgUserIds,
            appointmentCount + doctorIndex,
          );

          appointmentRows.push({
            id: bin(appointmentId),
            organization_id: bin(orgSeed.id),
            doctor_user_id: bin(doctorUserId),
            patient_user_id: bin(patientUserId),
            appointment_type_id: bin(appointmentType.id),
            start_at: startAt,
            end_at: endAt,
            status,
            created_by_org_user_id: bin(actorOrgUserId),
            updated_by_org_user_id:
              status === "SCHEDULED" ? null : bin(actorOrgUserId),
            cancellation_reason:
              status === "CANCELLED"
                ? pick(
                    [
                      "Pacijent je zatrazio novi termin.",
                      "Termin otkazan zbog sprijecenosti lijecnika.",
                      "Duplicirana rezervacija termina.",
                    ],
                    appointmentCount,
                  )
                : null,
            notes: pick(appointmentNotes, appointmentCount + orgIndex),
          });

          activityRows.push({
            id: bin(id()),
            organization_id: bin(orgSeed.id),
            actor_org_user_id: bin(actorOrgUserId),
            entity_type: "APPOINTMENT",
            action:
              status === "CANCELLED"
                ? "CANCEL"
                : status === "SCHEDULED"
                  ? "CREATE"
                  : "STATUS_CHANGE",
            entity_id: bin(appointmentId),
            metadata: JSON.stringify({
              status,
              source: "demo-seed",
              scheduledAt: startAt.toISOString(),
            }),
            created_at: addMinutes(startAt, -60),
          });

          if (dayOffset >= 0) {
            reminderRows.push({
              id: bin(id()),
              organization_id: bin(orgSeed.id),
              appointment_id: bin(appointmentId),
              channel: appointmentCount % 3 === 0 ? "EMAIL" : "SMS",
              scheduled_for: addDays(startAt, -1),
              sent_at: null,
              status: "PENDING",
              attempt_count: 0,
              last_error: null,
            });
          } else if (appointmentCount % 4 === 0) {
            reminderRows.push({
              id: bin(id()),
              organization_id: bin(orgSeed.id),
              appointment_id: bin(appointmentId),
              channel: appointmentCount % 2 === 0 ? "SMS" : "EMAIL",
              scheduled_for: addDays(startAt, -1),
              sent_at: addDays(startAt, -1),
              status: "SENT",
              attempt_count: 1,
              last_error: null,
            });
          }

          appointmentCount += 1;
        }
      });
    }

    orgSeed.patients.slice(0, 20).forEach((patientUserId, index) => {
      activityRows.push({
        id: bin(id()),
        organization_id: bin(orgSeed.id),
        actor_org_user_id: bin(pick(orgSeed.staffOrgUserIds, index)),
        entity_type: "PATIENT",
        action: index % 4 === 0 ? "UPDATE" : "CREATE",
        entity_id: bin(patientUserId),
        metadata: JSON.stringify({
          source: "demo-seed",
          importBatch: orgIndex + 1,
        }),
        created_at: addMinutes(now, -(index + orgIndex * 20) * 12),
      });
    });
  });

  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");

  try {
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
  } finally {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  }

  await batchInsert(knex, "organizations", orgRows);
  await batchInsert(knex, "users", userRows);
  await batchInsert(knex, "organization_users", orgUserRows);
  await batchInsert(knex, "patient_profiles", patientRows);
  await batchInsert(knex, "doctor_profiles", doctorRows);
  await batchInsert(knex, "organization_doctors", orgDoctorRows);
  await batchInsert(knex, "doctor_working_hours", workingHourRows);
  await batchInsert(knex, "doctor_time_off", timeOffRows);
  await batchInsert(knex, "appointment_types", appointmentTypeRows);
  await batchInsert(knex, "appointments", appointmentRows);
  await batchInsert(knex, "appointment_reminders", reminderRows);
  await batchInsert(knex, "activity_log", activityRows);
  await batchInsert(knex, "user_accessibility_settings", accessibilityRows);
}
