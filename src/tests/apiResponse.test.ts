import { describe, it, expect } from 'vitest';
import { 
  ApiError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  parsePositiveInt 
} from '../utils/apiResponse.ts';

describe('API Response & Custom Error Hierarchy Tests', () => {
  it('instantiates custom ApiError subclasses with correct status codes and error codes', () => {
    const badReq = new BadRequestError('Invalid input field');
    expect(badReq.statusCode).toBe(400);
    expect(badReq.code).toBe('BAD_REQUEST');
    expect(badReq.message).toBe('Invalid input field');

    const unauth = new UnauthorizedError();
    expect(unauth.statusCode).toBe(401);
    expect(unauth.code).toBe('UNAUTHORIZED');

    const forbidden = new ForbiddenError();
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.code).toBe('FORBIDDEN');

    const notFound = new NotFoundError('Invoice missing');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe('NOT_FOUND');
  });

  it('validates and parses positive integers from route parameters', () => {
    expect(parsePositiveInt('42', 'testId')).toBe(42);
    expect(parsePositiveInt(100, 'testId')).toBe(100);

    expect(() => parsePositiveInt('abc', 'testId')).toThrow(BadRequestError);
    expect(() => parsePositiveInt('-5', 'testId')).toThrow(BadRequestError);
    expect(() => parsePositiveInt('0', 'testId')).toThrow(BadRequestError);
  });
});
