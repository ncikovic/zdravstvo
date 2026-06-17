import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { OrganizationUserRole } from '@zdravstvo/contracts';
import type { CreateManagerUserRequestDto } from '@zdravstvo/contracts';
import { APP_ROUTES } from '@/app/routes';
import { managerUsersService } from '@/services';
import type { ManagerUserResponseDto } from '@/services';
import { toast } from '@/utils';

import {
  ROLE_LABELS,
  createInitialManagerUserFormState,
  managerUsersQueryKeys,
  roleNeedsProfileName,
  type ManagerUserFormState,
} from './users.shared';

const getManageUserPath = (orgUserId: string): string =>
  APP_ROUTES.usersManage.replace(':orgUserId', encodeURIComponent(orgUserId));

function CreateManagerUserPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ManagerUserFormState>(createInitialManagerUserFormState);
  const selectedRoleNeedsProfile = roleNeedsProfileName(form.role);

  const createUserMutation = useMutation<ManagerUserResponseDto, unknown, CreateManagerUserRequestDto>({
    mutationFn: (payload: CreateManagerUserRequestDto) => managerUsersService.create(payload),
    onSuccess: async (createdUser: ManagerUserResponseDto) => {
      queryClient.setQueryData(managerUsersQueryKeys.detail(createdUser.orgUserId), createdUser);
      await queryClient.invalidateQueries({ queryKey: managerUsersQueryKeys.all });
      toast.success('Korisnik je uspješno dodan u ustanovu.');
      navigate(getManageUserPath(createdUser.orgUserId));
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

    const payload: CreateManagerUserRequestDto = {
      email: email || null,
      phone: phone || null,
      role: form.role,
    };

    if (selectedRoleNeedsProfile) {
      payload.firstName = firstName;
      payload.lastName = lastName;
    }

    createUserMutation.mutate(payload);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to={APP_ROUTES.users} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>← Natrag na korisnike</Link>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Novi korisnik</h1>
        <p style={{ margin: '0.35rem 0 0', color: '#6b7280' }}>
          Dodavanje korisnika u vašu ustanovu.
        </p>
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
          {selectedRoleNeedsProfile ? (
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
              Ime i prezime se vode samo za liječničke i pacijentske profile.
            </p>
          )}
        </fieldset>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Link
            to={APP_ROUTES.users}
            style={{ padding: '0.6rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', textDecoration: 'none' }}
          >
            Odustani
          </Link>
          <button
            type="submit"
            disabled={createUserMutation.isPending}
            style={{ padding: '0.6rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: createUserMutation.isPending ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            {createUserMutation.isPending ? 'Dodavanje...' : 'Dodaj korisnika'}
          </button>
        </div>
      </form>
    </div>
  );
}

export { CreateManagerUserPage };
