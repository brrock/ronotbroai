import { Prisma } from '@prisma/client';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(operation: string, error: unknown): never {
  console.error(`Database operation '${operation}' failed:`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        throw new DatabaseError('Unique constraint violation', operation, error);
      case 'P2025':
        throw new DatabaseError('Record not found', operation, error);
      case 'P2003':
        throw new DatabaseError('Foreign key constraint violation', operation, error);
      default:
        throw new DatabaseError(`Prisma error: ${error.code}`, operation, error);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseError('Invalid data provided', operation, error);
  }

  throw new DatabaseError('Unexpected database error', operation, error);
} 