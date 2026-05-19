import type {
  AdminUserListQueryDto,
  AdminUserListResponseDto,
  AdminUserResponseDto,
  OrganizationUserRole,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import {
  AdminUsersRepository,
  type AdminUserRecord,
  type FindAdminUsersInput,
} from '../repositories/index.js';
import { db } from '../shared/db/index.js';

const PAGE_SIZE = 20;

const buildDisplayName = (record: AdminUserRecord): string | null => {
  const firstName = record.patientFirstName ?? record.doctorFirstName;
  const lastName = record.patientLastName ?? record.doctorLastName;

  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return null;
};

const mapAdminUserResponse = (record: AdminUserRecord): AdminUserResponseDto => ({
  orgUserId: record.orgUserId,
  userId: record.userId,
  email: record.email,
  phone: record.phone,
  userStatus: record.userStatus,
  role: record.role,
  isActive: record.isActive,
  organizationId: record.organizationId,
  organizationName: record.organizationName,
  displayName: buildDisplayName(record),
});

export class AdminUsersService {
  public constructor(
    private readonly adminUsersRepository: AdminUsersRepository = new AdminUsersRepository(db),
  ) {}

  public async list(query: AdminUserListQueryDto): Promise<AdminUserListResponseDto> {
    const page = query.page ?? 1;
    const input: FindAdminUsersInput = {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      organizationId: query.organizationId,
      role: query.role as OrganizationUserRole | undefined,
      search: query.search,
    };

    const [users, totalItems] = await Promise.all([
      this.adminUsersRepository.findMany(input),
      this.adminUsersRepository.countMany(input),
    ]);

    return {
      users: users.map(mapAdminUserResponse),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
      },
    };
  }

  public async deactivate(orgUserId: string): Promise<void> {
    const wasDeactivated = await this.adminUsersRepository.deactivate(orgUserId);

    if (!wasDeactivated) {
      throw AppError.notFound('Organization user not found.');
    }
  }
}

export const adminUsersService = new AdminUsersService();
