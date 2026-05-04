import bcrypt from 'bcrypt'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { uuidToBuffer } from '../src/shared/utils/uuid.ts'

const DEMO_PASSWORD = 'Demo1234!'
const PASSWORD_SALT_ROUNDS = 12
const PATIENTS_PER_ORGANIZATION = 280
const DOCTORS_PER_ORGANIZATION = 22
const BASE_DATE = new Date(Date.UTC(2026, 4, 2, 0, 0, 0, 0))
const PAST_DAYS = 210
const FUTURE_DAYS = 150

type Row = Record<string, unknown>

interface OrganizationTemplate {
  name: string
  address: string
  city: string
  phone: string
  email: string
}

interface DoctorSeed {
  id: string
  index: number
}

interface AppointmentTypeSeed {
  id: string
  name: string
  duration: number
}

interface OrgSeed {
  id: string
  staffOrgUserIds: string[]
  doctors: DoctorSeed[]
  patients: string[]
  appointmentTypes: AppointmentTypeSeed[]
}

const organizations: readonly OrganizationTemplate[] = [
  {
    name: 'Poliklinika Zdravstvo Centar',
    address: 'Ilica 87',
    city: 'Zagreb',
    phone: '+385 1 555 0100',
    email: 'kontakt@zdravstvo-centar.test',
  },
  {
    name: 'Dom zdravlja Maksimir',
    address: 'Maksimirska cesta 128',
    city: 'Zagreb',
    phone: '+385 1 2334 810',
    email: 'kontakt@dz-maksimir.test',
  },
  {
    name: 'Poliklinika Split Riva',
    address: 'Obala hrvatskog narodnog preporoda 10',
    city: 'Split',
    phone: '+385 21 344 908',
    email: 'info@split-riva.test',
  },
  {
    name: 'Ordinacija Rijeka Korzo',
    address: 'Korzo 32',
    city: 'Rijeka',
    phone: '+385 51 218 440',
    email: 'ordinacija@rijeka-korzo.test',
  },
  {
    name: 'Poliklinika Osijek Drava',
    address: 'Europska avenija 18',
    city: 'Osijek',
    phone: '+385 31 401 210',
    email: 'info@osijek-drava.test',
  },
  {
    name: 'Dom zdravlja Zadar',
    address: 'Ulica bana Josipa Jelacica 9',
    city: 'Zadar',
    phone: '+385 23 301 800',
    email: 'kontakt@dz-zadar.test',
  },
  {
    name: 'Poliklinika Varazdin Medica',
    address: 'Zagrebacka ulica 45',
    city: 'Varazdin',
    phone: '+385 42 310 550',
    email: 'info@varazdin-medica.test',
  },
  {
    name: 'Ordinacija Pula Arena',
    address: 'Flavijevska ulica 17',
    city: 'Pula',
    phone: '+385 52 390 112',
    email: 'kontakt@pula-arena.test',
  },
  {
    name: 'Poliklinika Dubrovnik Lapad',
    address: 'Ulica kralja Tomislava 25',
    city: 'Dubrovnik',
    phone: '+385 20 411 902',
    email: 'info@dubrovnik-lapad.test',
  },
  {
    name: 'Dom zdravlja Slavonski Brod',
    address: 'Naselje Andrije Hebranga 38',
    city: 'Slavonski Brod',
    phone: '+385 35 260 445',
    email: 'kontakt@dz-brod.test',
  },
  {
    name: 'Poliklinika Karlovac Korana',
    address: 'Domobranska ulica 6',
    city: 'Karlovac',
    phone: '+385 47 612 740',
    email: 'info@karlovac-korana.test',
  },
  {
    name: 'Ordinacija Cakovec Sjever',
    address: 'Ulica kralja Tomislava 41',
    city: 'Cakovec',
    phone: '+385 40 390 118',
    email: 'kontakt@cakovec-sjever.test',
  },
]

