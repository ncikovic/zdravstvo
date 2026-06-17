import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { OrganizationUserRole } from '@zdravstvo/contracts';
import type { UpdateManagerUserRequestDto } from '@zdravstvo/contracts';
import { APP_ROUTES } from '@/app/routes';
import { AppIcon } from '@/components';
import { managerUsersService } from '@/services';
import type { ManagerUserResponseDto } from '@/services';
import { getApiErrorMessage, toast } from '@/utils';

import {
  ROLE_LABELS,
  createInitialManagerUserFormState,
  managerUsersQueryKeys,
  roleNeedsProfileName,
  type ManagerUserFormState,
} from './users.shared';

import './users.css';

const getUserInitials = (user: ManagerUserResponseDto): string => {
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  return (user.email?.[0] ?? 'K').toUpperCase();
};

const getUserDisplayName = (user: ManagerUserResponseDto): string => {
  return user.displayName ?? user.email ?? user.phone ?? 'Korisnik bez profila';
};

function ManageManagerUserPage(): ReactElement {
  const { orgUserId } = useParams<{ orgUserId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ManagerUserFormState>(createInitialManagerUserFormState);

  const userQuery = useQuery<ManagerUserResponseDto>({
    queryKey: managerUsersQueryKeys.detail(orgUserId ?? ''),
    queryFn: () => managerUsersService.getById(orgUserId ?? ''),
    enabled: Boolean(orgUserId),
  });

  const user = userQuery.data;
  const selectedRoleNeedsProfile = roleNeedsProfileName(form.role);

  useEffect(() => {
    if (!user) return;

    setForm({
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    });
  }, [user]);

  const updateUserMutation = useMutation<ManagerUserResponseDto, unknown, UpdateManagerUserRequestDto>({
    mutationFn: (payload: UpdateManagerUserRequestDto) => managerUsersService.update(orgUserId ?? '', payload),
    onSuccess: async (updatedUser: ManagerUserResponseDto) => {
      queryClient.setQueryData(managerUsersQueryKeys.detail(updatedUser.orgUserId), updatedUser);
      await queryClient.invalidateQueries({ queryKey: managerUsersQueryKeys.all });
      toast.success('Podaci korisnika su uspješno spremljeni.');
    },
    onError: (error: unknown) => {
      toast.error(error);
    },
  });

  const activateUserMutation = useMutation<void, unknown, void>({
    mutationFn: () => managerUsersService.activate(orgUserId ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerUsersQueryKeys.detail(orgUserId ?? '') });
      await queryClient.invalidateQueries({ queryKey: managerUsersQueryKeys.all });
      toast.success('Korisnik je aktiviran.');
    },
    onError: (error: unknown) => {
      toast.error(error);
    },
  });

  const deactivateUserMutation = useMutation<void, unknown, void>({
    mutationFn: () => managerUsersService.deactivate(orgUserId ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerUsersQueryKeys.detail(orgUserId ?? '') });
      await queryClient.invalidateQueries({ queryKey: managerUsersQueryKeys.all });
      toast.success('Korisnik je deaktiviran.');
    },
    onError: (error: unknown) => {
      toast.error(error);
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const name = event.target.name as keyof ManagerUserFormState;
    const value = name === 'role' ? (event.target.value as OrganizationUserRole) : event.target.value;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const email = form.email.trim();
    const phone = form.phone.trim();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    if (!email && !phone) {
      toast.error(new Error('Unesite email ili telefon korisnika.'));
      return;
    }

    if (selectedRoleNeedsProfile && (!firstName || !lastName)) {
      toast.error(new Error('Ime i prezime su obavezni za liječnike i pacijente.'));
      return;
    }

    const payload: UpdateManagerUserRequestDto = {
      email: email || null,
      phone: phone || null,
      role: form.role,
    };

    if (selectedRoleNeedsProfile) {
      payload.firstName = firstName;
      payload.lastName = lastName;
    }

    updateUserMutation.mutate(payload);
  };

  const handleToggleActive = (): void => {
    if (!user) return;

    const name = getUserDisplayName(user);

    if (user.isActive) {
      if (!confirm(`Deaktiviraj korisnika "${name}"?`)) return;
      deactivateUserMutation.mutate();
      return;
    }

    activateUserMutation.mutate();
  };

  if (!orgUserId) {
    return (
      <div className="manager-user-details-page">
        <div className="manager-user-details-empty">
          Korisnik nije pronađen.
          <br />
          <Link to={APP_ROUTES.users}>Natrag na korisnike</Link>
        </div>
      </div>
    );
  }

  if (userQuery.isLoading) {
    return <div className="manager-user-details-loading">Učitavanje korisnika...</div>;
  }

  if (userQuery.error) {
    return (
      <div className="manager-user-details-page">
        <button type="button" className="manager-user-details-back-button" onClick={() => navigate(APP_ROUTES.users)}>
          <AppIcon name="chevronLeft" />
          Natrag na korisnike
        </button>
        <div role="alert" className="manager-user-details-alert">
          {getApiErrorMessage(userQuery.error)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="manager-user-details-page">
        <div className="manager-user-details-empty">
          Korisnik nije pronađen.
          <br />
          <Link to={APP_ROUTES.users}>Natrag na korisnike</Link>
        </div>
      </div>
    );
  }

  const isStatusMutationPending = activateUserMutation.isPending || deactivateUserMutation.isPending;
  const displayName = getUserDisplayName(user);

  return (
    <div className="manager-user-details-page">
      <div className="manager-user-details-breadcrumb">
        <button type="button" onClick={() => navigate(APP_ROUTES.users)} className="manager-user-details-breadcrumb-link">
          Korisnici
        </button>
        <AppIcon name="chevronRight" />
        <span>Upravljanje korisnikom</span>
      </div>

      <div className="manager-user-details-header">
        <div>
          <h1>Upravljanje korisnikom</h1>
          <p>Pregled i izmjena korisničkih podataka unutar vaše ustanove.</p>
        </div>
        <button type="button" className="manager-user-details-back-button" onClick={() => navigate(APP_ROUTES.users)}>
          <AppIcon name="chevronLeft" />
          Povratak na korisnike
        </button>
      </div>

      <form onSubmit={handleSubmit} className="manager-user-details-content-grid">
        <section className="manager-user-details-main">
          <div className="manager-user-details-header-card">
            <div className="manager-user-details-header-info">
              <div className="manager-user-details-avatar">{getUserInitials(user)}</div>
              <div className="manager-user-details-header-text">
                <div className="manager-user-details-header-title">
                  <h2>{displayName}</h2>
                  <span className={`manager-user-status-badge manager-user-status-badge--${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </div>
                <div className="manager-user-details-meta">
                  <span>
                    <AppIcon name="building" />
                    {user.organizationName}
                  </span>
                  <span>
                    <AppIcon name="shieldCheck" />
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="manager-user-details-section">
            <h3 className="manager-user-details-section-title">Osnovne informacije</h3>
            <div className="manager-user-details-fields-grid">
              <label className="manager-user-details-field">
                <span className="manager-user-details-label">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="korisnik@example.com"
                  className="manager-user-details-input"
                />
              </label>

              <label className="manager-user-details-field">
                <span className="manager-user-details-label">Telefon</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="+385..."
                  className="manager-user-details-input"
                />
              </label>
            </div>
          </div>

          <div className="manager-user-details-section">
            <h3 className="manager-user-details-section-title">Uloga i profil</h3>
            <div className="manager-user-details-fields-grid">
              <label className="manager-user-details-field">
                <span className="manager-user-details-label">Uloga</span>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  className="manager-user-details-select"
                >
                  {Object.values(OrganizationUserRole).map((role) => (
                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                  ))}
                </select>
              </label>

              {selectedRoleNeedsProfile ? (
                <>
                  <label className="manager-user-details-field">
                    <span className="manager-user-details-label">Ime</span>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleInputChange}
                      className="manager-user-details-input"
                    />
                  </label>

                  <label className="manager-user-details-field">
                    <span className="manager-user-details-label">Prezime</span>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleInputChange}
                      className="manager-user-details-input"
                    />
                  </label>
                </>
              ) : (
                <p className="manager-user-details-help-text">
                  Ime i prezime se vode samo za liječničke i pacijentske profile.
                </p>
              )}
            </div>
          </div>

          <div className="manager-user-details-actions-row">
            <Link to={APP_ROUTES.users} className="manager-user-details-secondary-button">
              Odustani
            </Link>
            <button type="submit" disabled={updateUserMutation.isPending} className="manager-user-details-primary-button">
              <AppIcon name="note" />
              {updateUserMutation.isPending ? 'Spremanje...' : 'Spremi promjene'}
            </button>
          </div>
        </section>

        <aside className="manager-user-details-sidebar">
          <div className="manager-user-details-card">
            <h3 className="manager-user-details-card-title">Brze akcije</h3>
            <button
              type="button"
              disabled={isStatusMutationPending}
              onClick={handleToggleActive}
              className={`manager-user-details-status-button manager-user-details-status-button--${user.isActive ? 'deactivate' : 'activate'}`}
            >
              <AppIcon name={user.isActive ? 'xCircle' : 'checkCircle'} />
              {user.isActive
                ? (deactivateUserMutation.isPending ? 'Deaktiviranje...' : 'Deaktiviraj korisnika')
                : (activateUserMutation.isPending ? 'Aktiviranje...' : 'Aktiviraj korisnika')}
            </button>
          </div>

          <div className="manager-user-details-card">
            <h3 className="manager-user-details-card-title">Sažetak</h3>
            <div className="manager-user-details-summary-list">
              <div className="manager-user-details-summary-item">
                <div>
                  <AppIcon name="checkCircle" />
                  <span>Status</span>
                </div>
                <strong>{user.isActive ? 'Aktivan' : 'Neaktivan'}</strong>
              </div>
              <div className="manager-user-details-summary-item">
                <div>
                  <AppIcon name="shieldCheck" />
                  <span>Uloga</span>
                </div>
                <strong>{ROLE_LABELS[user.role]}</strong>
              </div>
              <div className="manager-user-details-summary-item">
                <div>
                  <AppIcon name="building" />
                  <span>Ustanova</span>
                </div>
                <strong>{user.organizationName}</strong>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export { ManageManagerUserPage };
