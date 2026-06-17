import type { ReactElement } from 'react';

import { OrganizationUserRole } from '@zdravstvo/contracts';

export interface ManagerUserFormState {
  email: string;
  phone: string;
  role: OrganizationUserRole;
  firstName: string;
  lastName: string;
}

export const ROLE_LABELS: Record<OrganizationUserRole, string> = {
  [OrganizationUserRole.MANAGER]: 'Upravitelj',
  [OrganizationUserRole.RECEPTION]: 'Recepcija',
  [OrganizationUserRole.DOCTOR]: 'Liječnik',
  [OrganizationUserRole.PATIENT]: 'Pacijent',
};

export const managerUsersQueryKeys = {
  all: ['manager-users'] as const,
  list: (page: number, search: string, role: OrganizationUserRole | '') =>
    [...managerUsersQueryKeys.all, 'list', page, search, role] as const,
  detail: (orgUserId: string) => [...managerUsersQueryKeys.all, 'detail', orgUserId] as const,
};

export const createInitialManagerUserFormState = (): ManagerUserFormState => ({
  email: '',
  phone: '',
  role: OrganizationUserRole.PATIENT,
  firstName: '',
  lastName: '',
});

export const roleNeedsProfileName = (role: OrganizationUserRole): boolean => {
  return role === OrganizationUserRole.DOCTOR || role === OrganizationUserRole.PATIENT;
};

export const badge = (text: string, color: string): ReactElement => (
  <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: color + '22', color }}>{text}</span>
);