const firstNamesFemale = [
  'Ana',
  'Petra',
  'Ivana',
  'Marija',
  'Lucija',
  'Nina',
  'Maja',
  'Katarina',
  'Tea',
  'Dora',
  'Lea',
  'Mia',
  'Sara',
  'Iva',
  'Lana',
  'Ema',
  'Paula',
  'Martina',
  'Jelena',
  'Tena',
  'Dunja',
  'Marta',
  'Vesna',
  'Ines',
  'Renata',
  'Sanja',
  'Branka',
  'Mirna',
]

const firstNamesMale = [
  'Luka',
  'Ivan',
  'Marko',
  'Josip',
  'Filip',
  'Matej',
  'David',
  'Karlo',
  'Petar',
  'Ante',
  'Nikola',
  'Tin',
  'Lovro',
  'Roko',
  'Dino',
  'Borna',
  'Leon',
  'Vito',
  'Stjepan',
  'Tomislav',
  'Marin',
  'Dario',
  'Hrvoje',
  'Vedran',
  'Mladen',
  'Zoran',
  'Goran',
  'Damir',
]

const lastNames = [
  'Horvat',
  'Novak',
  'Kovac',
  'Babic',
  'Maric',
  'Juric',
  'Vidovic',
  'Pavlovic',
  'Bozic',
  'Knezevic',
  'Peric',
  'Matijevic',
  'Grgic',
  'Simic',
  'Lovric',
  'Rukavina',
  'Kolar',
  'Vukovic',
  'Jakic',
  'Radic',
  'Boric',
  'Milic',
  'Barisic',
  'Skoric',
  'Kralj',
  'Matic',
  'Tomic',
  'Bencic',
  'Sesar',
  'Bilic',
  'Pavic',
  'Varga',
]

const streets = [
  'Ilica',
  'Vukovarska ulica',
  'Radnicka cesta',
  'Savska cesta',
  'Maksimirska cesta',
  'Heinzelova ulica',
  'Zvonimirova ulica',
  'Palmoticeva ulica',
  'Teslina ulica',
  'Meduliceva ulica',
  'Tratinska ulica',
  'Dubrovacka avenija',
  'Osjecka ulica',
  'Splitska ulica',
  'Ulica hrvatskih branitelja',
  'Rudera Boskovica',
  'Kralja Zvonimira',
  'Matice hrvatske',
  'Strossmayerova ulica',
  'Frankopanska ulica',
]

const appointmentTypeTemplates = [
  ['Prvi pregled', 45],
  ['Kontrolni pregled', 30],
  ['Telefonske konzultacije', 15],
  ['Laboratorijska obrada', 20],
  ['Preventivni pregled', 40],
  ['Hitni pregled', 30],
  ['Cijepljenje', 15],
  ['Kardioloska obrada', 50],
  ['Dermatoloski pregled', 35],
  ['Pedijatrijska kontrola', 30],
] as const

const doctorTitles = [
  'spec. obiteljske medicine',
  'spec. interne medicine',
  'spec. pedijatrije',
  'spec. dermatologije',
  'spec. ginekologije',
  'spec. kardiologije',
  'spec. ortopedije',
  'spec. neurologije',
  'spec. otorinolaringologije',
  'spec. oftalmologije',
  'spec. fizikalne medicine',
  'spec. psihijatrije',
] as const

const appointmentNotes = [
  'Pacijent dolazi na dogovoreni termin, bez posebnih napomena.',
  'Potrebno provjeriti prethodne nalaze i terapiju.',
  'Kontrolni pregled nakon promjene terapije.',
  'Pacijent je trazio jutarnji termin zbog posla.',
  'Uputiti pacijenta na dodatnu laboratorijsku obradu ako bude potrebno.',
  'Ponijeti nalaze starije od sest mjeseci radi usporedbe.',
  'Kratak administrativni upit prije pregleda.',
  'Pacijent preferira SMS podsjetnik dan prije termina.',
  'Dogovoriti plan kontrole za sljedeca tri mjeseca.',
  'Provjeriti alergije prije propisivanja nove terapije.',
  'Pacijent dolazi u pratnji clana obitelji.',
  'Nakon pregleda izdati potvrdu za poslodavca ako bude potrebno.',
] as const

