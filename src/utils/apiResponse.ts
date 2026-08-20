import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Invalid request parameters', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden: Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export const ApiResponse = {
  success<T>(res: Response, data: T, statusCode = 200, message?: string) {
    return res.status(statusCode).json({
      success: true,
      ...(message ? { message } : {}),
      ...(typeof data === 'object' && data !== null && !Array.isArray(data) ? data : { data }),
    });
  },

  paginated<T>(res: Response, items: T[], pagination: { page: number; limit: number; total?: number }, key = 'items') {
    return res.status(200).json({
      success: true,
      [key]: items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        count: items.length,
        ...(pagination.total !== undefined ? { total: pagination.total } : {}),
      },
    });
  },
};

export function parsePositiveInt(val: any, fieldName = 'id'): number {
  const parsed = parseInt(String(val), 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new BadRequestError(`Invalid ${fieldName}: must be a positive integer.`);
  }
  return parsed;
}

export function asyncHandler(fn: (req: any, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');

  if (statusCode >= 500) {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV !== 'production' && err.details ? { details: err.details } : {}),
    },
  });
}
