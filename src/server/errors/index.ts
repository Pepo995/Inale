export class PreconditionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreconditionError";
  }
}

export type NotFoundableTypes = "CHEESE_TYPE" | "DAIRY" | "BATCH" | "USER";
export class NotFoundError extends Error {
  type?: NotFoundableTypes;
  constructor(message: string, type?: NotFoundableTypes) {
    super(message);
    this.name = "NotFoundError";
    this.type = type;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class DateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateError";
  }
}

export class UniqueConstraintFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UniqueConstraintFailedError";
  }
}

export class ForeignKeyFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForeignKeyFailedError";
  }
}

export class AlreadyAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyAdminError";
  }
}

export class ConsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConsistencyError";
  }
}

export class BlockchainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockchainError";
  }
}

/**
 * Prisma error codes at: https://www.prisma.io/docs/reference/api-reference/error-reference
 */
export const PrismaErrorCodes = {
  UniqueConstraintFailed: "P2002",
  FKConstraintFailed: "P2003",
  ConstraintFailed: "P2004",
  InvalidType: "P2005",
};
