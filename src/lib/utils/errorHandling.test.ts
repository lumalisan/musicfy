import {
  ErrorCode,
  AppError,
  ValidationError,
  NetworkError,
  TimeoutError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  handleApiError,
  createErrorHandler,
} from './errorHandling';

const originalNodeEnv = process.env.NODE_ENV;

afterAll(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an instance with default values', () => {
      const err = new AppError('Test message');
      expect(err.message).toBe('Test message');
      expect(err.code).toBe(ErrorCode.UNEXPECTED_ERROR);
      expect(err.statusCode).toBe(500);
      expect(err.name).toBe('AppError');
      expect(err.details).toBeUndefined();
    });

    it('should create an instance with provided values', () => {
      const details = { info: 'extra' };
      const err = new AppError('Custom', ErrorCode.BAD_REQUEST, 400, details);
      expect(err.message).toBe('Custom');
      expect(err.code).toBe(ErrorCode.BAD_REQUEST);
      expect(err.statusCode).toBe(400);
      expect(err.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should create an instance with default message', () => {
      const err = new ValidationError();
      expect(err.message).toBe('Validation error');
      expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(err.statusCode).toBe(400);
      expect(err.name).toBe('ValidationError');
      expect(err.validationErrors).toBeUndefined();
      expect(err.field).toBeUndefined();
      expect(err.details).toEqual({ errors: undefined });
    });

    it('should create an instance with specific validation errors and field', () => {
      const validationErrors = { email: ['Invalid format'] };
      const err = new ValidationError('Bad email', validationErrors, 'email');
      expect(err.message).toBe('Bad email');
      expect(err.validationErrors).toEqual(validationErrors);
      expect(err.field).toBe('email');
      expect(err.details).toEqual({ field: 'email', errors: validationErrors });
    });
  });

  describe('NetworkError', () => {
    it('should create an instance with default message', () => {
      const err = new NetworkError();
      expect(err.message).toBe('Connection error');
      expect(err.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(err.statusCode).toBe(0);
      expect(err.name).toBe('NetworkError');
    });

    it('should create an instance with a specific message', () => {
      const err = new NetworkError('Custom network issue');
      expect(err.message).toBe('Custom network issue');
    });
  });

  describe('TimeoutError', () => {
    it('should create an instance with default message and correct inheritance', () => {
      const err = new TimeoutError();
      expect(err.message).toBe('Timeout error');
      expect(err.code).toBe(ErrorCode.TIMEOUT_ERROR);
      expect(err.statusCode).toBe(0);
      expect(err.name).toBe('TimeoutError');
      expect(err instanceof AppError).toBe(true);
    });

    it('should create an instance with a specific message', () => {
      const err = new TimeoutError('Request timed out after 30s');
      expect(err.message).toBe('Request timed out after 30s');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an instance with default message', () => {
      const err = new UnauthorizedError();
      expect(err.message).toBe('Unauthorized');
      expect(err.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(err.statusCode).toBe(401);
      expect(err.name).toBe('UnauthorizedError');
    });

    it('should create an instance with a specific message', () => {
      const err = new UnauthorizedError('Token expired');
      expect(err.message).toBe('Token expired');
    });
  });

  describe('ForbiddenError', () => {
    it('should create an instance with default message', () => {
      const err = new ForbiddenError();
      expect(err.message).toBe('Forbidden');
      expect(err.code).toBe(ErrorCode.FORBIDDEN);
      expect(err.statusCode).toBe(403);
      expect(err.name).toBe('ForbiddenError');
    });

    it('should create an instance with a specific message', () => {
      const err = new ForbiddenError('User does not have permission');
      expect(err.message).toBe('User does not have permission');
    });
  });

  describe('NotFoundError', () => {
    it('should create an instance with default resource', () => {
      const err = new NotFoundError();
      expect(err.message).toBe('Resource not found');
      expect(err.code).toBe(ErrorCode.NOT_FOUND);
      expect(err.statusCode).toBe(404);
      expect(err.name).toBe('NotFoundError');
    });

    it('should create an instance with a specific resource', () => {
      const err = new NotFoundError('User');
      expect(err.message).toBe('User not found');
    });
  });
});

