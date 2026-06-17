import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { OrganizationUserRole } from '@zdravstvo/contracts';
import type { UpdateAdminUserRequestDto } from '@zdravstvo/contracts';
import { APP_ROUTES } from '@/app/routes';
import { adminUsersService, type AdminUserResponseDto } from '@/services';
import { getApiErrorMessage, toast } from '@/utils';

interface ManageUserFormState {
  email: string;
  phone: string;
  role: OrganizationUserRole;
  firstName: string;
  lastName: string;
}

const ROLE_LABELS: Record<OrganizationUserRole, string> = {
  [OrganizationUserRole.MANAGER]: 'Upravitelj',
  [OrganizationUserRole.RECEPTION]: 'Recepcija',
  [OrganizationUserRole.DOCTOR]: 'Liječnik',
  [OrganizationUserRole.PATIENT]: 'Pacijent',
};

const adminUsersQueryKeys = {
  all: ['admin-users'] as const,
  detail: (orgUserId: string) => [...adminUsersQueryKeys.all, 'detail', orgUserId] as const,
};

const createInitialFormState = (): ManageUserFormState => ({
  email: '',
  phone: '',
  role: OrganizationUserRole.PATIENT,
  firstName: '',
  lastName: '',
});

const badge = (text: string, color: string): ReactElement => (
  <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: color + '22', color }}>{text}</span>
);

function ManageAdminUserPage(): ReactElement {
  const { orgUserId } = useParams<{ orgUserId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ManageUserFormState>(createInitialFormState);

  const userQuery = useQuery<AdminUserResponseDto>({
    queryKey: adminUsersQueryKeys.detail(orgUserId ?? ''),
    queryFn: () => adminUsersService.getById(orgUserId ?? ''),
    enabled: Boolean(orgUserId),
  });

  const user = userQuery.data;
  const canEditProfileName = Boolean(user?.firstName || user?.lastName);

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

  const updateUserMutation = useMutation<AdminUserResponseDto, unknown, UpdateAdminUserRequestDto>({
    mutationFn: (payload: UpdateAdminUserRequestDto) => adminUsersService.update(orgUserId ?? '', payload),
    onSuccess: async (updatedUser: AdminUserResponseDto) => {
      queryClient.setQueryData(adminUsersQueryKeys.detail(updatedUser.orgUserId), updatedUser);
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
      toast.success('Podaci korisnika su uspješno spremljeni.');
    },
    onError: (error: unknown) => {
      toast.error(error);
    },
  });

  const activateUserMutation = useMutation<void, unknown, void>({
    mutationFn: () => adminUsersService.activate(orgUserId ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.detail(orgUserId ?? '') });
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
      toast.success('Korisnik je aktiviran.');
    },
    onError: (error: unknown) => {
      toast.error(error);
    },
  });

  const deactivateUserMutation = useMutation<void, unknown, void>({
    mutationFn: () => adminUsersService.deactivate(orgUserId ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.detail(orgUserId ?? '') });
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
      toast.success('Korisnik je deaktiviran.');
    },
    onError: (error: unknown) => {
      toast.error(error);
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const name = event.target.name as keyof ManageUserFormState;
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

    if (!email && !phone) {
      toast.error(new Error('Unesite email ili telefon korisnika.'));
      return;
    }

    const payload: UpdateAdminUserRequestDto = {
      email: email || null,
      phone: phone || null,
      role: form.role,
    };

    if (canEditProfileName) {
      payload.firstName = form.firstName.trim();
      payload.lastName = form.lastName.trim();
    }

    updateUserMutation.mutate(payload);
  };

  const handleToggleActive = (): void => {
    if (!user) return;

    const name = user.displayName ?? user.email ?? user.phone ?? user.orgUserId;

    if (user.isActive) {
      if (!confirm(`Deaktiviraj korisnika "${name}" u organizaciji "${user.organizationName}"?`)) return;
      deactivateUserMutation.mutate();
      return;
    }

    activateUserMutation.mutate();
  };

  if (!orgUserId) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Korisnik nije pronađen</h1>
        <Link to={APP_ROUTES.adminUsers}>Natrag na korisnike</Link>
      </div>
    );
  }

  if (userQuery.isLoading) {
    return <div style={{ padding: '2rem', color: '#6b7280' }}>Učitavanje korisnika...</div>;
  }

  if (userQuery.error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '760px' }}>
        <Link to={APP_ROUTES.adminUsers} style={{ color: '#2563eb', textDecoration: 'none' }}>← Natrag na korisnike</Link>
        <div role="alert" style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px' }}>
          {getApiErrorMessage(userQuery.error)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Korisnik nije pronađen</h1>
        <Link to={APP_ROUTES.adminUsers}>Natrag na korisnike</Link>
      </div>
    );
  }

  const isStatusMutationPending = activateUserMutation.isPending || deactivateUserMutation.isPending;

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to={APP_ROUTES.adminUsers} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>← Natrag na korisnike</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>Upravljanje korisnikom</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#6b7280' }}>
            {user.organizationName} · {ROLE_LABELS[user.role as OrganizationUserRole]}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user.isActive ? badge('Aktivan', '#16a34a') : badge('Neaktivan', '#dc2626')}
          <button
            type="button"
            disabled={isStatusMutationPending}
            onClick={handleToggleActive}
            style={{ padding: '0.5rem 0.9rem', background: user.isActive ? '#fee2e2' : '#dcfce7', color: user.isActive ? '#b91c1c' : '#166534', border: 'none', borderRadius: '6px', cursor: isStatusMutationPending ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            {user.isActive
              ? (deactivateUserMutation.isPending ? 'Deaktiviranje...' : 'Deaktiviraj')
              : (activateUserMutation.isPending ? 'Aktiviranje...' : 'Aktiviraj')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1.25rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="korisnik@example.com"
              style={{ padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Telefon</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="+385..."
              style={{ padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>Uloga</span>
          <select
            name="role"
            value={form.role}
            onChange={handleInputChange}
            style={{ padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
          >
            {Object.values(OrganizationUserRole).map((role) => (
              <option key={role} value={role}>{ROLE_LABELS[role]}</option>
            ))}
          </select>
        </label>

        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', margin: 0 }}>
          <legend style={{ padding: '0 0.35rem', fontWeight: 600, color: '#374151' }}>Profil</legend>
          {canEditProfileName ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Ime</span>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  style={{ padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Prezime</span>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  style={{ padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
                />
              </label>
            </div>
          ) : (
            <p style={{ margin: 0, color: '#6b7280' }}>
              Ovaj korisnik nema liječnički ili pacijentski profil, pa se ovdje uređuju samo kontakt i uloga.
            </p>
          )}
        </fieldset>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(APP_ROUTES.adminUsers)}
            style={{ padding: '0.55rem 1rem', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Odustani
          </button>
          <button
            type="submit"
            disabled={updateUserMutation.isPending}
            style={{ padding: '0.55rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: updateUserMutation.isPending ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            {updateUserMutation.isPending ? 'Spremanje...' : 'Spremi promjene'}
          </button>
        </div>
      </form>
    </div>
  );
}

export { ManageAdminUserPage };
