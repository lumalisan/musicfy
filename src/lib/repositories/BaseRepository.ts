export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

import { AppError, ErrorCode } from '../utils/errorHandling';

export abstract class BaseRepository<T> implements IRepository<T> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing JSON fails, use a generic error message based on status
        errorData = {
          message: `API Error: ${response.statusText || response.status}`,
        };
      }

      let errorCode: ErrorCode;
      switch (response.status) {
        case 400:
          errorCode = ErrorCode.BAD_REQUEST;
          break;
        case 401:
          errorCode = ErrorCode.UNAUTHORIZED;
          break;
        case 403:
          errorCode = ErrorCode.FORBIDDEN;
          break;
        case 404:
          errorCode = ErrorCode.NOT_FOUND;
          break;
        case 422:
          errorCode = ErrorCode.VALIDATION_ERROR;
          break;
        case 500:
        default:
          errorCode = ErrorCode.SERVER_ERROR;
          break;
      }
      throw new AppError(
        errorData.message ||
          errorData.error ||
          'An unexpected API error occurred',
        errorCode,
        response.status,
        errorData.details || errorData
      );
    }
    return response.json();
  }

  async getAll(origin?: string): Promise<T[]> {
    const fetchUrl = origin ? `${origin}${this.baseUrl}` : this.baseUrl;
    const response = await fetch(fetchUrl);
    return this.handleResponse(response);
  }

  async getById(id: string): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (response.status === 404) return null;
    return this.handleResponse(response);
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return this.handleResponse(response);
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (response.status === 404) return null;
    return this.handleResponse(response);
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }
}

export default BaseRepository;