const cancellationReasons = [
  'Pacijent je zatrazio novi termin.',
  'Termin otkazan zbog sprijecenosti lijecnika.',
  'Duplicirana rezervacija termina.',
  'Pacijent je javio da vise ne treba pregled.',
] as const

const id = () => uuidv4()
const bin = (value: string) => uuidToBuffer(value)
const pick = <T>(items: readonly T[], index: number): T => items[Math.abs(index) % items.length]
const pad = (value: number, size = 2): string => String(value).padStart(size, '0')
const slug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '.')

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000)

const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60 * 1000)

const dateAtUtc = (year: number, month: number, day: number, hour = 0, minute = 0): Date =>
  new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0))

const dateOnly = (date: Date): string => date.toISOString().slice(0, 10)

const batchInsert = async (knex: Knex, tableName: string, rows: Row[]): Promise<void> => {
  if (rows.length === 0) {
    return
  }

  await knex.batchInsert(tableName, rows, 1000)
}

const getShift = (
  doctorIndex: number,
  dayOfWeek: number
): { start: string; end: string; startHour: number; slots: number } | null => {
  if (dayOfWeek === 0) {
    return doctorIndex % 9 === 0
      ? { start: '09:00:00', end: '13:00:00', startHour: 9, slots: 4 }
      : null
  }

  if (dayOfWeek === 6) {
    return doctorIndex % 4 === 0
      ? { start: '08:00:00', end: '14:00:00', startHour: 8, slots: 5 }
      : null
  }

  if (doctorIndex % 3 === 0) {
    return { start: '07:00:00', end: '13:00:00', startHour: 7, slots: 6 }
  }

  if (doctorIndex % 3 === 1) {
    return { start: '10:00:00', end: '16:00:00', startHour: 10, slots: 6 }
  }

  return { start: '12:00:00', end: '19:00:00', startHour: 12, slots: 7 }
}

const buildAppointmentStatus = (
  dayOffset: number,
  appointmentIndex: number
): 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' => {
  if (dayOffset >= 0) {
    return 'SCHEDULED'
  }

  return pick(
    [
      'COMPLETED',
      'COMPLETED',
      'COMPLETED',
      'COMPLETED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ] as const,
    appointmentIndex
  )
}

const deleteExistingData = async (knex: Knex): Promise<void> => {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0')

  try {
    await knex('user_accessibility_settings').del()
    await knex('activity_log').del()
    await knex('appointment_reminders').del()
    await knex('appointments').del()
    await knex('appointment_types').del()
    await knex('doctor_time_off').del()
    await knex('doctor_working_hours').del()
    await knex('organization_doctors').del()
    await knex('doctor_profiles').del()
    await knex('patient_profiles').del()
    await knex('organization_users').del()
    await knex('users').del()
    await knex('organizations').del()
  } finally {
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1')
  }
}

