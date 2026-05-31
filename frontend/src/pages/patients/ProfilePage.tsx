import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactElement } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  AccessibilitySettingsDto,
  PatientDto,
  UpdateAccessibilitySettingsRequestDto,
  UpdatePatientRequestDto,
} from '@zdravstvo/contracts'

import { useAccessibility } from '@/contexts/AccessibilityContext'
import { accessibilityService, patientsService } from '@/services'
import { useAuthStore } from '@/stores/auth/auth.store'
import { getApiErrorMessage, toast } from '@/utils'
import type { AccessibilityPrefs } from '@/utils/accessibility'

interface ProfileFormState {
  phone: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  fontScale: number
  highContrast: boolean
  simpleMode: boolean
  voiceConfirmations: boolean
}

const profileQueryKeys = {
  patient: (userId: string) => ['patient-profile', userId] as const,
  accessibility: ['accessibility', 'me'] as const,
}

const defaultFormState: ProfileFormState = {
  phone: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  fontScale: 1,
  highContrast: false,
  simpleMode: false,
  voiceConfirmations: false,
}

const emptyToNull = (value: string): string | null => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const formatValue = (value: string | null | undefined): string => value || 'Nije dostupno'

const fontScaleToPref = (fontScale: number): AccessibilityPrefs['fontSize'] => {
  if (fontScale >= 1.4) return 'xl'
  if (fontScale >= 1.15) return 'large'
  return 'normal'
}

const mapPatientToForm = (patient: PatientDto): Pick<
  ProfileFormState,
  'phone' | 'address' | 'emergencyContactName' | 'emergencyContactPhone'
> => ({
  phone: patient.phone ?? '',
  address: patient.address ?? '',
  emergencyContactName: patient.emergencyContactName ?? '',
  emergencyContactPhone: patient.emergencyContactPhone ?? '',
})

const mapAccessibilityToForm = (
  settings: AccessibilitySettingsDto,
): Pick<
  ProfileFormState,
  'fontScale' | 'highContrast' | 'simpleMode' | 'voiceConfirmations'
> => ({
  fontScale: settings.fontScale,
  highContrast: settings.highContrast,
  simpleMode: settings.simpleMode,
  voiceConfirmations: settings.voiceConfirmations,
})

