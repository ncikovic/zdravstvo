import assert from "node:assert/strict";
import test from "node:test";

import { OrganizationUserRole } from "@zdravstvo/contracts";
import type { Request, RequestHandler, Response } from "express";

import { AppError } from "../src/errors/AppError.js";
import type { AuthenticatedRequestContext } from "../src/shared/context/index.js";
import { requireRoles } from "../src/shared/middleware/index.js";

type AuthenticatedTestRequest = Request & {
  auth?: AuthenticatedRequestContext;
};

const createAuthenticatedRequest = (
  role: OrganizationUserRole | undefined,
): AuthenticatedTestRequest => {
  const auth: Partial<AuthenticatedRequestContext> = {
    userId: "user-id",
    orgUserId: "organization-user-id",
    organizationUserId: "organization-user-id",
    organizationId: "organization-id",
    email: null,
    phone: null,
    token: {},
  };

  if (role) {
    auth.role = role;
  }

  return {
    auth: auth as AuthenticatedRequestContext,
  } as unknown as AuthenticatedTestRequest;
};

const runMiddleware = (
  middleware: RequestHandler,
  request: Request,
): unknown => {
  let nextError: unknown;

  middleware(request, {} as Response, (error?: unknown) => {
    nextError = error;
  });

  return nextError;
};

test("allows access for permitted role", () => {
  const request = createAuthenticatedRequest(OrganizationUserRole.ADMIN);
  const error = runMiddleware(
    requireRoles(OrganizationUserRole.ADMIN),
    request,
  );

  assert.equal(error, undefined);
});

test("denies access for non-permitted role", () => {
  const request = createAuthenticatedRequest(OrganizationUserRole.PATIENT);
  const error = runMiddleware(
    requireRoles(OrganizationUserRole.ADMIN),
    request,
  );

  assert(error instanceof AppError);
  assert.equal(error.status, 403);
  assert.equal(error.code, "FORBIDDEN");
});

test("denies access when role is missing", () => {
  const request = createAuthenticatedRequest(undefined);
  const error = runMiddleware(
    requireRoles(OrganizationUserRole.ADMIN),
    request,
  );

  assert(error instanceof AppError);
  assert.equal(error.status, 403);
  assert.equal(error.code, "FORBIDDEN");
});

test("supports multiple allowed roles", () => {
  const request = createAuthenticatedRequest(OrganizationUserRole.RECEPTION);
  const error = runMiddleware(
    requireRoles(OrganizationUserRole.ADMIN, OrganizationUserRole.RECEPTION),
    request,
  );

  assert.equal(error, undefined);
});

test("does not break authenticated route flow when role is valid", () => {
  const request = createAuthenticatedRequest(OrganizationUserRole.DOCTOR);
  let nextWasCalled = false;

  requireRoles(OrganizationUserRole.DOCTOR)(
    request,
    {} as Response,
    (error?: unknown) => {
      assert.equal(error, undefined);
      nextWasCalled = true;
    },
  );

  assert.equal(nextWasCalled, true);
  assert.equal(request.auth?.role, OrganizationUserRole.DOCTOR);
});