export async function seed(knex: Knex): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, PASSWORD_SALT_ROUNDS)

  const organizationRows: Row[] = []
  const userRows: Row[] = []
  const organizationUserRows: Row[] = []
  const patientRows: Row[] = []
  const doctorRows: Row[] = []
  const organizationDoctorRows: Row[] = []
  const workingHourRows: Row[] = []
  const timeOffRows: Row[] = []
  const appointmentTypeRows: Row[] = []
  const appointmentRows: Row[] = []
  const reminderRows: Row[] = []
  const activityRows: Row[] = []
  const accessibilityRows: Row[] = []
  const orgSeeds: OrgSeed[] = []

  organizations.forEach((organization, orgIndex) => {
    const organizationId = id()
    const orgSeed: OrgSeed = {
      id: organizationId,
      staffOrgUserIds: [],
      doctors: [],
      patients: [],
      appointmentTypes: [],
    }

    organizationRows.push({
      id: bin(organizationId),
      name: organization.name,
      address: organization.address,
      city: organization.city,
      phone: organization.phone,
      email: organization.email,
      timezone: 'Europe/Zagreb',
    })

    const staffMembers = [
      {
        role: 'ADMIN',
        email: `admin.${orgIndex + 1}@zdravstvo-large.test`,
        phone: `+385 91 ${pad(8100 + orgIndex, 4)} 001`,
      },
      {
        role: 'RECEPTION',
        email: `recepcija.${orgIndex + 1}.a@zdravstvo-large.test`,
        phone: `+385 91 ${pad(8200 + orgIndex, 4)} 101`,
      },
      {
        role: 'RECEPTION',
        email: `recepcija.${orgIndex + 1}.b@zdravstvo-large.test`,
        phone: `+385 91 ${pad(8300 + orgIndex, 4)} 202`,
      },
      {
        role: 'RECEPTION',
        email: `koordinator.${orgIndex + 1}@zdravstvo-large.test`,
        phone: `+385 91 ${pad(8400 + orgIndex, 4)} 303`,
      },
    ]

    staffMembers.forEach((staff, staffIndex) => {
      const userId = id()
      const orgUserId = id()

      userRows.push({
        id: bin(userId),
        email: staff.email,
        phone: staff.phone,
        password_hash: passwordHash,
        status: 'ACTIVE',
      })

      organizationUserRows.push({
        id: bin(orgUserId),
        organization_id: bin(organizationId),
        user_id: bin(userId),
        role: staff.role,
        is_active: true,
      })

      accessibilityRows.push({
        user_id: bin(userId),
        font_scale: staffIndex === 0 ? 1.0 : 1.05,
        high_contrast: staffIndex === 2,
        simple_mode: false,
        voice_confirmations: staffIndex === 1,
      })

      orgSeed.staffOrgUserIds.push(orgUserId)
    })

    for (let doctorIndex = 0; doctorIndex < DOCTORS_PER_ORGANIZATION; doctorIndex += 1) {
      const userId = id()
      const orgUserId = id()
      const isFemale = doctorIndex % 2 === 0
      const firstName = isFemale
        ? pick(firstNamesFemale, orgIndex * 5 + doctorIndex)
        : pick(firstNamesMale, orgIndex * 7 + doctorIndex)
      const lastName = pick(lastNames, orgIndex * 11 + doctorIndex * 3)
      const title = pick(doctorTitles, doctorIndex + orgIndex)

      userRows.push({
        id: bin(userId),
        email: `dr.${slug(firstName)}.${slug(lastName)}.${orgIndex + 1}.${doctorIndex + 1}@zdravstvo-large.test`,
        phone: `+385 92 ${pad(orgIndex + 1)}${pad(doctorIndex + 1, 3)} ${pad(100 + doctorIndex * 17, 3)}`,
        password_hash: passwordHash,
        status: doctorIndex % 21 === 0 ? 'DISABLED' : 'ACTIVE',
      })

      doctorRows.push({
        user_id: bin(userId),
        first_name: firstName,
        last_name: lastName,
        title,
        license_number: `HR-${pad(orgIndex + 1)}-${pad(31000 + orgIndex * 500 + doctorIndex, 5)}`,
        bio: `${firstName} ${lastName} je ${title} s iskustvom u ambulantnom radu, preventivi i pracenju kronicnih pacijenata.`,
      })

      organizationUserRows.push({
        id: bin(orgUserId),
        organization_id: bin(organizationId),
        user_id: bin(userId),
        role: 'DOCTOR',
        is_active: doctorIndex % 21 !== 0,
      })

      organizationDoctorRows.push({
        id: bin(id()),
        organization_id: bin(organizationId),
        doctor_user_id: bin(userId),
        is_active: doctorIndex % 21 !== 0,
      })

      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek += 1) {
        const shift = getShift(doctorIndex, dayOfWeek)

        if (!shift) {
          continue
        }

        workingHourRows.push({
          id: bin(id()),
          organization_id: bin(organizationId),
          doctor_user_id: bin(userId),
          day_of_week: dayOfWeek,
          start_time: shift.start,
          end_time: shift.end,
          is_off: false,
        })
      }

      if (doctorIndex % 5 === 0) {
        const startAt = addDays(BASE_DATE, 12 + orgIndex + doctorIndex)

        timeOffRows.push({
          id: bin(id()),
          organization_id: bin(organizationId),
          doctor_user_id: bin(userId),
          start_at: dateAtUtc(
            startAt.getUTCFullYear(),
            startAt.getUTCMonth() + 1,
            startAt.getUTCDate(),
            8
          ),
          end_at: dateAtUtc(
            startAt.getUTCFullYear(),
            startAt.getUTCMonth() + 1,
            startAt.getUTCDate() + 2,
            16
          ),
          reason: pick(
            [
              'Strucno usavrsavanje',
              'Godisnji odmor',
              'Kongres i edukacija',
              'Rad u drugoj ambulanti',
            ],
            doctorIndex
          ),
        })
      }

      accessibilityRows.push({
        user_id: bin(userId),
        font_scale: doctorIndex % 8 === 0 ? 1.1 : 1.0,
        high_contrast: doctorIndex % 17 === 0,
        simple_mode: false,
        voice_confirmations: doctorIndex % 13 === 0,
      })

      orgSeed.doctors.push({ id: userId, index: doctorIndex })
    }

    appointmentTypeTemplates.forEach(([name, duration]) => {
      const appointmentTypeId = id()

      appointmentTypeRows.push({
        id: bin(appointmentTypeId),
        organization_id: bin(organizationId),
        name,
        default_duration_minutes: duration,
        is_active: true,
      })

      orgSeed.appointmentTypes.push({
        id: appointmentTypeId,
        name,
        duration,
      })
    })

    for (let patientIndex = 0; patientIndex < PATIENTS_PER_ORGANIZATION; patientIndex += 1) {
      const userId = id()
      const isFemale = patientIndex % 2 === 0
      const firstName = isFemale
        ? pick(firstNamesFemale, patientIndex + orgIndex)
        : pick(firstNamesMale, patientIndex + orgIndex * 2)
      const lastName = pick(lastNames, patientIndex * 5 + orgIndex)
      const birthYear = 1939 + ((patientIndex * 7 + orgIndex * 5) % 72)
      const birthMonth = 1 + ((patientIndex + orgIndex) % 12)
      const birthDay = 1 + ((patientIndex * 3 + orgIndex) % 27)
      const createdAt = addDays(BASE_DATE, -((patientIndex * 3 + orgIndex) % 420))

      userRows.push({
        id: bin(userId),
        email: `pacijent.${orgIndex + 1}.${pad(patientIndex + 1, 4)}@zdravstvo-large.test`,
        phone: `+385 95 ${pad(orgIndex + 1)}${pad(patientIndex + 1, 4)} ${pad((patientIndex * 19) % 1000, 3)}`,
        password_hash: passwordHash,
        status: patientIndex % 97 === 0 ? 'DISABLED' : 'ACTIVE',
      })

      patientRows.push({
        user_id: bin(userId),
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOnly(dateAtUtc(birthYear, birthMonth, birthDay)),
        oib: String(10000000000 + orgIndex * 1000000 + patientIndex),
        address: `${pick(streets, patientIndex + orgIndex)} ${1 + ((patientIndex * 7) % 160)}, ${organization.city}`,
        emergency_contact_name: `${pick(firstNamesFemale, patientIndex + 4)} ${pick(lastNames, patientIndex + 9)}`,
        emergency_contact_phone: `+385 98 ${pad(orgIndex + 1)}${pad(patientIndex + 200, 4)} ${pad((300 + patientIndex) % 1000, 3)}`,
        created_at: createdAt,
        updated_at: createdAt,
      })

      organizationUserRows.push({
        id: bin(id()),
        organization_id: bin(organizationId),
        user_id: bin(userId),
        role: 'PATIENT',
        is_active: patientIndex % 97 !== 0,
        created_at: createdAt,
        updated_at: createdAt,
      })

      accessibilityRows.push({
        user_id: bin(userId),
        font_scale: patientIndex % 10 === 0 ? 1.2 : 1.0,
        high_contrast: patientIndex % 17 === 0,
        simple_mode: patientIndex % 13 === 0,
        voice_confirmations: patientIndex % 19 === 0,
      })

      orgSeed.patients.push(userId)
    }

    orgSeeds.push(orgSeed)
  })

  orgSeeds.forEach((orgSeed, orgIndex) => {
    let appointmentCount = 0

    for (let dayOffset = -PAST_DAYS; dayOffset <= FUTURE_DAYS; dayOffset += 1) {
      const appointmentDate = addDays(BASE_DATE, dayOffset)
      const dayOfWeek = appointmentDate.getUTCDay()

      orgSeed.doctors.forEach((doctor, doctorIndex) => {
        const shift = getShift(doctor.index, dayOfWeek)

        if (!shift) {
          return
        }

        const plannedSlots =
          shift.slots - ((dayOffset + doctorIndex + orgIndex + 500) % 3 === 0 ? 1 : 0)

        for (let slotIndex = 0; slotIndex < plannedSlots; slotIndex += 1) {
          if (dayOffset >= 0 && (dayOffset + slotIndex + doctorIndex + orgIndex) % 7 === 0) {
            continue
          }

          const appointmentType = pick(
            orgSeed.appointmentTypes,
            dayOffset + doctorIndex * 3 + slotIndex + 1000
          )
          const patientUserId = pick(
            orgSeed.patients,
            dayOffset * 13 + doctorIndex * 17 + slotIndex * 19 + orgIndex * 23
          )
          const startAt = addMinutes(
            dateAtUtc(
              appointmentDate.getUTCFullYear(),
              appointmentDate.getUTCMonth() + 1,
              appointmentDate.getUTCDate(),
              shift.startHour,
              0
            ),
            slotIndex * 55 + ((doctorIndex + slotIndex) % 2) * 10
          )
          const endAt = addMinutes(startAt, appointmentType.duration)
          const status = buildAppointmentStatus(dayOffset, appointmentCount)
          const appointmentId = id()
          const actorOrgUserId = pick(orgSeed.staffOrgUserIds, appointmentCount + doctorIndex)

          appointmentRows.push({
            id: bin(appointmentId),
            organization_id: bin(orgSeed.id),
            doctor_user_id: bin(doctor.id),
            patient_user_id: bin(patientUserId),
            appointment_type_id: bin(appointmentType.id),
            start_at: startAt,
            end_at: endAt,
            status,
            created_by_org_user_id: bin(actorOrgUserId),
            updated_by_org_user_id: status === 'SCHEDULED' ? null : bin(actorOrgUserId),
            cancellation_reason:
              status === 'CANCELLED' ? pick(cancellationReasons, appointmentCount) : null,
            notes: pick(appointmentNotes, appointmentCount + orgIndex),
          })

          activityRows.push({
            id: bin(id()),
            organization_id: bin(orgSeed.id),
            actor_org_user_id: bin(actorOrgUserId),
            entity_type: 'APPOINTMENT',
            action:
              status === 'CANCELLED'
                ? 'CANCEL'
                : status === 'SCHEDULED'
                  ? 'CREATE'
                  : 'STATUS_CHANGE',
            entity_id: bin(appointmentId),
            metadata: JSON.stringify({
              status,
              source: 'large-realistic-seed',
              scheduledAt: startAt.toISOString(),
              appointmentType: appointmentType.name,
            }),
            created_at: addMinutes(startAt, dayOffset < 0 ? 45 : -90),
          })

          if (dayOffset >= 0) {
            reminderRows.push({
              id: bin(id()),
              organization_id: bin(orgSeed.id),
              appointment_id: bin(appointmentId),
              channel: appointmentCount % 3 === 0 ? 'EMAIL' : 'SMS',
              scheduled_for: addDays(startAt, -1),
              sent_at: null,
              status: dayOffset === 0 && appointmentCount % 11 === 0 ? 'FAILED' : 'PENDING',
              attempt_count: dayOffset === 0 && appointmentCount % 11 === 0 ? 2 : 0,
              last_error:
                dayOffset === 0 && appointmentCount % 11 === 0 ? 'Privremena greska dostave' : null,
            })
          } else if (appointmentCount % 3 === 0) {
            reminderRows.push({
              id: bin(id()),
              organization_id: bin(orgSeed.id),
              appointment_id: bin(appointmentId),
              channel: appointmentCount % 2 === 0 ? 'SMS' : 'EMAIL',
              scheduled_for: addDays(startAt, -1),
              sent_at: addDays(startAt, -1),
              status: appointmentCount % 23 === 0 ? 'FAILED' : 'SENT',
              attempt_count: appointmentCount % 23 === 0 ? 3 : 1,
              last_error: appointmentCount % 23 === 0 ? 'Korisnik nije dostupan' : null,
            })
          }

          appointmentCount += 1
        }
      })
    }

    orgSeed.patients.slice(0, 70).forEach((patientUserId, index) => {
      activityRows.push({
        id: bin(id()),
        organization_id: bin(orgSeed.id),
        actor_org_user_id: bin(pick(orgSeed.staffOrgUserIds, index)),
        entity_type: 'PATIENT',
        action: index % 5 === 0 ? 'UPDATE' : 'CREATE',
        entity_id: bin(patientUserId),
        metadata: JSON.stringify({
          source: 'large-realistic-seed',
          importBatch: orgIndex + 1,
        }),
        created_at: addMinutes(BASE_DATE, -(index + orgIndex * 20) * 18),
      })
    })

    orgSeed.appointmentTypes.forEach((appointmentType, index) => {
      activityRows.push({
        id: bin(id()),
        organization_id: bin(orgSeed.id),
        actor_org_user_id: bin(pick(orgSeed.staffOrgUserIds, index)),
        entity_type: 'TYPE',
        action: 'CREATE',
        entity_id: bin(appointmentType.id),
        metadata: JSON.stringify({
          name: appointmentType.name,
          source: 'large-realistic-seed',
        }),
        created_at: addMinutes(BASE_DATE, -(index + orgIndex * 10) * 30),
      })
    })
  })

  await deleteExistingData(knex)

  await batchInsert(knex, 'organizations', organizationRows)
  await batchInsert(knex, 'users', userRows)
  await batchInsert(knex, 'organization_users', organizationUserRows)
  await batchInsert(knex, 'patient_profiles', patientRows)
  await batchInsert(knex, 'doctor_profiles', doctorRows)
  await batchInsert(knex, 'organization_doctors', organizationDoctorRows)
  await batchInsert(knex, 'doctor_working_hours', workingHourRows)
  await batchInsert(knex, 'doctor_time_off', timeOffRows)
  await batchInsert(knex, 'appointment_types', appointmentTypeRows)
  await batchInsert(knex, 'appointments', appointmentRows)
  await batchInsert(knex, 'appointment_reminders', reminderRows)
  await batchInsert(knex, 'activity_log', activityRows)
  await batchInsert(knex, 'user_accessibility_settings', accessibilityRows)
}
