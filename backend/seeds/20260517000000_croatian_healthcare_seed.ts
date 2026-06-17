import bcrypt from 'bcrypt';
import type { Knex } from 'knex';

import { uuidToBuffer } from '../src/shared/utils/uuid.js';

const PASSWORD = 'Test1234!';
const SALT_ROUNDS = 12;

// Generates a deterministic UUID from an integer, valid v4/variant-1 format.
const mkUuid = (n: number): string => {
  const hex = n.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
};

const buf = (uuid: string): Buffer => uuidToBuffer(uuid);

// Deterministic working-hours ID: doctorIdx 0-3, day 0-6 (0=Sun…6=Sat).
const whId = (doctorIdx: number, day: number): string => mkUuid(9000 + doctorIdx * 7 + day + 1);

const ID = {
  // Organizations
  org1: mkUuid(1),   // Zagreb – Dom zdravlja Trešnjevka
  org2: mkUuid(2),   // Split  – Poliklinika Sv. Duje

  // Users
  sysAdmin: mkUuid(100),

  // Org 1 users
  mgr1:  mkUuid(101),
  rec1:  mkUuid(102),
  doc1:  mkUuid(103),
  doc2:  mkUuid(104),
  pat1:  mkUuid(105),
  pat2:  mkUuid(106),
  pat3:  mkUuid(107),

  // Org 2 users
  mgr2:  mkUuid(201),
  rec2:  mkUuid(202),
  doc3:  mkUuid(203),
  doc4:  mkUuid(204),
  pat4:  mkUuid(205),
  pat5:  mkUuid(206),
  pat6:  mkUuid(207),

  // organization_users rows
  ou_mgr1:  mkUuid(1001),
  ou_rec1:  mkUuid(1002),
  ou_doc1:  mkUuid(1003),
  ou_doc2:  mkUuid(1004),
  ou_pat1:  mkUuid(1005),
  ou_pat2:  mkUuid(1006),
  ou_pat3:  mkUuid(1007),

  ou_mgr2:  mkUuid(2001),
  ou_rec2:  mkUuid(2002),
  ou_doc3:  mkUuid(2003),
  ou_doc4:  mkUuid(2004),
  ou_pat4:  mkUuid(2005),
  ou_pat5:  mkUuid(2006),
  ou_pat6:  mkUuid(2007),

  // organization_doctors rows
  od_doc1: mkUuid(3001),
  od_doc2: mkUuid(3002),
  od_doc3: mkUuid(3003),
  od_doc4: mkUuid(3004),

  // doctor_time_off rows
  timeOff1: mkUuid(4001),
  timeOff2: mkUuid(4002),

  // appointment_types – org 1
  at1_1:  mkUuid(5001),  // Prvi pregled        30 min
  at1_2:  mkUuid(5002),  // Redovni pregled     20 min
  at1_3:  mkUuid(5003),  // Kontrolni pregled   15 min
  at1_4:  mkUuid(5004),  // Izdavanje recepta    5 min
  at1_5:  mkUuid(5005),  // Konzultacija        10 min
  at1_6:  mkUuid(5006),  // Administrativna potvrda 10 min
  at1_7:  mkUuid(5007),  // Produženje terapije  5 min
  at1_8:  mkUuid(5008),  // Savjetovanje (duže) 30 min
  at1_9:  mkUuid(5009),  // Cijepljenje         10 min
  at1_10: mkUuid(5010),  // Sistematski pregled 40 min

  // appointment_types – org 2
  at2_1:  mkUuid(5011),
  at2_2:  mkUuid(5012),
  at2_3:  mkUuid(5013),
  at2_4:  mkUuid(5014),
  at2_5:  mkUuid(5015),
  at2_6:  mkUuid(5016),
  at2_7:  mkUuid(5017),
  at2_8:  mkUuid(5018),
  at2_9:  mkUuid(5019),
  at2_10: mkUuid(5020),

  // appointments – org 1 (12 rows)
  ap1_1:  mkUuid(6001),
  ap1_2:  mkUuid(6002),
  ap1_3:  mkUuid(6003),
  ap1_4:  mkUuid(6004),
  ap1_5:  mkUuid(6005),
  ap1_6:  mkUuid(6006),
  ap1_7:  mkUuid(6007),
  ap1_8:  mkUuid(6008),
  ap1_9:  mkUuid(6009),
  ap1_10: mkUuid(6010),
  ap1_11: mkUuid(6011),  // SCHEDULED – future
  ap1_12: mkUuid(6012),  // SCHEDULED – future

  // appointments – org 2 (12 rows)
  ap2_1:  mkUuid(6013),
  ap2_2:  mkUuid(6014),
  ap2_3:  mkUuid(6015),
  ap2_4:  mkUuid(6016),
  ap2_5:  mkUuid(6017),
  ap2_6:  mkUuid(6018),
  ap2_7:  mkUuid(6019),
  ap2_8:  mkUuid(6020),
  ap2_9:  mkUuid(6021),
  ap2_10: mkUuid(6022),
  ap2_11: mkUuid(6023),  // SCHEDULED – future
  ap2_12: mkUuid(6024),  // SCHEDULED – future

  // appointment_reminders (one per SCHEDULED appointment)
  rm1: mkUuid(7001),
  rm2: mkUuid(7002),
  rm3: mkUuid(7003),
  rm4: mkUuid(7004),

  // activity_log
  al1: mkUuid(8001),
  al2: mkUuid(8002),
  al3: mkUuid(8003),
  al4: mkUuid(8004),
  al5: mkUuid(8005),
  al6: mkUuid(8006),
} as const;

