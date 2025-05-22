import BaseRepository from './BaseRepository';
import { AppError, ErrorCode } from '../utils/errorHandling';

global.fetch = jest.fn();

interface TestEntity {
  id: string;
  name: string;
  value?: number;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  public async testHandleResponse(response: Response) {
    return this.handleResponse(response);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  const baseUrl = '/api/test-entities';

  beforeEach(() => {
    repository = new TestRepository(baseUrl);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('handleResponse', () => {
    it('should parse and return JSON on successful response (200 OK)', async () => {
      const mockData = { id: '1', name: 'Test Data' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
        statusText: 'OK',
      } as unknown as Response;

      const result = await repository.testHandleResponse(mockResponse);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    // Test cases for various error statuses (400, 401, 403, 404, 422, 500, default)
    // For each status, test with:
    //    1. Valid JSON error body
    //    2. Non-JSON error body (JSON parsing fails)
    //    3. Valid JSON without 'message' or 'error' field

    const errorScenarios: {
      status: number;
      errorCode: ErrorCode;
      statusText: string;
      defaultMessage: string;
    }[] = [
      {
        status: 400,
        errorCode: ErrorCode.BAD_REQUEST,
        statusText: 'Bad Request',
        defaultMessage: 'API Error: Bad Request',
      },
      {
        status: 401,
        errorCode: ErrorCode.UNAUTHORIZED,
        statusText: 'Unauthorized',
        defaultMessage: 'API Error: Unauthorized',
      },
      {
        status: 403,
        errorCode: ErrorCode.FORBIDDEN,
        statusText: 'Forbidden',
        defaultMessage: 'API Error: Forbidden',
      },
      {
        status: 404,
        errorCode: ErrorCode.NOT_FOUND,
        statusText: 'Not Found',
        defaultMessage: 'API Error: Not Found',
      },
      {
        status: 422,
        errorCode: ErrorCode.VALIDATION_ERROR,
        statusText: 'Unprocessable Entity',
        defaultMessage: 'API Error: Unprocessable Entity',
      },
      {
        status: 500,
        errorCode: ErrorCode.SERVER_ERROR,
        statusText: 'Internal Server Error',
        defaultMessage: 'API Error: Internal Server Error',
      },
      {
        status: 503,
        errorCode: ErrorCode.SERVER_ERROR,
        statusText: 'Service Unavailable',
        defaultMessage: 'API Error: Service Unavailable',
      },
    ];

    errorScenarios.forEach(
      ({ status, errorCode, statusText, defaultMessage }) => {
        describe(`when response status is ${status}`, () => {
          it('should throw AppError with details from JSON body', async () => {
            const errorJson = {
              message: 'API Error Message',
              details: { field: 'issue' },
            };
            const mockResponse = {
              ok: false,
              status,
              statusText,
              json: jest.fn().mockResolvedValue(errorJson),
            } as unknown as Response;

            await expect(
              repository.testHandleResponse(mockResponse)
            ).rejects.toThrow(
              new AppError(
                errorJson.message,
                errorCode,
                status,
                errorJson.details
              )
            );
            expect(mockResponse.json).toHaveBeenCalled();
          });

          it('should throw AppError with generic message if JSON parsing fails', async () => {
            const mockResponse = {
              ok: false,
              status,
              statusText,
              json: jest.fn().mockRejectedValue(new Error('JSON Parse Error')),
            } as unknown as Response;

            await expect(
              repository.testHandleResponse(mockResponse)
            ).rejects.toThrow(
              new AppError(defaultMessage, errorCode, status, {
                message: defaultMessage,
              })
            );
            expect(mockResponse.json).toHaveBeenCalled();
          });

          it('should throw AppError with default message if JSON has no message/error field', async () => {
            const errorJson = { customField: 'Custom Value' };
            const mockResponse = {
              ok: false,
              status,
              statusText,
              json: jest.fn().mockResolvedValue(errorJson),
            } as unknown as Response;

            await expect(
              repository.testHandleResponse(mockResponse)
            ).rejects.toThrow(
              new AppError(
                'An unexpected API error occurred',
                errorCode,
                status,
                errorJson
              )
            );
            expect(mockResponse.json).toHaveBeenCalled();
          });
        });
      }
    );
  });

  describe('getAll', () => {
    const mockEntities: TestEntity[] = [
      { id: '1', name: 'Entity 1' },
      { id: '2', name: 'Entity 2' },
    ];

    it('should fetch all entities and return them', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockEntities),
      } as unknown as Response);

      const result = await repository.getAll();

      expect(global.fetch).toHaveBeenCalledWith(baseUrl);
      expect(result).toEqual(mockEntities);
    });

    it('should fetch all entities with origin and return them', async () => {
      const origin = 'http://localhost:3000';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockEntities),
      } as unknown as Response);

      const result = await repository.getAll(origin);

      expect(global.fetch).toHaveBeenCalledWith(`${origin}${baseUrl}`);
      expect(result).toEqual(mockEntities);
    });

