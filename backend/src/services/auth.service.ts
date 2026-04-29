import bcrypt from "bcrypt";
import {
  type AuthUserDto,
  type AuthenticatedAuthResponseDto,
  type LoginRequestDto,
  type LoginOrganizationSelectionRequiredResponseDto,
  type LoginResponseDto,
  OrganizationUserRole,
  type RegisterRequestDto,
  type RegisterResponseDto,
  type SelectableOrganizationMembershipDto,
  type SelectOrganizationRequestDto,
  type SelectOrganizationResponseDto,
  UserStatus,
} from "@zdravstvo/contracts";

import { AppError } from "../errors/AppError.js";
import {
  AuthRepository,
  OrganizationUsersRepository,
  OrganizationsRepository,
  UsersRepository,
} from "../repositories/index.js";
import { db } from "../shared/db/index.js";
import {
  signAccessToken,
  signOrganizationSelectionToken,
  verifyOrganizationSelectionToken,
} from "../shared/utils/index.js";
import type {
  OrganizationUserRecord,
  PatientProfileRecord,
  UserRecord,
} from "../types/entities/index.js";

const PASSWORD_SALT_ROUNDS = 12;
const DEFAULT_REGISTRATION_ORGANIZATION_NAME = "Zdravstvo";
const DEFAULT_REGISTRATION_ORGANIZATION_TIMEZONE = "Europe/Zagreb";

type UsersRepositoryContract = Pick<
  UsersRepository,
  "findByEmailOrPhone" | "findById"
>;
type OrganizationUsersRepositoryContract = Pick<
  OrganizationUsersRepository,
  | "findActiveMembershipsByUserId"
  | "findActiveMembershipByUserIdAndOrganizationId"
>;
type AuthRepositoryContract = Pick<
  AuthRepository,
  | "findPatientProfileByUserId"
  | "findUserByEmail"
  | "findUserByPhone"
  | "findDefaultOrganizationId"
  | "createOrganization"
  | "createUser"
  | "createPatientProfile"
  | "createOrganizationUser"
>;
type OrganizationsRepositoryContract = Pick<
  OrganizationsRepository,
  "findMinimalByIds" | "findById"
>;

type RegistrationTransactionRunner = <Result>(
  handler: (
    repository: AuthRepositoryContract,
    organizationsRepository: OrganizationsRepositoryContract,
  ) => Promise<Result>,
) => Promise<Result>;

type PasswordComparer = (
  password: string,
  passwordHash: string,
) => Promise<boolean>;
type PasswordHasher = (password: string, saltRounds: number) => Promise<string>;

interface AuthServiceDependencies {
  usersRepository?: UsersRepositoryContract;
  organizationUsersRepository?: OrganizationUsersRepositoryContract;
  authRepository?: AuthRepositoryContract;
  organizationsRepository?: OrganizationsRepositoryContract;
  runRegistrationTransaction?: RegistrationTransactionRunner;
  comparePassword?: PasswordComparer;
  hashPassword?: PasswordHasher;
  createAccessToken?: typeof signAccessToken;
  createOrganizationSelectionToken?: typeof signOrganizationSelectionToken;
  readOrganizationSelectionToken?: typeof verifyOrganizationSelectionToken;
}

interface DatabaseErrorLike {
  code?: string;
  message?: string;
}

const isDatabaseErrorLike = (error: unknown): error is DatabaseErrorLike => {
  return typeof error === "object" && error !== null;
};

const normalizeOptionalString = (
  value: string | null | undefined,
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeRegistrationInput = (
  input: RegisterRequestDto,
): RegisterRequestDto => {
  return {
    organizationId: input.organizationId,
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    password: input.password,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    dateOfBirth: input.dateOfBirth ?? null,
    oib: normalizeOptionalString(input.oib),
    address: normalizeOptionalString(input.address),
    emergencyContactName: normalizeOptionalString(input.emergencyContactName),
    emergencyContactPhone: normalizeOptionalString(input.emergencyContactPhone),
  };
};

const normalizeLoginIdentifier = (value: string): string => {
  const trimmedValue = value.trim();

  return trimmedValue.includes("@") ? trimmedValue.toLowerCase() : trimmedValue;
};

const mapAuthUser = (
  user: UserRecord,
  profile: PatientProfileRecord | null,
): AuthUserDto => {
  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    dateOfBirth: profile?.dateOfBirth ?? null,
    oib: profile?.oib ?? null,
    address: profile?.address ?? null,
    emergencyContactName: profile?.emergencyContactName ?? null,
    emergencyContactPhone: profile?.emergencyContactPhone ?? null,
  };
};