function ProfilePage(): ReactElement {
  const queryClient = useQueryClient()
  const { updatePref } = useAccessibility()
  const user = useAuthStore((state) => state.user)
  const [form, setForm] = useState<ProfileFormState>(defaultFormState)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const userId = user?.userId ?? ''

  const patientQuery = useQuery<PatientDto>({
    queryKey: profileQueryKeys.patient(userId),
    queryFn: () => patientsService.getById(userId),
    enabled: Boolean(userId),
  })

  const accessibilityQuery = useQuery<AccessibilitySettingsDto>({
    queryKey: profileQueryKeys.accessibility,
    queryFn: () => accessibilityService.getCurrentUserSettings(),
    enabled: Boolean(userId),
  })

  const patient = patientQuery.data
  const accessibilitySettings = accessibilityQuery.data

  useEffect(() => {
    if (!patient) return
    setForm((current) => ({
      ...current,
      ...mapPatientToForm(patient),
    }))
  }, [patient])

  useEffect(() => {
    if (!accessibilitySettings) return
    setForm((current) => ({
      ...current,
      ...mapAccessibilityToForm(accessibilitySettings),
    }))
  }, [accessibilitySettings])

  const saveProfileMutation = useMutation<
    { patient: PatientDto; accessibility: AccessibilitySettingsDto },
    unknown,
    ProfileFormState
  >({
    mutationFn: async (payload) => {
      if (!userId) {
        throw new Error('Korisnik nije dostupan.')
      }

      const patientPayload: UpdatePatientRequestDto = {
        phone: emptyToNull(payload.phone),
        address: emptyToNull(payload.address),
        emergencyContactName: emptyToNull(payload.emergencyContactName),
        emergencyContactPhone: emptyToNull(payload.emergencyContactPhone),
      }
      const accessibilityPayload: UpdateAccessibilitySettingsRequestDto = {
        fontScale: payload.fontScale,
        highContrast: payload.highContrast,
        simpleMode: payload.simpleMode,
        voiceConfirmations: payload.voiceConfirmations,
      }

      const [updatedPatient, updatedAccessibility] = await Promise.all([
        patientsService.update(userId, patientPayload),
        accessibilityService.updateCurrentUserSettings(accessibilityPayload),
      ])

      return {
        patient: updatedPatient,
        accessibility: updatedAccessibility,
      }
    },
    onSuccess: async ({ patient: updatedPatient, accessibility }) => {
      queryClient.setQueryData(profileQueryKeys.patient(updatedPatient.id), updatedPatient)
      queryClient.setQueryData(profileQueryKeys.accessibility, accessibility)
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.patient(updatedPatient.id) })
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.accessibility })

      useAuthStore.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              phone: updatedPatient.phone,
              address: updatedPatient.address,
              emergencyContactName: updatedPatient.emergencyContactName,
              emergencyContactPhone: updatedPatient.emergencyContactPhone,
            }
          : state.user,
      }))

      updatePref('fontSize', fontScaleToPref(accessibility.fontScale))
      updatePref('highContrast', accessibility.highContrast)
      updatePref('simplifiedView', accessibility.simpleMode)
      updatePref('voiceReadout', accessibility.voiceConfirmations)

      setSavedMessage('Promjene su spremljene.')
      toast.success('Profil je uspješno spremljen.')
    },
    onError: (error) => {
      setSavedMessage(null)
      toast.error(error)
    },
  })

  const isLoading = patientQuery.isLoading || accessibilityQuery.isLoading
  const error = patientQuery.error ?? accessibilityQuery.error

  const displayPatient = useMemo(
    () =>
      patient ?? {
        firstName: user?.firstName ?? null,
        lastName: user?.lastName ?? null,
        email: user?.email ?? null,
        phone: user?.phone ?? null,
        dateOfBirth: user?.dateOfBirth ?? null,
        oib: user?.oib ?? null,
        address: user?.address ?? null,
        emergencyContactName: user?.emergencyContactName ?? null,
        emergencyContactPhone: user?.emergencyContactPhone ?? null,
      },
    [patient, user],
  )

  const handleTextChange =
    (field: keyof Pick<ProfileFormState, 'phone' | 'address' | 'emergencyContactName' | 'emergencyContactPhone'>) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setSavedMessage(null)
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const handleBooleanChange = (
    field: keyof Pick<ProfileFormState, 'highContrast' | 'simpleMode' | 'voiceConfirmations'>,
    value: boolean,
  ): void => {
    setSavedMessage(null)
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleFontScaleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSavedMessage(null)
    setForm((current) => ({
      ...current,
      fontScale: Number(event.target.value),
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    saveProfileMutation.mutate(form)
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Moj profil</h1>
        <p role="alert">Podaci o korisniku nisu dostupni.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '920px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Moj profil</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#666' }}>
          Pregled osobnih podataka i uređivanje kontaktnih postavki.
        </p>
      </div>

      {isLoading ? (
        <p style={{ color: '#6b7280' }}>Učitavanje profila...</p>
      ) : null}

      {error ? (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            background: '#fef2f2',
            color: '#b91c1c',
            borderRadius: '6px',
          }}
        >
          {getApiErrorMessage(error)}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
            Osobni podaci
          </h2>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <dl
              style={{
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'minmax(160px, auto) 1fr',
                gap: '0.75rem 1.5rem',
              }}
            >
              <dt style={{ fontWeight: 600, color: '#374151' }}>Ime</dt>
              <dd style={{ margin: 0, color: '#555' }}>{formatValue(displayPatient.firstName)}</dd>
              <dt style={{ fontWeight: 600, color: '#374151' }}>Prezime</dt>
              <dd style={{ margin: 0, color: '#555' }}>{formatValue(displayPatient.lastName)}</dd>
              <dt style={{ fontWeight: 600, color: '#374151' }}>E-pošta</dt>
              <dd style={{ margin: 0, color: '#555' }}>{formatValue(displayPatient.email)}</dd>
              <dt style={{ fontWeight: 600, color: '#374151' }}>Datum rođenja</dt>
              <dd style={{ margin: 0, color: '#555' }}>{formatValue(displayPatient.dateOfBirth)}</dd>
              <dt style={{ fontWeight: 600, color: '#374151' }}>OIB</dt>
              <dd style={{ margin: 0, color: '#555' }}>{formatValue(displayPatient.oib)}</dd>
            </dl>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
            Kontaktni podaci
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Telefon</span>
              <input
                type="tel"
                value={form.phone}
                onChange={handleTextChange('phone')}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Adresa</span>
              <input
                value={form.address}
                onChange={handleTextChange('address')}
                style={{ padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Kontakt osoba za hitne slučajeve</span>
                <input
                  value={form.emergencyContactName}
                  onChange={handleTextChange('emergencyContactName')}
                  style={{ padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Telefon hitnog kontakta</span>
                <input
                  type="tel"
                  value={form.emergencyContactPhone}
                  onChange={handleTextChange('emergencyContactPhone')}
                  style={{ padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
            Postavke pristupačnosti
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
              <label htmlFor="font-scale" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Veličina teksta
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  id="font-scale"
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={form.fontScale}
                  onChange={handleFontScaleChange}
                  style={{ flex: 1 }}
                  aria-valuetext={`${Math.round(form.fontScale * 100)}%`}
                />
                <span style={{ fontWeight: 600, color: '#374151', minWidth: '3rem' }}>
                  {Math.round(form.fontScale * 100)}%
                </span>
              </div>
            </div>

            {[
              {
                key: 'highContrast' as const,
                title: 'Visoki kontrast',
                description: 'Povećava kontrast boja za bolju čitljivost.',
              },
              {
                key: 'simpleMode' as const,
                title: 'Pojednostavljen prikaz',
                description: 'Smanjuje vizualnu složenost sučelja.',
              },
              {
                key: 'voiceConfirmations' as const,
                title: 'Glasovne potvrde',
                description: 'Omogućuje glasovno čitanje potvrda i važnih poruka.',
              },
            ].map((setting) => (
              <div
                key={setting.key}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{setting.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.15rem' }}>
                    {setting.description}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form[setting.key]}
                  onClick={() => handleBooleanChange(setting.key, !form[setting.key])}
                  style={{
                    width: '3rem',
                    height: '1.5rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: form[setting.key] ? '#2563eb' : '#d1d5db',
                    cursor: 'pointer',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                  aria-label={setting.title}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: form[setting.key] ? 'calc(100% - 1.25rem)' : '2px',
                      width: '1.125rem',
                      height: '1.125rem',
                      borderRadius: '50%',
                      background: '#fff',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={saveProfileMutation.isPending || isLoading}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderRadius: '6px',
              background: '#2563eb',
              color: '#fff',
              cursor: saveProfileMutation.isPending || isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {saveProfileMutation.isPending ? 'Spremanje...' : 'Spremi promjene'}
          </button>
          {savedMessage ? <span style={{ color: '#166534', fontWeight: 600 }}>{savedMessage}</span> : null}
        </div>
      </form>
    </div>
  )
}

export { ProfilePage }