    it('should throw AppError if fetch fails', async () => {
      const apiErrorMessage = 'Server is down';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ message: apiErrorMessage }),
      } as unknown as Response);

      await expect(repository.getAll()).rejects.toThrow(
        new AppError(apiErrorMessage, ErrorCode.SERVER_ERROR, 500, {
          message: apiErrorMessage,
        })
      );
    });
  });

  describe('getById', () => {
    const entityId = '1';
    const mockEntity: TestEntity = { id: entityId, name: 'Specific Entity' };

    it('should fetch the entity by ID and return it', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockEntity),
      } as unknown as Response);

      const result = await repository.getById(entityId);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/${entityId}`);
      expect(result).toEqual(mockEntity);
    });

    it('should return null if entity is not found (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      const result = await repository.getById(entityId);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/${entityId}`);
      expect(result).toBeNull();
    });

    it('should throw AppError if fetch fails for other reasons (e.g., 500)', async () => {
      const apiErrorMessage = 'Server error on getById';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ message: apiErrorMessage }),
      } as unknown as Response);

      await expect(repository.getById(entityId)).rejects.toThrow(
        new AppError(apiErrorMessage, ErrorCode.SERVER_ERROR, 500, {
          message: apiErrorMessage,
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/${entityId}`);
    });
  });

  describe('create', () => {
    const newItemData: Omit<TestEntity, 'id'> = {
      name: 'New Entity',
      value: 100,
    };
    const createdEntity: TestEntity = { id: 'newId', ...newItemData };

    it('should POST the new entity data and return the created entity', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(createdEntity),
      } as unknown as Response);

      const result = await repository.create(newItemData);

      expect(global.fetch).toHaveBeenCalledWith(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });
      expect(result).toEqual(createdEntity);
    });

    it('should throw AppError if POST request fails', async () => {
      const apiErrorMessage = 'Failed to create entity';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ message: apiErrorMessage }),
      } as unknown as Response);

      await expect(repository.create(newItemData)).rejects.toThrow(
        new AppError(apiErrorMessage, ErrorCode.SERVER_ERROR, 500, {
          message: apiErrorMessage,
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });
    });
  });

  describe('update', () => {
    const entityId = 'existingId';
    const updateData: Partial<TestEntity> = { name: 'Updated Entity Name' };
    const updatedEntity: TestEntity = {
      id: entityId,
      name: 'Updated Entity Name',
      value: 50,
    };

    it('should PUT the updated entity data and return the updated entity', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(updatedEntity),
      } as unknown as Response);

      const result = await repository.update(entityId, updateData);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/${entityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedEntity);
    });

    it('should throw AppError if PUT request fails', async () => {
      const apiErrorMessage = 'Failed to update entity';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ message: apiErrorMessage }),
      } as unknown as Response);

      await expect(repository.update(entityId, updateData)).rejects.toThrow(
        new AppError(apiErrorMessage, ErrorCode.SERVER_ERROR, 500, {
          message: apiErrorMessage,
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/${entityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    });
  });

  describe('delete', () => {
    const entityId = 'idToDelete';

    it('should send a DELETE request and return true on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      const result = await repository.delete(entityId);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/${entityId}`, {
        method: 'DELETE',
      });
      expect(result).toBe(true);
    });

    it('should send a DELETE request and return false on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as unknown as Response);

      const result = await repository.delete(entityId);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/${entityId}`, {
        method: 'DELETE',
      });
      expect(result).toBe(false);
    });
  });
});
