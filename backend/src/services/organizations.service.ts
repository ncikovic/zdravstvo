import type {
  CreateOrganizationRequestDto,
  OrganizationListQueryDto,
  OrganizationListResponseDto,
  OrganizationResponseDto,
  UpdateOrganizationRequestDto,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import {
  OrganizationsRepository,
  type CreateOrganizationRecordInput,
  type UpdateOrganizationRecordInput,
} from '../repositories/index.js';
import { db } from '../shared/db/index.js';
import type { OrganizationRecord } from '../types/entities/index.js';

type OrganizationsRepositoryContract = Pick<
  OrganizationsRepository,
  'create' | 'findAll' | 'findPage' | 'findById' | 'update' | 'delete'
>;

const DEFAULT_ORGANIZATION_TIMEZONE = 'Europe/Zagreb';
const PUBLIC_ORGANIZATIONS_PAGE_SIZE = 3;

const normalizeRequiredString = (value: string): string => {
  return value.trim();
};

const normalizeOptionalString = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeOptionalUpdateString = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return normalizeOptionalString(value);
};

const mapOrganizationResponse = (organization: OrganizationRecord): OrganizationResponseDto => {
  return {
    id: organization.id,
    name: organization.name,
    address: organization.address,
    city: organization.city,
    phone: organization.phone,
    email: organization.email,
    timezone: organization.timezone,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
  };
};

const createOrganizationNotFoundError = (): AppError => {
  return AppError.notFound('Organization not found.');
};

export class OrganizationsService {
  public constructor(
    private readonly organizationsRepository: OrganizationsRepositoryContract = new OrganizationsRepository(
      db,
    ),
  ) {}

  public async create(payload: CreateOrganizationRequestDto): Promise<OrganizationResponseDto> {
    const organizationInput: CreateOrganizationRecordInput = {
      name: normalizeRequiredString(payload.name),
      address: normalizeOptionalString(payload.address),
      city: normalizeOptionalString(payload.city),
      phone: normalizeOptionalString(payload.phone),
      email: normalizeOptionalString(payload.email),
      timezone: normalizeRequiredString(payload.timezone || DEFAULT_ORGANIZATION_TIMEZONE),
    };

    const organization = await this.organizationsRepository.create(organizationInput);

    return mapOrganizationResponse(organization);
  }

  public async list(): Promise<OrganizationListResponseDto> {
    const organizations = await this.organizationsRepository.findAll();
    const totalItems = organizations.length;

    return {
      organizations: organizations.map(mapOrganizationResponse),
      pagination: {
        page: 1,
        pageSize: totalItems,
        totalItems,
        totalPages: totalItems > 0 ? 1 : 0,
      },
    };
  }

  public async listPublic(query: OrganizationListQueryDto): Promise<OrganizationListResponseDto> {
    const page = query.page;
    const pageSize = PUBLIC_ORGANIZATIONS_PAGE_SIZE;
    const organizationPage = await this.organizationsRepository.findPage({
      search: normalizeOptionalString(query.search),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      organizations: organizationPage.organizations.map(mapOrganizationResponse),
      pagination: {
        page,
        pageSize,
        totalItems: organizationPage.totalItems,
        totalPages: Math.ceil(organizationPage.totalItems / pageSize),
      },
    };
  }

  public async getById(organizationId: string): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsRepository.findById(organizationId);

    if (!organization) {
      throw createOrganizationNotFoundError();
    }

    return mapOrganizationResponse(organization);
  }

  public async update(
    organizationId: string,
    payload: UpdateOrganizationRequestDto,
  ): Promise<OrganizationResponseDto> {
    const updateInput: UpdateOrganizationRecordInput = {
      name: payload.name === undefined ? undefined : normalizeRequiredString(payload.name),
      address: normalizeOptionalUpdateString(payload.address),
      city: normalizeOptionalUpdateString(payload.city),
      phone: normalizeOptionalUpdateString(payload.phone),
      email: normalizeOptionalUpdateString(payload.email),
      timezone:
        payload.timezone === undefined ? undefined : normalizeRequiredString(payload.timezone),
    };
    const updateValues = Object.fromEntries(
      Object.entries(updateInput).filter(([, value]) => value !== undefined),
    ) as UpdateOrganizationRecordInput;

    if (Object.keys(updateValues).length === 0) {
      throw AppError.badRequest(
        'ORGANIZATION_UPDATE_EMPTY',
        'At least one organization field must be provided.',
      );
    }

    const organization = await this.organizationsRepository.update(organizationId, updateValues);

    if (!organization) {
      throw createOrganizationNotFoundError();
    }

    return mapOrganizationResponse(organization);
  }

  public async delete(organizationId: string): Promise<void> {
    const wasDeleted = await this.organizationsRepository.delete(organizationId);

    if (!wasDeleted) {
      throw createOrganizationNotFoundError();
    }
  }
}

export const organizationsService = new OrganizationsService();
