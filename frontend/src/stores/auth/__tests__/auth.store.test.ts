import { beforeEach, describe, expect, it } from 'vitest';

import { OrganizationUserRole } from '@zdravstvo/contracts';
import type { AuthenticatedAuthResponseDto } from '@zdravstvo/contracts';

import { clearAuthState, getAccessToken, useAuthStore } from '../auth.store';

const resetStore = () => {
  localStorage.clear();
  useAuthStore.getState().clearAuth();
};

const makeOrgScopedAuth = (
  overrides: Partial<AuthenticatedAuthResponseDto> = {},
): AuthenticatedAuthResponseDto => ({
  authenticated: true,
  requiresOrganizationSelection: false,
  accessToken: 'test-access-token',
  user: {
    userId: 'user-id',
    email: 'test@example.com',
    phone: '+385911111111',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: null,
    oib: null,
    address: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    isSystemAdmin: false,
  },
  isSystemAdmin: false,
  role: OrganizationUserRole.MANAGER,
  organizationId: 'org-id',
  organizationName: 'Test Organization',
  orgUserId: 'org-user-id',
  ...overrides,
});

const makeSystemAdminAuth = (): AuthenticatedAuthResponseDto => ({
  authenticated: true,
  requiresOrganizationSelection: false,
  accessToken: 'admin-access-token',
  user: {
    userId: 'admin-id',
    email: 'admin@example.com',
    phone: null,
    firstName: 'Admin',
    lastName: 'User',
    dateOfBirth: null,
    oib: null,
    address: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    isSystemAdmin: true,
  },
  isSystemAdmin: true,
  role: null,
  organizationId: null,
  organizationName: null,
  orgUserId: null,
});

describe('useAuthStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts in an unauthenticated state', () => {
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.organizationId).toBeNull();
  });

  it('setAuth with org-scoped response sets isAuthenticated true and stores fields', () => {
    const auth = makeOrgScopedAuth();

    useAuthStore.getState().setAuth(auth);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('test-access-token');
    expect(state.role).toBe(OrganizationUserRole.MANAGER);
    expect(state.organizationId).toBe('org-id');
    expect(state.orgUserId).toBe('org-user-id');
    expect(state.isSystemAdmin).toBe(false);
  });

  it('setAuth with system admin response sets isAuthenticated true', () => {
    const auth = makeSystemAdminAuth();

    useAuthStore.getState().setAuth(auth);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isSystemAdmin).toBe(true);
    expect(state.accessToken).toBe('admin-access-token');
    expect(state.role).toBeNull();
    expect(state.organizationId).toBeNull();
  });

  it('clearAuth resets all fields and sets isAuthenticated false', () => {
    useAuthStore.getState().setAuth(makeOrgScopedAuth());
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.organizationId).toBeNull();
  });

  it('setAccessToken to null sets isAuthenticated false', () => {
    useAuthStore.getState().setAuth(makeOrgScopedAuth());
    useAuthStore.getState().setAccessToken(null);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('setAccessToken to a new value updates the token', () => {
    useAuthStore.getState().setAuth(makeOrgScopedAuth());
    useAuthStore.getState().setAccessToken('refreshed-token');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('refreshed-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('getAccessToken returns the current access token', () => {
    useAuthStore.getState().setAuth(makeOrgScopedAuth());

    expect(getAccessToken()).toBe('test-access-token');
  });

  it('clearAuthState helper clears the store', () => {
    useAuthStore.getState().setAuth(makeOrgScopedAuth());
    clearAuthState();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
