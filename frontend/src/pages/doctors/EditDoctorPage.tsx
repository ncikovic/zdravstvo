import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { DoctorResponseDto, UpdateDoctorRequestDto } from '@zdravstvo/contracts';
import { APP_ROUTES } from '@/app/routes';
import { AppIcon } from '@/components';
import { doctorsService } from '@/services/doctors.service';
import { getApiErrorMessage, toast } from '@/utils';

import './doctors.css';

interface EditDoctorFormState {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  title: string;
  licenseNumber: string;
  bio: string;
  isActive: boolean;
}

const doctorQueryKeys = {
  all: ['doctors'] as const,
  detail: (doctorId: string) => [...doctorQueryKeys.all, 'detail', doctorId] as const,
};

const createInitialFormState = (): EditDoctorFormState => ({
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  title: '',
  licenseNumber: '',
  bio: '',
  isActive: true,
});

const getDoctorDetailsPath = (doctorId: string): string => (
  APP_ROUTES.doctorDetails.replace(':doctorId', encodeURIComponent(doctorId))
);

function EditDoctorPage(): ReactElement {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EditDoctorFormState>(createInitialFormState);

  const doctorQuery = useQuery<DoctorResponseDto>({
    queryKey: doctorQueryKeys.detail(doctorId ?? ''),
    queryFn: () => doctorsService.getById(doctorId ?? ''),
    enabled: Boolean(doctorId),
  });

  const doctor = doctorQuery.data;

  useEffect(() => {
    if (!doctor) return;

    setForm({
      email: doctor.email ?? '',
      phone: doctor.phone ?? '',
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      title: doctor.title ?? '',
      licenseNumber: doctor.licenseNumber ?? '',
      bio: doctor.bio ?? '',
      isActive: doctor.isActive,
    });
  }, [doctor]);

  const updateDoctorMutation = useMutation<DoctorResponseDto, unknown, UpdateDoctorRequestDto>({
    mutationFn: (payload: UpdateDoctorRequestDto) => doctorsService.update(doctorId ?? '', payload),
    onSuccess: async (updatedDoctor: DoctorResponseDto) => {
      queryClient.setQueryData(doctorQueryKeys.detail(updatedDoctor.id), updatedDoctor);
      await queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all });
      toast.success('Podaci liječnika su uspješno spremljeni.');
      navigate(getDoctorDetailsPath(updatedDoctor.id));
    },
    onError: (error: unknown) => {
      toast.error(error);
    },
  });

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === 'isActive' ? value === 'true' : value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const email = form.email.trim();
    const phone = form.phone.trim();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    if (!firstName || !lastName) {
      toast.error(new Error('Ime i prezime su obavezni.'));
      return;
    }

    const payload: UpdateDoctorRequestDto = {
      email: email || null,
      phone: phone || null,
      firstName,
      lastName,
      title: form.title.trim() || null,
      licenseNumber: form.licenseNumber.trim() || null,
      bio: form.bio.trim() || null,
      isActive: form.isActive,
    };

    updateDoctorMutation.mutate(payload);
  };

  const handleCancel = (): void => {
    if (doctorId) {
      navigate(getDoctorDetailsPath(doctorId));
      return;
    }

    navigate(APP_ROUTES.doctors);
  };

  if (!doctorId) {
    return (
      <div className="create-doctor-page">
        <div className="doctor-details-section" style={{ textAlign: 'center' }}>
          Liječnik nije pronađen.
        </div>
      </div>
    );
  }

  if (doctorQuery.isLoading) {
    return (
      <div className="create-doctor-page" style={{ padding: '2rem', textAlign: 'center' }}>
        Učitavanje liječnika...
      </div>
    );
  }

  if (doctorQuery.error || !doctor) {
    return (
      <div className="create-doctor-page">
        <button type="button" className="doctor-details-back-button" onClick={() => navigate(APP_ROUTES.doctors)}>
          <AppIcon name="chevronLeft" />
          Povratak na liječnike
        </button>
        <div role="alert" className="doctor-details-section" style={{ color: '#d32f2f' }}>
          {doctorQuery.error ? getApiErrorMessage(doctorQuery.error) : 'Liječnik nije pronađen.'}
        </div>
      </div>
    );
  }

  return (
    <div className="create-doctor-page">
      <div className="doctor-details-breadcrumb">
        <button type="button" onClick={() => navigate(APP_ROUTES.doctors)} className="doctor-details-breadcrumb-link">
          Liječnici
        </button>
        <AppIcon name="chevronRight" />
        <button type="button" onClick={() => navigate(getDoctorDetailsPath(doctor.id))} className="doctor-details-breadcrumb-link">
          Detalji liječnika
        </button>
        <AppIcon name="chevronRight" />
        <span>Uredi podatke</span>
      </div>

      <div className="doctor-details-header">
        <div>
          <h1>Uredi podatke liječnika</h1>
          <p>Ažuriranje osnovnih podataka, licence, biografije i statusa.</p>
        </div>
        <button type="button" className="doctor-details-back-button" onClick={() => navigate(getDoctorDetailsPath(doctor.id))}>
          <AppIcon name="chevronLeft" />
          Povratak na detalje
        </button>
      </div>

      <div className="create-doctor-content-grid">
        <form onSubmit={handleSubmit} className="create-doctor-card">
          <div className="create-doctor-card__section">
            <h2 className="create-doctor-card__section-title">Osnovni podaci</h2>

            <div className="create-doctor-fields-row create-doctor-fields-row--2">
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="firstName">
                  Ime <span className="create-doctor-required">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  className="create-doctor-field__input"
                  type="text"
                  value={form.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="lastName">
                  Prezime <span className="create-doctor-required">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  className="create-doctor-field__input"
                  type="text"
                  value={form.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="create-doctor-fields-row create-doctor-fields-row--2">
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="title">
                  Zvanje / specijalizacija
                </label>
                <input
                  id="title"
                  name="title"
                  className="create-doctor-field__input"
                  type="text"
                  placeholder="npr. dr. med."
                  value={form.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="licenseNumber">
                  Broj licence
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  className="create-doctor-field__input"
                  type="text"
                  value={form.licenseNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="create-doctor-field">
              <label className="create-doctor-field__label" htmlFor="isActive">
                Status
              </label>
              <select
                id="isActive"
                name="isActive"
                className="create-doctor-field__select"
                value={String(form.isActive)}
                onChange={handleInputChange}
              >
                <option value="true">Aktivan</option>
                <option value="false">Neaktivan</option>
              </select>
            </div>
          </div>

          <div className="create-doctor-card__section">
            <h2 className="create-doctor-card__section-title">Kontakt i biografija</h2>

            <div className="create-doctor-fields-row create-doctor-fields-row--2">
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  className="create-doctor-field__input"
                  type="email"
                  placeholder="lijecnik@example.com"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="phone">
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="create-doctor-field__input"
                  type="tel"
                  placeholder="+385..."
                  value={form.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="create-doctor-field">
              <label className="create-doctor-field__label" htmlFor="bio">
                Kratka biografija
              </label>
              <textarea
                id="bio"
                name="bio"
                className="create-doctor-field__textarea"
                placeholder="Napišite kratki opis liječnika..."
                value={form.bio}
                onChange={handleInputChange}
                rows={5}
                maxLength={5000}
              />
              <span className="create-doctor-field__count">{form.bio.length} / 5000</span>
            </div>
          </div>

          <div className="create-doctor-card__actions">
            <button className="create-doctor-btn create-doctor-btn--secondary" type="button" onClick={handleCancel}>
              Odustani
            </button>
            <button
              className="create-doctor-btn create-doctor-btn--primary"
              type="submit"
              disabled={updateDoctorMutation.isPending}
            >
              <AppIcon name="note" />
              {updateDoctorMutation.isPending ? 'Spremanje...' : 'Spremi promjene'}
            </button>
          </div>
        </form>

        <aside className="create-doctor-sidebar">
          <div className="create-doctor-info-card">
            <h3 className="create-doctor-info-card__title">Sažetak profila</h3>

            <div className="create-doctor-info-preview">
              <div className="create-doctor-preview-avatar">
                <span>{(form.firstName[0] || 'L').toUpperCase()}{(form.lastName[0] || 'L').toUpperCase()}</span>
              </div>
              <div className="create-doctor-preview-info">
                <strong>{form.firstName && form.lastName ? `${form.firstName} ${form.lastName}` : 'Liječnik'}</strong>
                {form.title && <span>{form.title}</span>}
                {!form.title && <em>Nema navedenog zvanja</em>}
              </div>
            </div>

            <div className="create-doctor-info-section">
              <span className="create-doctor-info-section__title">Status</span>
              <p>
                <em className={`status-badge ${form.isActive ? 'status-badge--active' : ''}`}>
                  {form.isActive ? 'Aktivan' : 'Neaktivan'}
                </em>
              </p>
            </div>

            <div className="create-doctor-info-section">
              <span className="create-doctor-info-section__title">Licenca</span>
              <p>{form.licenseNumber || '—'}</p>
            </div>

            <div className="create-doctor-info-section">
              <span className="create-doctor-info-section__title">Kontakt</span>
              <p>{form.email || form.phone || 'Nije dostupno'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { EditDoctorPage };