const mapDuplicateDatabaseError = (
  error: DatabaseErrorLike,
): AppError | null => {
  if (error.code !== "ER_DUP_ENTRY") {
    return null;
  }

  const message = error.message ?? "";

  if (message.includes("uq_users_email")) {
    return AppError.conflict(
      "EMAIL_ALREADY_EXISTS",
      "Email is already registered.",
    );
  }

  if (message.includes("uq_users_phone")) {
    return AppError.conflict(
      "PHONE_ALREADY_EXISTS",
      "Phone is already registered.",
    );
  }

  if (message.includes("uq_patient_oib")) {
    return AppError.conflict(
      "OIB_ALREADY_EXISTS",
      "OIB is already registered.",
    );
  }

  return AppError.conflict(
    "REGISTRATION_CONFLICT",
    "Registration could not be completed because the account already exists.",
  );
};

const resolveRegistrationOrganizationId = async (
  repository: AuthRepositoryContract,
): Promise<string> => {
  const existingOrganizationId = await repository.findDefaultOrganizationId();

  if (existingOrganizationId) {
    return existingOrganizationId;
  }

  return repository.createOrganization({
    name: DEFAULT_REGISTRATION_ORGANIZATION_NAME,
    timezone: DEFAULT_REGISTRATION_ORGANIZATION_TIMEZONE,
  });
};

const mapAuthenticatedResponse = (
  user: UserRecord,
  profile: PatientProfileRecord | null,
  membership: OrganizationUserRecord,
  createToken: typeof signAccessToken = signAccessToken,
): AuthenticatedAuthResponseDto => {
  const accessToken = createToken({
    sub: user.id,
    organizationId: membership.organizationId,
    orgUserId: membership.id,
    role: membership.role,
  });

  return {
    authenticated: true,
    requiresOrganizationSelection: false,
    accessToken,
    user: mapAuthUser(user, profile),
    organizationId: membership.organizationId,
    orgUserId: membership.id,
    role: membership.role,
  };
};

const mapSelectableMemberships = async (
  memberships: readonly OrganizationUserRecord[],
  organizationRepository: OrganizationsRepositoryContract,
): Promise<SelectableOrganizationMembershipDto[]> => {
  const organizations = await organizationRepository.findMinimalByIds(
    memberships.map((membership) => membership.organizationId),
  );
  const organizationsById = new Map(
    organizations.map((organization) => [organization.id, organization]),
  );

  return memberships.map((membership) => {
    const organization = organizationsById.get(membership.organizationId);

    if (!organization) {
      throw AppError.unauthorized("Account is not allowed to sign in.");
    }

    return {
      organizationId: membership.organizationId,
      organizationName: organization.name,
      orgUserId: membership.id,
      role: membership.role,
    };
  });
};

export class AuthService {
  private readonly usersRepository: UsersRepositoryContract;
  private readonly organizationUsersRepository: OrganizationUsersRepositoryContract;
  private readonly authRepository: AuthRepositoryContract;
  private readonly organizationsRepository: OrganizationsRepositoryContract;
  private readonly runRegistrationTransaction: RegistrationTransactionRunner;
  private readonly comparePassword: PasswordComparer;
  private readonly hashPassword: PasswordHasher;
  private readonly createAccessToken: typeof signAccessToken;
  private readonly createOrganizationSelectionToken: typeof signOrganizationSelectionToken;
  private readonly readOrganizationSelectionToken: typeof verifyOrganizationSelectionToken;

  public constructor(dependencies: AuthServiceDependencies = {}) {
    this.usersRepository =
      dependencies.usersRepository ?? new UsersRepository(db);
    this.organizationUsersRepository =
      dependencies.organizationUsersRepository ??
      new OrganizationUsersRepository(db);
    this.authRepository = dependencies.authRepository ?? new AuthRepository(db);
    this.organizationsRepository =
      dependencies.organizationsRepository ?? new OrganizationsRepository(db);
    this.runRegistrationTransaction =
      dependencies.runRegistrationTransaction ??
      (async (handler) =>
        db.transaction(async (transaction) =>
          handler(
            new AuthRepository(transaction),
            new OrganizationsRepository(transaction),
          ),
        ));
    this.comparePassword =
      dependencies.comparePassword ??
      (async (password, passwordHash) =>
        bcrypt.compare(password, passwordHash));
    this.hashPassword =
      dependencies.hashPassword ??
      (async (password, saltRounds) => bcrypt.hash(password, saltRounds));
    this.createAccessToken = dependencies.createAccessToken ?? signAccessToken;
    this.createOrganizationSelectionToken =
      dependencies.createOrganizationSelectionToken ??
      signOrganizationSelectionToken;
    this.readOrganizationSelectionToken =
      dependencies.readOrganizationSelectionToken ??
      verifyOrganizationSelectionToken;
  }

