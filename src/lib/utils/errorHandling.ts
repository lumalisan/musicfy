// Tipos de errores comunes
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Application errors
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
}

// Class for application errors
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.UNEXPECTED_ERROR,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Class for validation errors
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation error',
    public validationErrors?: Record<string, string[]>,
    public field?: string
  ) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      400,
      field ? { field, errors: validationErrors } : { errors: validationErrors }
    );
    this.name = 'ValidationError';
  }
}

// Class for network errors
export class NetworkError extends AppError {
  constructor(message: string = 'Connection error') {
    super(message, ErrorCode.NETWORK_ERROR, 0);
    this.name = 'NetworkError';
  }
}

// Class for timeout errors
export class TimeoutError extends NetworkError {
  constructor(message: string = 'Timeout error') {
    super(message);
    this.code = ErrorCode.TIMEOUT_ERROR;
    this.name = 'TimeoutError';
  }
}

// Class for authentication errors
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
  }
}

// Class for permission errors
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, ErrorCode.FORBIDDEN, 403);
    this.name = 'ForbiddenError';
  }
}

// Class for not found errors
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

// Function to handle API errors
export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof window !== 'undefined' && error instanceof TypeError) {
    if (error.message.includes('Failed to fetch')) {
      return new NetworkError('Connection error');
    }
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as any;
    const response = apiError.response;

    if (response) {
      const { status, data } = response;
      const message = data?.message || 'Error in the request';

      switch (status) {
        case 400:
          return new ValidationError(
            data.message || 'Invalid data',
            data.errors,
            data.field
          );
        case 401:
          return new UnauthorizedError(message);
        case 403:
          return new ForbiddenError(message);
        case 404:
          return new NotFoundError(data.resource || 'Resource');
        case 408:
          return new TimeoutError(message);
        case 500:
          return new AppError(
            'Internal server error',
            ErrorCode.SERVER_ERROR,
            500,
            process.env.NODE_ENV === 'development' ? data : undefined
          );
        case 503:
          return new AppError(
            'Service in maintenance',
            ErrorCode.MAINTENANCE_MODE,
            503
          );
        default:
          return new AppError(
            message,
            ErrorCode.SERVER_ERROR,
            status,
            process.env.NODE_ENV === 'development' ? data : undefined
          );
      }
    }
  }

  // For unknown errors, return a generic error
  return new AppError(
    'An unexpected error occurred',
    ErrorCode.UNEXPECTED_ERROR,
    500,
    process.env.NODE_ENV === 'development'
      ? { originalError: error }
      : undefined
  );
};

// Function to create a generic error handler
export const createErrorHandler = (context: string) => {
  return (error: unknown, defaultMessage?: string) => {
    const appError = handleApiError(error);

    console.error(`[${context}] Error:`, appError);

    if (defaultMessage && appError instanceof AppError) {
      appError.message = defaultMessage;
    }

    return appError;
  };
};
