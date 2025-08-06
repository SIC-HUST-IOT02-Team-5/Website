const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  cell_id: number;
  status: 'available' | 'borrowed' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface Cell {
  id: number;
  name: string;
  status: 'open' | 'closed';
  is_locked: 'locked' | 'unlocked';
  last_open_at?: string;
  last_close_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Borrowing {
  id: number;
  user_id: number;
  item_id: number;
  cell_id: number;
  borrowed_at: string;
  expected_return_at: string;
  returned_at?: string;
  user: User;
  item: Item;
  cell: Cell;
}

export interface CellEvent {
  id: number;
  cell_id: number;
  event_type: 'open' | 'close' | 'force_open';
  user_id?: number;
  timestamp: string;
  cell: Cell;
  user?: User;
}

export interface LoginResponse {
  id: number;
  username: string;
  role: string;
  full_name: string;
  access_token: string;
  refresh_token: string;
}

export interface DashboardStats {
  total_users: number;
  total_items: number;
  total_cells: number;
  available_items: number;
  active_borrowings: number;
  recent_activities: Array<{
    id: number;
    user_name: string;
    item_name: string;
    borrowed_at: string;
    expected_return_at: string;
    status: string;
  }>;
}

class ApiService {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data.access_token;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async handleResponse<T>(response: Response, originalRequest?: () => Promise<Response>): Promise<T> {
    if (response.status === 401 && originalRequest) {
      if (this.isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise<T>((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry the original request with new token
          return originalRequest().then(res => this.handleResponse<T>(res));
        });
      }

      this.isRefreshing = true;

      try {
        await this.refreshToken();
        this.processQueue(null, localStorage.getItem('access_token'));
        this.isRefreshing = false;
        
        // Retry the original request with new token
        const retryResponse = await originalRequest();
        return this.handleResponse<T>(retryResponse);
      } catch (error) {
        this.processQueue(error, null);
        this.isRefreshing = false;
        
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        // Trigger logout in auth context
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Auth API
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async register(userData: {
    username: string;
    password: string;
    full_name: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse<User>(response);
  }

  async logout(): Promise<void> {
    const requestFunction = () => fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    await this.handleResponse(response, requestFunction);
  }

  // Users API
  async getUsers(): Promise<User[]> {
    const requestFunction = () => fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<User[]>(response, requestFunction);
  }

  async getUser(id: number): Promise<User> {
    const requestFunction = () => fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<User>(response, requestFunction);
  }

  async createUser(userData: {
    username: string;
    password: string;
    full_name: string;
    role?: 'admin' | 'user';
  }): Promise<User> {
    const requestFunction = () => fetch(`${API_BASE_URL}/users?role=admin`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });

    const response = await requestFunction();
    return this.handleResponse<User>(response, requestFunction);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const requestFunction = () => fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });

    const response = await requestFunction();
    return this.handleResponse<User>(response, requestFunction);
  }

  async deleteUser(id: number): Promise<void> {
    const requestFunction = () => fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    await this.handleResponse(response, requestFunction);
  }

  // Items API
  async getItems(): Promise<Item[]> {
    const requestFunction = () => fetch(`${API_BASE_URL}/items`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<Item[]>(response, requestFunction);
  }

  async getItem(id: number): Promise<Item> {
    const requestFunction = () => fetch(`${API_BASE_URL}/items/${id}`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<Item>(response, requestFunction);
  }

  async createItem(itemData: {
    name: string;
    description: string;
    cell_id: string;
  }): Promise<Item> {
    // Convert cell_id to number
    const requestData = {
      ...itemData,
      cell_id: parseInt(itemData.cell_id)
    };
    
    const requestFunction = () => fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    });

    const response = await requestFunction();
    return this.handleResponse<Item>(response, requestFunction);
  }

  async updateItem(id: number, itemData: Partial<Item>): Promise<Item> {
    const requestFunction = () => fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData)
    });

    const response = await requestFunction();
    return this.handleResponse<Item>(response, requestFunction);
  }

  async deleteItem(id: number): Promise<void> {
    const requestFunction = () => fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    await this.handleResponse(response, requestFunction);
  }

  // Cells API
  async getCells(): Promise<Cell[]> {
    const requestFunction = () => fetch(`${API_BASE_URL}/cells`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<Cell[]>(response, requestFunction);
  }

  async getCell(id: number): Promise<Cell> {
    const requestFunction = () => fetch(`${API_BASE_URL}/cells/${id}`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<Cell>(response, requestFunction);
  }

  async createCell(cellData: {
    name: string;
    status?: string;
  }): Promise<Cell> {
    const requestFunction = () => fetch(`${API_BASE_URL}/cells`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(cellData)
    });

    const response = await requestFunction();
    return this.handleResponse<Cell>(response, requestFunction);
  }

  async updateCell(id: number, cellData: Partial<Cell>): Promise<Cell> {
    const requestFunction = () => fetch(`${API_BASE_URL}/cells/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(cellData)
    });

    const response = await requestFunction();
    return this.handleResponse<Cell>(response, requestFunction);
  }

  async deleteCell(id: number): Promise<void> {
    const requestFunction = () => fetch(`${API_BASE_URL}/cells/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    await this.handleResponse(response, requestFunction);
  }

  // Borrowings API
  async getBorrowings(): Promise<Borrowing[]> {
    const requestFunction = () => fetch(`${API_BASE_URL}/borrowings`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<Borrowing[]>(response, requestFunction);
  }

  async getBorrowing(id: number): Promise<Borrowing> {
    const requestFunction = () => fetch(`${API_BASE_URL}/borrowings/${id}`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<Borrowing>(response, requestFunction);
  }

  async createBorrowing(borrowingData: {
    user_id: number;
    item_id: number;
    expected_return_at: string;
  }): Promise<Borrowing> {
    const requestFunction = () => fetch(`${API_BASE_URL}/borrowings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(borrowingData)
    });

    const response = await requestFunction();
    return this.handleResponse<Borrowing>(response, requestFunction);
  }

  async returnBorrowing(id: number): Promise<Borrowing> {
    const requestFunction = () => fetch(`${API_BASE_URL}/borrowings/${id}/return`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<Borrowing>(response, requestFunction);
  }

  // Cell Events API
  async getCellEvents(): Promise<CellEvent[]> {
    const requestFunction = () => fetch(`${API_BASE_URL}/cell-events`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<CellEvent[]>(response, requestFunction);
  }

  async getCellEvent(id: number): Promise<CellEvent> {
    const requestFunction = () => fetch(`${API_BASE_URL}/cell-events/${id}`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<CellEvent>(response, requestFunction);
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    const requestFunction = () => fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: this.getHeaders()
    });

    const response = await requestFunction();
    return this.handleResponse<DashboardStats>(response, requestFunction);
  }
}

export default new ApiService();