describe('handleApiError', () => {
  beforeEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should return the same AppError if passed an AppError', () => {
    const originalError = new AppError('Original', ErrorCode.SERVER_ERROR, 503);
    const handledError = handleApiError(originalError);
    expect(handledError).toBe(originalError);
  });

  it('should handle TypeError "Failed to fetch" as NetworkError (client-side)', () => {
    global.window = {} as any;
    const typeError = new TypeError('Failed to fetch');
    const handledError = handleApiError(typeError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Connection error');
    expect(handledError.code).toBe(ErrorCode.NETWORK_ERROR);
    delete (global as any).window;
  });

  it('should handle generic TypeError differently if not "Failed to fetch"', () => {
    const typeError = new TypeError('Some other type error');
    const handledError = handleApiError(typeError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.code).toBe(ErrorCode.UNEXPECTED_ERROR);
    expect(handledError.name).not.toBe('NetworkError');
  });

  it('should handle API-like error object with status 400 as ValidationError', () => {
    const apiError = {
      response: {
        status: 400,
        data: {
          message: 'Invalid input',
          errors: { field: ['bad'] },
          field: 'field',
        },
      },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Invalid input');
    expect((handledError as ValidationError).validationErrors).toEqual({
      field: ['bad'],
    });
    expect((handledError as ValidationError).field).toBe('field');
  });

  it('should handle API-like error object with status 401 as UnauthorizedError', () => {
    const apiError = {
      response: { status: 401, data: { message: 'Auth required' } },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Auth required');
    expect(handledError.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('should handle API-like error object with status 403 as ForbiddenError', () => {
    const apiError = {
      response: { status: 403, data: { message: 'Access denied' } },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Access denied');
    expect(handledError.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should handle API-like error object with status 404 as NotFoundError', () => {
    const apiError = {
      response: { status: 404, data: { resource: 'SpecificResource' } },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('SpecificResource not found');
    expect(handledError.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('should handle API-like error object with status 408 as TimeoutError', () => {
    const apiError = {
      response: { status: 408, data: { message: 'Request took too long' } },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Request took too long');
    expect(handledError.code).toBe(ErrorCode.TIMEOUT_ERROR);
  });

  it('should handle API-like error object with status 500 as AppError (SERVER_ERROR)', () => {
    const apiError = {
      response: { status: 500, data: { message: 'Something broke on server' } },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Internal server error');
    expect(handledError.code).toBe(ErrorCode.SERVER_ERROR);
    expect(handledError.statusCode).toBe(500);
  });

  it('should handle API-like error object with status 503 as AppError (MAINTENANCE_MODE)', () => {
    const apiError = {
      response: { status: 503, data: { message: 'Down for maintenance' } },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Service in maintenance');
    expect(handledError.code).toBe(ErrorCode.MAINTENANCE_MODE);
    expect(handledError.statusCode).toBe(503);
  });

  it('should handle API-like error object with other status codes as AppError (SERVER_ERROR)', () => {
    const apiError = {
      response: { status: 502, data: { message: 'Bad Gateway' } },
    };
    const handledError = handleApiError(apiError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('Bad Gateway');
    expect(handledError.code).toBe(ErrorCode.SERVER_ERROR);
    expect(handledError.statusCode).toBe(502);
  });

  it('should include details in development for 500, 503 and default server errors', () => {
    process.env.NODE_ENV = 'development';
    const errorData = { detail: 'stack trace info' };

    const apiError500 = { response: { status: 500, data: errorData } };
    const handled500 = handleApiError(apiError500);
    expect(handled500.details).toEqual(errorData);

    const apiError503 = { response: { status: 503, data: errorData } };
    const handled503 = handleApiError(apiError503);
    expect(handled503.details).toBeUndefined();

    const apiErrorDefault = { response: { status: 504, data: errorData } };
    const handledDefault = handleApiError(apiErrorDefault);
    expect(handledDefault.details).toEqual(errorData);
  });

  it('should NOT include details in production for 500, 503 and default server errors', () => {
    process.env.NODE_ENV = 'production';
    const errorData = { detail: 'stack trace info' };

    const apiError500 = { response: { status: 500, data: errorData } };
    const handled500 = handleApiError(apiError500);
    expect(handled500.details).toBeUndefined();

    const apiError503 = { response: { status: 503, data: errorData } };
    const handled503 = handleApiError(apiError503);
    expect(handled503.details).toBeUndefined();

    const apiErrorDefault = { response: { status: 504, data: errorData } };
    const handledDefault = handleApiError(apiErrorDefault);
    expect(handledDefault.details).toBeUndefined();
  });

  it('should handle an unknown error as a generic AppError', () => {
    const unknownError = new Error('Something weird happened');
    const handledError = handleApiError(unknownError);
    expect(handledError).toBeInstanceOf(AppError);
    expect(handledError.message).toBe('An unexpected error occurred');
    expect(handledError.code).toBe(ErrorCode.UNEXPECTED_ERROR);
    expect(handledError.statusCode).toBe(500);
  });

  it('should handle null or undefined error as a generic AppError', () => {
    const handledErrorNull = handleApiError(null);
    expect(handledErrorNull.code).toBe(ErrorCode.UNEXPECTED_ERROR);
    const handledErrorUndefined = handleApiError(undefined);
    expect(handledErrorUndefined.code).toBe(ErrorCode.UNEXPECTED_ERROR);
  });
});

describe('createErrorHandler', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return a function that handles errors and logs them with context', () => {
    const context = 'TestContext';
    const errorHandler = createErrorHandler(context);
    const testError = new Error('Test error in context');

    const appError = errorHandler(testError);

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.message).toBe('An unexpected error occurred');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[${context}] Error:`,
      expect.any(AppError)
    );
  });

  it('should allow overriding the default message', () => {
    const context = 'AnotherContext';
    const errorHandler = createErrorHandler(context);
    const testError = new Error('Original error');
    const defaultMessage = 'User friendly message';

    const appError = errorHandler(testError, defaultMessage);

    expect(appError.message).toBe(defaultMessage);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