  public async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const identifier = normalizeLoginIdentifier(payload.identifier);
    const invalidCredentialsError = AppError.unauthorized(
      "Invalid email/phone or password.",
    );
    const user = await this.usersRepository.findByEmailOrPhone(identifier);

    if (!user || !user.passwordHash || user.status !== UserStatus.ACTIVE) {
      throw invalidCredentialsError;
    }

    const isPasswordValid = await this.comparePassword(
      payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw invalidCredentialsError;
    }

    const memberships =
      await this.organizationUsersRepository.findActiveMembershipsByUserId(
        user.id,
      );

    if (memberships.length === 0) {
      throw AppError.unauthorized("Account is not allowed to sign in.");
    }

    const patientProfile = await this.authRepository.findPatientProfileByUserId(
      user.id,
    );

    if (memberships.length === 1) {
      return mapAuthenticatedResponse(
        user,
        patientProfile,
        memberships[0],
        this.createAccessToken,
      );
    }

    return {
      authenticated: false,
      requiresOrganizationSelection: true,
      selectionToken: this.createOrganizationSelectionToken({
        sub: user.id,
      }),
      user: mapAuthUser(user, patientProfile),
      memberships: await mapSelectableMemberships(
        memberships,
        this.organizationsRepository,
      ),
    };
  }

  public async selectOrganization(
    payload: SelectOrganizationRequestDto,
  ): Promise<SelectOrganizationResponseDto> {
    const claims = this.readOrganizationSelectionToken(payload.selectionToken);

    const [user, membership] = await Promise.all([
      this.usersRepository.findById(claims.sub),
      this.organizationUsersRepository.findActiveMembershipByUserIdAndOrganizationId(
        claims.sub,
        payload.organizationId,
      ),
    ]);

    if (!user || !user.passwordHash || user.status !== UserStatus.ACTIVE) {
      throw AppError.unauthorized(
        "Authentication is invalid or no longer active.",
      );
    }

    if (!membership) {
      throw AppError.forbidden("Organization is not available for this login.");
    }

    const patientProfile = await this.authRepository.findPatientProfileByUserId(
      user.id,
    );

    return mapAuthenticatedResponse(
      user,
      patientProfile,
      membership,
      this.createAccessToken,
    );
  }

  public async register(
    payload: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const input = normalizeRegistrationInput(payload);

    const [existingUserByEmail, existingUserByPhone] = await Promise.all([
      this.authRepository.findUserByEmail(input.email),
      this.authRepository.findUserByPhone(input.phone),
    ]);

    if (existingUserByEmail) {
      throw AppError.conflict(
        "EMAIL_ALREADY_EXISTS",
        "Email is already registered.",
      );
    }

    if (existingUserByPhone) {
      throw AppError.conflict(
        "PHONE_ALREADY_EXISTS",
        "Phone is already registered.",
      );
    }

    const passwordHash = await this.hashPassword(
      input.password,
      PASSWORD_SALT_ROUNDS,
    );

    try {
      return await this.runRegistrationTransaction(
        async (repository, organizationsRepository) => {
          const organizationId =
            input.organizationId ??
            (await resolveRegistrationOrganizationId(repository));

          if (input.organizationId) {
            const organization = await organizationsRepository.findById(
              input.organizationId,
            );

            if (!organization) {
              throw AppError.notFound("Organization not found.");
            }
          }

          const user = await repository.createUser({
            email: input.email,
            phone: input.phone,
            passwordHash,
            status: UserStatus.ACTIVE,
          });

          const patientProfile = await repository.createPatientProfile({
            userId: user.id,
            firstName: input.firstName,
            lastName: input.lastName,
            dateOfBirth: input.dateOfBirth ?? null,
            oib: input.oib ?? null,
            address: input.address ?? null,
            emergencyContactName: input.emergencyContactName ?? null,
            emergencyContactPhone: input.emergencyContactPhone ?? null,
          });

          await repository.createOrganizationUser({
            organizationId,
            userId: user.id,
            role: OrganizationUserRole.PATIENT,
            isActive: true,
          });

          return {
            user: mapAuthUser(user, patientProfile),
            organizationId,
            role: OrganizationUserRole.PATIENT,
          };
        },
      );
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      if (isDatabaseErrorLike(error)) {
        const conflictError = mapDuplicateDatabaseError(error);

        if (conflictError) {
          throw conflictError;
        }
      }

      throw AppError.internal("Registration failed. Please try again later.");
    }
  }
}

export const authService = new AuthService();
