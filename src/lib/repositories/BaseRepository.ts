export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T> implements IRepository<T> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
  }

  async getAll(): Promise<T[]> {
    const response = await fetch(this.baseUrl);
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
    if (response.status === 404) return false;
    await this.handleResponse(response);
    return true;
  }
}

export default BaseRepository;
