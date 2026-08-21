import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/apiResponse.ts';

/**
 * Format Zod validation errors into a clean, human-readable key-value map and a summary string
 */
export function formatZodError(error: ZodError): { summary: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  const messages: string[] = [];

  for (const issue of error.issues) {
    const fieldPath = issue.path.length > 0 ? issue.path.join('.') : 'root';
    if (!fieldErrors[fieldPath]) {
      fieldErrors[fieldPath] = issue.message;
      messages.push(issue.message);
    }
  }

  const summary = messages.length === 1 
    ? messages[0] 
    : `Validation error: ${messages.slice(0, 2).join('; ')}${messages.length > 2 ? ` (+${messages.length - 2} more)` : ''}`;

  return { summary, fieldErrors };
}

/**
 * Express middleware to validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const { summary, fieldErrors } = formatZodError(result.error);
      return next(new BadRequestError(summary, { fieldErrors }));
    }
    req.body = result.data;
    next();
  };
}

/**
 * Express middleware to validate request query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const { summary, fieldErrors } = formatZodError(result.error);
      return next(new BadRequestError(summary, { fieldErrors }));
    }
    req.query = result.data as any;
    next();
  };
}

/**
 * Express middleware to validate request path parameters against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const { summary, fieldErrors } = formatZodError(result.error);
      return next(new BadRequestError(summary, { fieldErrors }));
    }
    req.params = result.data as any;
    next();
  };
}
