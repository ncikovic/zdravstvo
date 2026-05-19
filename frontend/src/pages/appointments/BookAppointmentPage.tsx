import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppointmentAvailableSlotDto, AppointmentTypeDto, DoctorResponseDto } from '@zdravstvo/contracts'

import { appointmentTypesService } from '@/services/appointmentTypes.service'
import { doctorsService } from '@/services/doctors.service'
import { appointmentsService } from '@/services/appointments.service'
import { useAuthStore } from '@/stores/auth/auth.store'
import { APP_ROUTES } from '@/app/routes'
import { getApiErrorMessage, toast } from '@/utils'

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: 'Vrsta pregleda',
  2: 'Odabir liječnika',
  3: 'Odabir termina',
  4: 'Potvrda',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function StepIndicator({ current }: { current: Step }): ReactElement {
  return (
    <div style={{ display: 'flex', gap: '0', marginBottom: '2rem' }} role="list" aria-label="Koraci rezervacije">
      {([1, 2, 3, 4] as Step[]).map((step, i) => {
        const done = current > step
        const active = current === step
        return (
          <div key={step} role="listitem" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0',
                  color: done || active ? '#fff' : '#9ca3af',
                }}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : step}
              </div>
              <span style={{ fontSize: '0.7rem', color: active ? '#2563eb' : done ? '#16a34a' : '#9ca3af', fontWeight: active ? 600 : 400, textAlign: 'center' }}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < 3 ? (
              <div style={{ flex: 1, height: '2px', background: done ? '#16a34a' : '#e2e8f0', alignSelf: 'flex-start', marginTop: '1rem' }} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function BookAppointmentPage(): ReactElement {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState<string | null>(null)

  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeDto[]>([])
  const [selectedType, setSelectedType] = useState<AppointmentTypeDto | null>(null)
  const [loadingTypes, setLoadingTypes] = useState(true)

  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponseDto | null>(null)
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [slots, setSlots] = useState<AppointmentAvailableSlotDto[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AppointmentAvailableSlotDto | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [notes, setNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        setLoadingTypes(true)
        const result = await appointmentTypesService.list(1)
        setAppointmentTypes(result.appointmentTypes.filter((t) => t.isActive))
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoadingTypes(false)
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (step !== 2) return
    const fetch = async (): Promise<void> => {
      try {
        setLoadingDoctors(true)
        const result = await doctorsService.list(1)
        setDoctors(result.doctors.filter((d) => d.isActive))
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoadingDoctors(false)
      }
    }
    fetch()
  }, [step])

  useEffect(() => {
    if (step !== 3 || !selectedType) return
    const fetch = async (): Promise<void> => {
      try {
        setLoadingSlots(true)
        setSlots([])
        setSelectedSlot(null)
        const result = await appointmentsService.findAvailableSlots({
          date: selectedDate,
          appointmentTypeId: selectedType.id,
          doctorId: selectedDoctor?.id,
          limit: 50,
        })
        setSlots(result.slots)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoadingSlots(false)
      }
    }
    fetch()
  }, [step, selectedDate, selectedType, selectedDoctor])

  const handleBook = async (): Promise<void> => {
    if (!selectedSlot || !selectedType || !user) return
    try {
      setIsBooking(true)
      setError(null)
      await appointmentsService.create({
        doctorId: selectedSlot.doctorId,
        patientId: user.userId,
        appointmentTypeId: selectedType.id,
        startAt: selectedSlot.startAt,
        notes: notes.trim() || undefined,
      })
      toast.success('Termin je uspješno rezerviran.')
      setSuccess(true)
      setTimeout(() => navigate(APP_ROUTES.myAppointments), 2000)
    } catch (err) {
      toast.error(err)
      setError('Termin se trenutno ne može rezervirati. Pokušajte ponovo.')
    } finally {
      setIsBooking(false)
    }
  }

  if (success) {
    return (
      <div style={{ padding: '2rem', maxWidth: '560px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h1 style={{ color: '#16a34a' }}>Termin uspješno rezerviran!</h1>
        <p style={{ color: '#666' }}>Preusmjeravamo vas na vaše termine...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Rezerviraj termin</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#666' }}>Odaberite vrstu pregleda, liječnika i slobodan termin.</p>
      </div>

      <StepIndicator current={step} />

      {error ? (
        <div role="alert" style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <Step1
          types={appointmentTypes}
          loading={loadingTypes}
          selected={selectedType}
          onSelect={(t) => { setSelectedType(t); setStep(2) }}
        />
      ) : step === 2 ? (
        <Step2
          doctors={doctors}
          loading={loadingDoctors}
          selected={selectedDoctor}
          onSelect={(d) => { setSelectedDoctor(d); setStep(3) }}
          onSkip={() => { setSelectedDoctor(null); setStep(3) }}
          onBack={() => setStep(1)}
        />
      ) : step === 3 ? (
        <Step3
          date={selectedDate}
          slots={slots}
          loading={loadingSlots}
          selected={selectedSlot}
          onDateChange={setSelectedDate}
          onSelect={(s) => { setSelectedSlot(s); setStep(4) }}
          onBack={() => setStep(2)}
        />
      ) : (
        <Step4
          type={selectedType}
          slot={selectedSlot}
          notes={notes}
          isBooking={isBooking}
          onNotesChange={setNotes}
          onBack={() => setStep(3)}
          onConfirm={handleBook}
        />
      )}
    </div>
  )
}

interface Step1Props {
  types: AppointmentTypeDto[]
  loading: boolean
  selected: AppointmentTypeDto | null
  onSelect: (t: AppointmentTypeDto) => void
}

function Step1({ types, loading, onSelect }: Step1Props): ReactElement {
  if (loading) return <p style={{ color: '#666' }}>Učitavanje...</p>

  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Odaberite vrstu pregleda</h2>
      {types.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>Nema dostupnih vrsta pregleda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563eb' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0' }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{t.name}</div>
                <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.15rem' }}>
                  Trajanje: {t.defaultDurationMinutes} min
                </div>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '1.25rem' }}>›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface Step2Props {
  doctors: DoctorResponseDto[]
  loading: boolean
  selected: DoctorResponseDto | null
  onSelect: (d: DoctorResponseDto) => void
  onSkip: () => void
  onBack: () => void
}

function Step2({ doctors, loading, onSelect, onSkip, onBack }: Step2Props): ReactElement {
  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Odaberite liječnika</h2>
      <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Možete preskočiti ovaj korak i prikazat ćemo sve dostupne termine.
      </p>

      {loading ? (
        <p style={{ color: '#666' }}>Učitavanje...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {doctors.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563eb' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0' }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                }}
              >
                {d.firstName[0]}{d.lastName[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Dr. {d.firstName} {d.lastName}</div>
                {d.title ? <div style={{ color: '#666', fontSize: '0.875rem' }}>{d.title}</div> : null}
              </div>
              <span style={{ color: '#9ca3af', fontSize: '1.25rem', marginLeft: 'auto' }}>›</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={onBack}
          style={{ padding: '0.625rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
        >
          ← Natrag
        </button>
        <button
          type="button"
          onClick={onSkip}
          style={{ padding: '0.625rem 1.25rem', border: '1px solid #2563eb', borderRadius: '6px', background: '#fff', color: '#2563eb', cursor: 'pointer' }}
        >
          Preskoči (bilo koji liječnik)
        </button>
      </div>
    </div>
  )
}

interface Step3Props {
  date: string
  slots: AppointmentAvailableSlotDto[]
  loading: boolean
  selected: AppointmentAvailableSlotDto | null
  onDateChange: (d: string) => void
  onSelect: (s: AppointmentAvailableSlotDto) => void
  onBack: () => void
}

function Step3({ date, slots, loading, selected, onDateChange, onSelect, onBack }: Step3Props): ReactElement {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Odaberite slobodan termin</h2>

      <label style={{ display: 'block', marginBottom: '1rem' }}>
        <span style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>Datum</span>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => onDateChange(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }}
        />
      </label>

      {loading ? (
        <p style={{ color: '#666' }}>Učitavanje termina...</p>
      ) : slots.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#9ca3af' }}>
          Nema slobodnih termina za odabrani datum. Pokušajte drugi datum.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {slots.map((slot, i) => {
            const isSelected = selected?.startAt === slot.startAt && selected?.doctorId === slot.doctorId
            return (
              <button
                key={`${slot.doctorId}-${slot.startAt}-${i}`}
                type="button"
                onClick={() => onSelect(slot)}
                style={{
                  padding: '0.75rem',
                  border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  background: isSelected ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formatTime(slot.startAt)}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.2rem' }}>
                  Dr. {slot.doctorName}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                  {slot.durationMinutes} min
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={onBack}
          style={{ padding: '0.625rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
        >
          ← Natrag
        </button>
      </div>
    </div>
  )
}

interface Step4Props {
  type: AppointmentTypeDto | null
  slot: AppointmentAvailableSlotDto | null
  notes: string
  isBooking: boolean
  onNotesChange: (v: string) => void
  onBack: () => void
  onConfirm: () => void
}

function Step4({ type, slot, notes, isBooking, onNotesChange, onBack, onConfirm }: Step4Props): ReactElement {
  if (!type || !slot) return <p style={{ color: '#b91c1c' }}>Nedostaju podaci za potvrdu.</p>

  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Potvrda rezervacije</h2>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem' }}>
          <dt style={{ fontWeight: 600, color: '#374151' }}>Vrsta pregleda</dt>
          <dd style={{ margin: 0, color: '#666' }}>{type.name} ({type.defaultDurationMinutes} min)</dd>

          <dt style={{ fontWeight: 600, color: '#374151' }}>Liječnik</dt>
          <dd style={{ margin: 0, color: '#666' }}>Dr. {slot.doctorName}{slot.doctorTitle ? `, ${slot.doctorTitle}` : ''}</dd>

          <dt style={{ fontWeight: 600, color: '#374151' }}>Datum</dt>
          <dd style={{ margin: 0, color: '#666' }}>{formatDateLong(slot.startAt)}</dd>

          <dt style={{ fontWeight: 600, color: '#374151' }}>Vrijeme</dt>
          <dd style={{ margin: 0, color: '#666' }}>{formatTime(slot.startAt)} – {formatTime(slot.endAt)}</dd>
        </dl>
      </div>

      <label style={{ display: 'block', marginBottom: '1.5rem' }}>
        <span style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>Napomena (neobavezno)</span>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Opišite simptome ili napomenu za liječnika..."
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }}
        />
      </label>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={isBooking}
          style={{ padding: '0.625rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
        >
          ← Natrag
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isBooking}
          style={{
            padding: '0.625rem 1.5rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            opacity: isBooking ? 0.7 : 1,
          }}
        >
          {isBooking ? 'Rezervacija...' : 'Potvrdi rezervaciju'}
        </button>
      </div>
    </div>
  )
}

export { BookAppointmentPage }
