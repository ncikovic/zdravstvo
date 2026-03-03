export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR'
  | (string & {});

export class AppError extends Error {
  public readonly status: number;
  public readonly code: AppErrorCode;
  public readonly isOperational: boolean;

  public constructor(
    status: number,
    code: AppErrorCode,
    message: string,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.isOperational = isOperational;
  }

  public static badRequest(code: AppErrorCode, message: string): AppError {
    return new AppError(400, code, message);
  }

  public static unauthorized(
    message = 'Authentication is required.'
  ): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  public static forbidden(message = 'Access is forbidden.'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  public static notFound(message = 'Resource not found.'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  public static conflict(code: AppErrorCode, message: string): AppError {
    return new AppError(409, code, message);
  }

  public static internal(message = 'Unexpected server error.'): AppError {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message, false);
  }
}
