import type { ChangeEvent, ReactElement } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { OrganizationUserRole } from '@zdravstvo/contracts';
import { APP_ROUTES } from '@/app/routes';
import { AppIcon } from '@/components';
import { managerUsersService } from '@/services';
import { getApiErrorMessage } from '@/utils';

import { ROLE_LABELS, managerUsersQueryKeys } from './users.shared';

import './users.css';

const getManageUserPath = (orgUserId: string): string =>
  APP_ROUTES.usersManage.replace(':orgUserId', encodeURIComponent(orgUserId));

const getUserInitials = (displayName: string | null, email: string | null): string => {
  if (displayName) {
    return displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  return (email?.[0] ?? 'K').toUpperCase();
};

function ManagerUsersPage(): ReactElement {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<OrganizationUserRole | ''>('');

  const usersQuery = useQuery({
    queryKey: managerUsersQueryKeys.list(page, search, roleFilter),
    queryFn: () => managerUsersService.list({
      page,
      search: search || undefined,
      role: roleFilter || undefined,
    }),
  });

  const users = usersQuery.data?.users ?? [];
  const totalPages = usersQuery.data?.pagination.totalPages ?? 1;
  const totalItems = usersQuery.data?.pagination.totalItems ?? 0;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setRoleFilter(event.target.value as OrganizationUserRole | '');
    setPage(1);
  };

  return (
    <div className="manager-users-page">
      <div className="manager-users-hero">
        <div>
          <h1>Korisnici</h1>
          <p>Upravljanje korisnicima unutar vaše ustanove.</p>
        </div>
        <Link to={APP_ROUTES.usersCreate} className="manager-users-primary-link">
          <AppIcon name="plus" />
          Novi korisnik
        </Link>
      </div>

      {usersQuery.error && (
        <div role="alert" className="manager-users-alert">
          {getApiErrorMessage(usersQuery.error)}
        </div>
      )}

      <div className="manager-users-filters">
        <label className="manager-users-search-field">
          <AppIcon name="search" />
          <input
            type="search"
            placeholder="Pretražite korisnike po imenu, emailu ili telefonu..."
            value={search}
            onChange={handleSearchChange}
            className="manager-users-input"
          />
        </label>
        <select
          value={roleFilter}
          onChange={handleRoleChange}
          className="manager-users-select"
          aria-label="Filtriraj po ulozi"
        >
          <option value="">Sve uloge</option>
          {Object.values(OrganizationUserRole).map((role) => (
            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
          ))}
        </select>
      </div>

      {usersQuery.isLoading ? (
        <div className="manager-users-loading">Učitavanje korisnika...</div>
      ) : users.length === 0 ? (
        <div className="manager-users-empty">
          Nema korisnika koji odgovaraju odabranim filterima.
        </div>
      ) : (
        <section className="manager-users-table-panel">
          <div className="manager-users-table-scroll">
            <table className="manager-users-table">
              <thead>
                <tr>
                  <th>Korisnik</th>
                  <th>Kontakt</th>
                  <th>Uloga</th>
                  <th>Status</th>
                  <th aria-label="Akcije" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.orgUserId}>
                    <td>
                      <div className="manager-users-user-cell">
                        <div className="manager-users-avatar">
                          {getUserInitials(user.displayName, user.email)}
                        </div>
                        <div>
                          <strong>{user.displayName ?? 'Korisnik bez profila'}</strong>
                          <span className="manager-users-muted">{user.email ?? user.phone ?? 'Kontakt nije upisan'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.email ?? user.phone ?? <span className="manager-users-muted">—</span>}</td>
                    <td>
                      <span className="manager-user-badge">{ROLE_LABELS[user.role]}</span>
                    </td>
                    <td>
                      <span className={`manager-user-status-badge manager-user-status-badge--${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </td>
                    <td>
                      <Link to={getManageUserPath(user.orgUserId)} className="manager-users-manage-link">
                        Upravljaj
                        <AppIcon name="chevronRight" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="manager-users-pagination">
            <span>Ukupno: {totalItems} korisnika</span>
            <div className="manager-users-pagination-controls">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => { setPage((currentPage) => currentPage - 1); }}
              >
                ‹ Prethodna
              </button>
              <span>Stranica {page} od {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => { setPage((currentPage) => currentPage + 1); }}
              >
                Sljedeća ›
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export { ManagerUsersPage };