export async function seed(knex: Knex): Promise<void> {
  // Wipe all data in dependency order (children before parents).
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('user_accessibility_settings').truncate();
  await knex('activity_log').truncate();
  await knex('appointment_reminders').truncate();
  await knex('appointments').truncate();
  await knex('appointment_types').truncate();
  await knex('doctor_time_off').truncate();
  await knex('doctor_working_hours').truncate();
  await knex('organization_doctors').truncate();
  await knex('doctor_profiles').truncate();
  await knex('patient_profiles').truncate();
  await knex('organization_users').truncate();
  await knex('users').truncate();
  await knex('organizations').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  const hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  // ── Organizations ────────────────────────────────────────────────────────
  await knex('organizations')
    .insert([
      {
        id: buf(ID.org1),
        name: 'Dom zdravlja Trešnjevka',
        address: 'Trešnjevački trg 1',
        city: 'Zagreb',
        phone: '+385 1 3777 555',
        email: 'kontakt@dz-tresnjevka.hr',
        timezone: 'Europe/Zagreb',
      },
      {
        id: buf(ID.org2),
        name: 'Poliklinika Sv. Duje',
        address: 'Zrinsko-Frankopanska 13',
        city: 'Split',
        phone: '+385 21 344 900',
        email: 'info@poliklinika-svduje.hr',
        timezone: 'Europe/Zagreb',
      },
    ])
    

  // ── Users ────────────────────────────────────────────────────────────────
  await knex('users')
    .insert([
      // System admin
      {
        id: buf(ID.sysAdmin),
        email: 'admin@zdravstvo.hr',
        phone: '+385 99 000 0001',
        password_hash: hash,
        is_system_admin: 1,
        status: 'ACTIVE',
      },
      // Org 1
      {
        id: buf(ID.mgr1),
        email: 'tomislav.kolar@dz-tresnjevka.hr',
        phone: '+385 99 111 0001',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.rec1),
        email: 'ivana.babic@dz-tresnjevka.hr',
        phone: '+385 99 111 0002',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.doc1),
        email: 'marko.horvat@dz-tresnjevka.hr',
        phone: '+385 99 111 0003',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.doc2),
        email: 'ana.novak@dz-tresnjevka.hr',
        phone: '+385 99 111 0004',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.pat1),
        email: 'petar.duranovic@email.hr',
        phone: '+385 99 111 0005',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.pat2),
        email: 'maja.vukovic@email.hr',
        phone: '+385 99 111 0006',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.pat3),
        email: 'stjepan.blazevic@email.hr',
        phone: '+385 99 111 0007',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      // Org 2
      {
        id: buf(ID.mgr2),
        email: 'mirna.peric@poliklinika-svduje.hr',
        phone: '+385 99 222 0001',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.rec2),
        email: 'luka.covic@poliklinika-svduje.hr',
        phone: '+385 99 222 0002',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.doc3),
        email: 'ante.juric@poliklinika-svduje.hr',
        phone: '+385 99 222 0003',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.doc4),
        email: 'marina.maric@poliklinika-svduje.hr',
        phone: '+385 99 222 0004',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.pat4),
        email: 'nikolina.knezevic@email.hr',
        phone: '+385 99 222 0005',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.pat5),
        email: 'tomislav.galic@email.hr',
        phone: '+385 99 222 0006',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
      {
        id: buf(ID.pat6),
        email: 'lucija.simic@email.hr',
        phone: '+385 99 222 0007',
        password_hash: hash,
        is_system_admin: 0,
        status: 'ACTIVE',
      },
    ])
    

  // ── Organization users ───────────────────────────────────────────────────
  await knex('organization_users')
    .insert([
      // Org 1
      { id: buf(ID.ou_mgr1), organization_id: buf(ID.org1), user_id: buf(ID.mgr1), role: 'MANAGER',   is_active: 1 },
      { id: buf(ID.ou_rec1), organization_id: buf(ID.org1), user_id: buf(ID.rec1), role: 'RECEPTION', is_active: 1 },
      { id: buf(ID.ou_doc1), organization_id: buf(ID.org1), user_id: buf(ID.doc1), role: 'DOCTOR',    is_active: 1 },
      { id: buf(ID.ou_doc2), organization_id: buf(ID.org1), user_id: buf(ID.doc2), role: 'DOCTOR',    is_active: 1 },
      { id: buf(ID.ou_pat1), organization_id: buf(ID.org1), user_id: buf(ID.pat1), role: 'PATIENT',   is_active: 1 },
      { id: buf(ID.ou_pat2), organization_id: buf(ID.org1), user_id: buf(ID.pat2), role: 'PATIENT',   is_active: 1 },
      { id: buf(ID.ou_pat3), organization_id: buf(ID.org1), user_id: buf(ID.pat3), role: 'PATIENT',   is_active: 1 },
      // Org 2
      { id: buf(ID.ou_mgr2), organization_id: buf(ID.org2), user_id: buf(ID.mgr2), role: 'MANAGER',   is_active: 1 },
      { id: buf(ID.ou_rec2), organization_id: buf(ID.org2), user_id: buf(ID.rec2), role: 'RECEPTION', is_active: 1 },
      { id: buf(ID.ou_doc3), organization_id: buf(ID.org2), user_id: buf(ID.doc3), role: 'DOCTOR',    is_active: 1 },
      { id: buf(ID.ou_doc4), organization_id: buf(ID.org2), user_id: buf(ID.doc4), role: 'DOCTOR',    is_active: 1 },
      { id: buf(ID.ou_pat4), organization_id: buf(ID.org2), user_id: buf(ID.pat4), role: 'PATIENT',   is_active: 1 },
      { id: buf(ID.ou_pat5), organization_id: buf(ID.org2), user_id: buf(ID.pat5), role: 'PATIENT',   is_active: 1 },
      { id: buf(ID.ou_pat6), organization_id: buf(ID.org2), user_id: buf(ID.pat6), role: 'PATIENT',   is_active: 1 },
    ])
    

  // ── Doctor profiles ──────────────────────────────────────────────────────
  await knex('doctor_profiles')
    .insert([
      {
        user_id: buf(ID.doc1),
        first_name: 'Marko',
        last_name: 'Horvat',
        title: 'dr. med.',
        license_number: 'HLK-ZG-10452',
        bio: 'Specijalist opće medicine s 12 godina iskustva u primarnoj zdravstvenoj zaštiti.',
      },
      {
        user_id: buf(ID.doc2),
        first_name: 'Ana',
        last_name: 'Novak',
        title: 'prim. dr. med.',
        license_number: 'HLK-ZG-08217',
        bio: 'Primarius s 20 godina iskustva, specijalizacija iz interne medicine.',
      },
      {
        user_id: buf(ID.doc3),
        first_name: 'Ante',
        last_name: 'Jurić',
        title: 'dr. med.',
        license_number: 'HLK-ST-05831',
        bio: 'Specijalist obiteljske medicine, radi u splitskoj regiji od 2010. godine.',
      },
      {
        user_id: buf(ID.doc4),
        first_name: 'Marina',
        last_name: 'Marić',
        title: 'prim. dr. med.',
        license_number: 'HLK-ST-03694',
        bio: 'Primarius s dugogodišnjim iskustvom u kardiologiji i preventivnoj medicini.',
      },
    ])
    

  // ── Patient profiles ─────────────────────────────────────────────────────
  await knex('patient_profiles')
    .insert([
      {
        user_id: buf(ID.pat1),
        first_name: 'Petar',
        last_name: 'Đuranović',
        date_of_birth: '1985-03-15',
        oib: '12345678901',
        address: 'Ilica 45, Zagreb',
        emergency_contact_name: 'Ivana Đuranović',
        emergency_contact_phone: '+385 99 888 1001',
      },
      {
        user_id: buf(ID.pat2),
        first_name: 'Maja',
        last_name: 'Vuković',
        date_of_birth: '1990-07-22',
        oib: '23456789012',
        address: 'Maksimirska 88, Zagreb',
        emergency_contact_name: 'Luka Vuković',
        emergency_contact_phone: '+385 99 888 1002',
      },
      {
        user_id: buf(ID.pat3),
        first_name: 'Stjepan',
        last_name: 'Blažević',
        date_of_birth: '1978-11-08',
        oib: '34567890123',
        address: 'Savska cesta 12, Zagreb',
        emergency_contact_name: 'Marta Blažević',
        emergency_contact_phone: '+385 99 888 1003',
      },
      {
        user_id: buf(ID.pat4),
        first_name: 'Nikolina',
        last_name: 'Knežević',
        date_of_birth: '1995-02-14',
        oib: '45678901234',
        address: 'Meštrova 7, Split',
        emergency_contact_name: 'Josip Knežević',
        emergency_contact_phone: '+385 99 888 2001',
      },
      {
        user_id: buf(ID.pat5),
        first_name: 'Tomislav',
        last_name: 'Galić',
        date_of_birth: '1982-09-30',
        oib: '56789012345',
        address: 'Domovinskog rata 22, Split',
        emergency_contact_name: 'Ana Galić',
        emergency_contact_phone: '+385 99 888 2002',
      },
      {
        user_id: buf(ID.pat6),
        first_name: 'Lucija',
        last_name: 'Šimić',
        date_of_birth: '2000-04-20',
        oib: '67890123456',
        address: 'Vukovarska 3, Split',
        emergency_contact_name: 'Pero Šimić',
        emergency_contact_phone: '+385 99 888 2003',
      },
    ])
    

  // ── Organization doctors ─────────────────────────────────────────────────
  await knex('organization_doctors')
    .insert([
      { id: buf(ID.od_doc1), organization_id: buf(ID.org1), doctor_user_id: buf(ID.doc1), is_active: 1 },
      { id: buf(ID.od_doc2), organization_id: buf(ID.org1), doctor_user_id: buf(ID.doc2), is_active: 1 },
      { id: buf(ID.od_doc3), organization_id: buf(ID.org2), doctor_user_id: buf(ID.doc3), is_active: 1 },
      { id: buf(ID.od_doc4), organization_id: buf(ID.org2), doctor_user_id: buf(ID.doc4), is_active: 1 },
    ])
    

  // ── Doctor working hours ─────────────────────────────────────────────────
  // day_of_week follows JS getUTCDay(): 0=Sunday, 1=Monday … 6=Saturday
  // Mon–Fri (1–5) is_off=0, Sat (6) and Sun (0) is_off=1
  const doctorSchedules = [
    { orgId: ID.org1, userId: ID.doc1, idx: 0 },
    { orgId: ID.org1, userId: ID.doc2, idx: 1 },
    { orgId: ID.org2, userId: ID.doc3, idx: 2 },
    { orgId: ID.org2, userId: ID.doc4, idx: 3 },
  ];

  const workingHourRows = doctorSchedules.flatMap(({ orgId, userId, idx }) =>
    [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      id: buf(whId(idx, day)),
      organization_id: buf(orgId),
      doctor_user_id: buf(userId),
      day_of_week: day,
      start_time: '08:00:00',
      end_time: '16:00:00',
      is_off: day === 0 || day === 6 ? 1 : 0,
    }))
  );

  await knex('doctor_working_hours').insert(workingHourRows)

  // ── Doctor time off ──────────────────────────────────────────────────────
  await knex('doctor_time_off')
    .insert([
      {
        id: buf(ID.timeOff1),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        start_at: '2025-07-21 00:00:00.000',
        end_at: '2025-07-25 23:59:59.000',
        reason: 'Godišnji odmor',
      },
      {
        id: buf(ID.timeOff2),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc3),
        start_at: '2025-08-04 00:00:00.000',
        end_at: '2025-08-08 23:59:59.000',
        reason: 'Stručno usavršavanje',
      },
    ])
    

  // ── Appointment types ────────────────────────────────────────────────────
  const apptTypeNames = [
    { key: 'at1', id: ID.at1_1,  id2: ID.at2_1,  name: 'Prvi pregled',           duration: 30 },
    { key: 'at2', id: ID.at1_2,  id2: ID.at2_2,  name: 'Redovni pregled',        duration: 20 },
    { key: 'at3', id: ID.at1_3,  id2: ID.at2_3,  name: 'Kontrolni pregled',      duration: 15 },
    { key: 'at4', id: ID.at1_4,  id2: ID.at2_4,  name: 'Izdavanje recepta',      duration:  5 },
    { key: 'at5', id: ID.at1_5,  id2: ID.at2_5,  name: 'Konzultacija',           duration: 10 },
    { key: 'at6', id: ID.at1_6,  id2: ID.at2_6,  name: 'Administrativna potvrda',duration: 10 },
    { key: 'at7', id: ID.at1_7,  id2: ID.at2_7,  name: 'Produženje terapije',    duration:  5 },
    { key: 'at8', id: ID.at1_8,  id2: ID.at2_8,  name: 'Savjetovanje (duže)',    duration: 30 },
    { key: 'at9', id: ID.at1_9,  id2: ID.at2_9,  name: 'Cijepljenje',            duration: 10 },
    { key: 'at10',id: ID.at1_10, id2: ID.at2_10, name: 'Sistematski pregled',    duration: 40 },
  ];

  const apptTypeRows = apptTypeNames.flatMap(({ id: id1, id2, name, duration }) => [
    { id: buf(id1), organization_id: buf(ID.org1), name, default_duration_minutes: duration, is_active: 1 },
    { id: buf(id2), organization_id: buf(ID.org2), name, default_duration_minutes: duration, is_active: 1 },
  ]);

  await knex('appointment_types').insert(apptTypeRows)

  // ── Appointments ─────────────────────────────────────────────────────────
  // All datetimes UTC. Past = COMPLETED/CANCELLED/NO_SHOW, future = SCHEDULED.
  await knex('appointments')
    .insert([
      // ── Org 1 ──────────────────────────────────────────────────────────
      {
        id: buf(ID.ap1_1),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        patient_user_id: buf(ID.pat1),
        appointment_type_id: buf(ID.at1_2),   // Redovni pregled 20 min
        start_at: '2025-03-10 09:00:00.000',
        end_at:   '2025-03-10 09:20:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec1),
        notes: 'Kontrolni pregled, stanje stabilno. Nastaviti s terapijom.',
      },
      {
        id: buf(ID.ap1_2),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        patient_user_id: buf(ID.pat2),
        appointment_type_id: buf(ID.at1_3),   // Kontrolni pregled 15 min
        start_at: '2025-04-15 10:00:00.000',
        end_at:   '2025-04-15 10:15:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec1),
        notes: 'Tlak uredan, nastavak terapije metformin. Sljedeći pregled za 3 mj.',
      },
      {
        id: buf(ID.ap1_3),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc2),
        patient_user_id: buf(ID.pat3),
        appointment_type_id: buf(ID.at1_5),   // Konzultacija 10 min
        start_at: '2025-05-20 11:00:00.000',
        end_at:   '2025-05-20 11:10:00.000',
        status: 'CANCELLED',
        created_by_org_user_id: buf(ID.ou_rec1),
        updated_by_org_user_id: buf(ID.ou_rec1),
        cancellation_reason: 'Pacijent otkazao termin.',
      },
      {
        id: buf(ID.ap1_4),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc2),
        patient_user_id: buf(ID.pat1),
        appointment_type_id: buf(ID.at1_9),   // Cijepljenje 10 min
        start_at: '2025-06-09 08:30:00.000',
        end_at:   '2025-06-09 08:40:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec1),
        notes: 'Cijepljenje protiv gripe obavljeno, bez nuspojava.',
      },
      {
        id: buf(ID.ap1_5),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        patient_user_id: buf(ID.pat3),
        appointment_type_id: buf(ID.at1_4),   // Izdavanje recepta 5 min
        start_at: '2025-08-12 09:30:00.000',
        end_at:   '2025-08-12 09:35:00.000',
        status: 'NO_SHOW',
        created_by_org_user_id: buf(ID.ou_rec1),
        updated_by_org_user_id: buf(ID.ou_rec1),
      },
      {
        id: buf(ID.ap1_6),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc2),
        patient_user_id: buf(ID.pat2),
        appointment_type_id: buf(ID.at1_7),   // Produženje terapije 5 min
        start_at: '2025-09-25 14:00:00.000',
        end_at:   '2025-09-25 14:05:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec1),
        notes: 'Recept za ramipril produžen za 60 dana.',
      },
      {
        id: buf(ID.ap1_7),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        patient_user_id: buf(ID.pat1),
        appointment_type_id: buf(ID.at1_10),  // Sistematski pregled 40 min
        start_at: '2025-10-14 10:30:00.000',
        end_at:   '2025-10-14 11:10:00.000',
        status: 'CANCELLED',
        created_by_org_user_id: buf(ID.ou_rec1),
        updated_by_org_user_id: buf(ID.ou_mgr1),
        cancellation_reason: 'Liječnik nedostupan, hitna situacija.',
      },
      {
        id: buf(ID.ap1_8),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        patient_user_id: buf(ID.pat2),
        appointment_type_id: buf(ID.at1_1),   // Prvi pregled 30 min
        start_at: '2025-11-05 08:00:00.000',
        end_at:   '2025-11-05 08:30:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec1),
        notes: 'Inicijalni pregled novog pacijenta. Upućen na kardiološku obradu.',
      },
      {
        id: buf(ID.ap1_9),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc2),
        patient_user_id: buf(ID.pat3),
        appointment_type_id: buf(ID.at1_6),   // Administrativna potvrda 10 min
        start_at: '2025-12-03 11:00:00.000',
        end_at:   '2025-12-03 11:10:00.000',
        status: 'NO_SHOW',
        created_by_org_user_id: buf(ID.ou_rec1),
        updated_by_org_user_id: buf(ID.ou_rec1),
      },
      {
        id: buf(ID.ap1_10),
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        patient_user_id: buf(ID.pat1),
        appointment_type_id: buf(ID.at1_8),   // Savjetovanje (duže) 30 min
        start_at: '2026-01-20 09:00:00.000',
        end_at:   '2026-01-20 09:30:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec1),
        notes: 'Savjetovanje o kroničnoj terapiji i promjeni životnih navika.',
      },
      {
        id: buf(ID.ap1_11),  // SCHEDULED – 2026-06-10 (Wednesday)
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc1),
        patient_user_id: buf(ID.pat2),
        appointment_type_id: buf(ID.at1_2),   // Redovni pregled 20 min
        start_at: '2026-06-10 09:00:00.000',
        end_at:   '2026-06-10 09:20:00.000',
        status: 'SCHEDULED',
        created_by_org_user_id: buf(ID.ou_rec1),
      },
      {
        id: buf(ID.ap1_12),  // SCHEDULED – 2026-06-15 (Monday)
        organization_id: buf(ID.org1),
        doctor_user_id: buf(ID.doc2),
        patient_user_id: buf(ID.pat3),
        appointment_type_id: buf(ID.at1_3),   // Kontrolni pregled 15 min
        start_at: '2026-06-15 10:00:00.000',
        end_at:   '2026-06-15 10:15:00.000',
        status: 'SCHEDULED',
        created_by_org_user_id: buf(ID.ou_rec1),
      },

      // ── Org 2 ──────────────────────────────────────────────────────────
      {
        id: buf(ID.ap2_1),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc3),
        patient_user_id: buf(ID.pat4),
        appointment_type_id: buf(ID.at2_2),   // Redovni pregled 20 min
        start_at: '2025-03-12 09:00:00.000',
        end_at:   '2025-03-12 09:20:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec2),
        notes: 'Redovni pregled, EKG uredan. Nastaviti s dosadašnjom terapijom.',
      },
      {
        id: buf(ID.ap2_2),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc3),
        patient_user_id: buf(ID.pat5),
        appointment_type_id: buf(ID.at2_5),   // Konzultacija 10 min
        start_at: '2025-04-18 10:00:00.000',
        end_at:   '2025-04-18 10:10:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec2),
        notes: 'Konzultacija o rezultatima laboratorijskih nalaza.',
      },
      {
        id: buf(ID.ap2_3),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc4),
        patient_user_id: buf(ID.pat6),
        appointment_type_id: buf(ID.at2_5),   // Konzultacija 10 min
        start_at: '2025-06-02 11:00:00.000',
        end_at:   '2025-06-02 11:10:00.000',
        status: 'CANCELLED',
        created_by_org_user_id: buf(ID.ou_rec2),
        updated_by_org_user_id: buf(ID.ou_rec2),
        cancellation_reason: 'Specijalist odsutan na kongresu.',
      },
      {
        id: buf(ID.ap2_4),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc4),
        patient_user_id: buf(ID.pat4),
        appointment_type_id: buf(ID.at2_9),   // Cijepljenje 10 min
        start_at: '2025-07-08 08:30:00.000',
        end_at:   '2025-07-08 08:40:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec2),
        notes: 'Hepatitis B cijepljenje, 2. doza. Bez alergijske reakcije.',
      },
      {
        id: buf(ID.ap2_5),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc3),
        patient_user_id: buf(ID.pat6),
        appointment_type_id: buf(ID.at2_4),   // Izdavanje recepta 5 min
        start_at: '2025-09-15 09:30:00.000',
        end_at:   '2025-09-15 09:35:00.000',
        status: 'NO_SHOW',
        created_by_org_user_id: buf(ID.ou_rec2),
        updated_by_org_user_id: buf(ID.ou_rec2),
      },
      {
        id: buf(ID.ap2_6),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc4),
        patient_user_id: buf(ID.pat5),
        appointment_type_id: buf(ID.at2_7),   // Produženje terapije 5 min
        start_at: '2025-10-21 14:00:00.000',
        end_at:   '2025-10-21 14:05:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec2),
        notes: 'Terapija amlodipinom produžena. Krvni tlak pod kontrolom.',
      },
      {
        id: buf(ID.ap2_7),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc3),
        patient_user_id: buf(ID.pat4),
        appointment_type_id: buf(ID.at2_10),  // Sistematski pregled 40 min
        start_at: '2025-11-28 10:30:00.000',
        end_at:   '2025-11-28 11:10:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec2),
        notes: 'Kompletni sistematski pregled. Svi nalazi u granicama normale.',
      },
      {
        id: buf(ID.ap2_8),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc4),
        patient_user_id: buf(ID.pat6),
        appointment_type_id: buf(ID.at2_6),   // Administrativna potvrda 10 min
        start_at: '2025-12-09 11:00:00.000',
        end_at:   '2025-12-09 11:10:00.000',
        status: 'CANCELLED',
        created_by_org_user_id: buf(ID.ou_rec2),
        updated_by_org_user_id: buf(ID.ou_rec2),
        cancellation_reason: 'Pacijent otkazao termin.',
      },
      {
        id: buf(ID.ap2_9),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc3),
        patient_user_id: buf(ID.pat5),
        appointment_type_id: buf(ID.at2_2),   // Redovni pregled 20 min
        start_at: '2026-01-14 09:00:00.000',
        end_at:   '2026-01-14 09:20:00.000',
        status: 'NO_SHOW',
        created_by_org_user_id: buf(ID.ou_rec2),
        updated_by_org_user_id: buf(ID.ou_rec2),
      },
      {
        id: buf(ID.ap2_10),
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc4),
        patient_user_id: buf(ID.pat4),
        appointment_type_id: buf(ID.at2_3),   // Kontrolni pregled 15 min
        start_at: '2026-02-25 10:00:00.000',
        end_at:   '2026-02-25 10:15:00.000',
        status: 'COMPLETED',
        created_by_org_user_id: buf(ID.ou_rec2),
        notes: 'Kontrola nakon operativnog zahvata. Rana zarasla uredno.',
      },
      {
        id: buf(ID.ap2_11),  // SCHEDULED – 2026-06-18 (Thursday)
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc3),
        patient_user_id: buf(ID.pat5),
        appointment_type_id: buf(ID.at2_5),   // Konzultacija 10 min
        start_at: '2026-06-18 09:00:00.000',
        end_at:   '2026-06-18 09:10:00.000',
        status: 'SCHEDULED',
        created_by_org_user_id: buf(ID.ou_rec2),
      },
      {
        id: buf(ID.ap2_12),  // SCHEDULED – 2026-06-25 (Thursday)
        organization_id: buf(ID.org2),
        doctor_user_id: buf(ID.doc4),
        patient_user_id: buf(ID.pat6),
        appointment_type_id: buf(ID.at2_2),   // Redovni pregled 20 min
        start_at: '2026-06-25 11:00:00.000',
        end_at:   '2026-06-25 11:20:00.000',
        status: 'SCHEDULED',
        created_by_org_user_id: buf(ID.ou_rec2),
      },
    ])
    

  // ── Appointment reminders ────────────────────────────────────────────────
  // EMAIL reminder scheduled 24 h before each SCHEDULED appointment.
  await knex('appointment_reminders')
    .insert([
      {
        id: buf(ID.rm1),
        organization_id: buf(ID.org1),
        appointment_id: buf(ID.ap1_11),
        channel: 'EMAIL',
        scheduled_for: '2026-06-09 09:00:00.000',
        status: 'PENDING',
        attempt_count: 0,
      },
      {
        id: buf(ID.rm2),
        organization_id: buf(ID.org1),
        appointment_id: buf(ID.ap1_12),
        channel: 'EMAIL',
        scheduled_for: '2026-06-14 10:00:00.000',
        status: 'PENDING',
        attempt_count: 0,
      },
      {
        id: buf(ID.rm3),
        organization_id: buf(ID.org2),
        appointment_id: buf(ID.ap2_11),
        channel: 'EMAIL',
        scheduled_for: '2026-06-17 09:00:00.000',
        status: 'PENDING',
        attempt_count: 0,
      },
      {
        id: buf(ID.rm4),
        organization_id: buf(ID.org2),
        appointment_id: buf(ID.ap2_12),
        channel: 'EMAIL',
        scheduled_for: '2026-06-24 11:00:00.000',
        status: 'PENDING',
        attempt_count: 0,
      },
    ])
    

  // ── Activity log ─────────────────────────────────────────────────────────
  await knex('activity_log')
    .insert([
      {
        id: buf(ID.al1),
        organization_id: buf(ID.org1),
        actor_org_user_id: buf(ID.ou_rec1),
        entity_type: 'APPOINTMENT',
        action: 'CREATE',
        entity_id: buf(ID.ap1_1),
        metadata: JSON.stringify({ patient: 'Petar Đuranović', type: 'Redovni pregled' }),
        created_at: '2025-03-10 08:55:00.000',
      },
      {
        id: buf(ID.al2),
        organization_id: buf(ID.org1),
        actor_org_user_id: buf(ID.ou_rec1),
        entity_type: 'APPOINTMENT',
        action: 'CREATE',
        entity_id: buf(ID.ap1_2),
        metadata: JSON.stringify({ patient: 'Maja Vuković', type: 'Kontrolni pregled' }),
        created_at: '2025-04-15 09:50:00.000',
      },
      {
        id: buf(ID.al3),
        organization_id: buf(ID.org1),
        actor_org_user_id: buf(ID.ou_rec1),
        entity_type: 'APPOINTMENT',
        action: 'CANCEL',
        entity_id: buf(ID.ap1_3),
        metadata: JSON.stringify({ reason: 'Pacijent otkazao termin.', patient: 'Stjepan Blažević' }),
        created_at: '2025-05-19 14:30:00.000',
      },
      {
        id: buf(ID.al4),
        organization_id: buf(ID.org2),
        actor_org_user_id: buf(ID.ou_rec2),
        entity_type: 'APPOINTMENT',
        action: 'CREATE',
        entity_id: buf(ID.ap2_1),
        metadata: JSON.stringify({ patient: 'Nikolina Knežević', type: 'Redovni pregled' }),
        created_at: '2025-03-12 08:50:00.000',
      },
      {
        id: buf(ID.al5),
        organization_id: buf(ID.org2),
        actor_org_user_id: buf(ID.ou_rec2),
        entity_type: 'APPOINTMENT',
        action: 'CREATE',
        entity_id: buf(ID.ap2_2),
        metadata: JSON.stringify({ patient: 'Tomislav Galić', type: 'Konzultacija' }),
        created_at: '2025-04-18 09:45:00.000',
      },
      {
        id: buf(ID.al6),
        organization_id: buf(ID.org2),
        actor_org_user_id: buf(ID.ou_rec2),
        entity_type: 'APPOINTMENT',
        action: 'CANCEL',
        entity_id: buf(ID.ap2_3),
        metadata: JSON.stringify({ reason: 'Specijalist odsutan na kongresu.', patient: 'Lucija Šimić' }),
        created_at: '2025-05-30 10:15:00.000',
      },
    ])
    

  // ── Accessibility settings ───────────────────────────────────────────────
  await knex('user_accessibility_settings')
    .insert([
      {
        user_id: buf(ID.sysAdmin),
        font_scale: 1.00,
        high_contrast: 0,
        simple_mode: 0,
        voice_confirmations: 0,
      },
      {
        user_id: buf(ID.pat1),
        font_scale: 1.20,
        high_contrast: 1,
        simple_mode: 1,
        voice_confirmations: 0,
      },
      {
        user_id: buf(ID.pat4),
        font_scale: 1.10,
        high_contrast: 0,
        simple_mode: 0,
        voice_confirmations: 1,
      },
    ])
    
}
