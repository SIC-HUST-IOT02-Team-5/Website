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
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
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

  // Users API
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<User[]>(response);
  }

  async getUser(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<User>(response);
  }

  async createUser(userData: {
    username: string;
    password: string;
    full_name: string;
    role?: 'admin' | 'user';
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users?role=admin`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<User>(response);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<User>(response);
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    await this.handleResponse(response);
  }

  // Items API
  async getItems(): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/items`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Item[]>(response);
  }

  // Item Access API (admin only)
  async getItemAccess(itemId: number): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/access`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<User[]>(response);
  }

  async setItemAccess(itemId: number, userIds: number[]): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/access`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ user_ids: userIds })
    });
    return this.handleResponse<User[]>(response);
  }

  async getItem(id: number): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Item>(response);
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
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    });
    return this.handleResponse<Item>(response);
  }

  async updateItem(id: number, itemData: Partial<Item>): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData)
    });
    return this.handleResponse<Item>(response);
  }

  async deleteItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    await this.handleResponse(response);
  }

  // Cells API
  async getCells(): Promise<Cell[]> {
    const response = await fetch(`${API_BASE_URL}/cells`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Cell[]>(response);
  }

  async getCell(id: number): Promise<Cell> {
    const response = await fetch(`${API_BASE_URL}/cells/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Cell>(response);
  }

  async createCell(cellData: {
    name: string;
    status?: string;
  }): Promise<Cell> {
    const response = await fetch(`${API_BASE_URL}/cells`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(cellData)
    });
    return this.handleResponse<Cell>(response);
  }

  async updateCell(id: number, cellData: Partial<Cell>): Promise<Cell> {
    const response = await fetch(`${API_BASE_URL}/cells/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(cellData)
    });
    return this.handleResponse<Cell>(response);
  }

  async deleteCell(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cells/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    await this.handleResponse(response);
  }

  // Cell MQTT Control API
  async openCell(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/cells/${id}/open`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async closeCell(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/cells/${id}/close`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Borrowings API
  async getBorrowings(): Promise<Borrowing[]> {
    const response = await fetch(`${API_BASE_URL}/borrowings`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Borrowing[]>(response);
  }

  async getBorrowing(id: number): Promise<Borrowing> {
    const response = await fetch(`${API_BASE_URL}/borrowings/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Borrowing>(response);
  }

  async createBorrowing(borrowingData: {
    user_id: number;
    item_id: number;
    expected_return_at: string;
  }): Promise<Borrowing> {
    const response = await fetch(`${API_BASE_URL}/borrowings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(borrowingData)
    });
    return this.handleResponse<Borrowing>(response);
  }

  async returnBorrowing(id: number): Promise<Borrowing> {
    const response = await fetch(`${API_BASE_URL}/borrowings/${id}/return`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    return this.handleResponse<Borrowing>(response);
  }

  // Cell Events API
  async getCellEvents(): Promise<CellEvent[]> {
    const response = await fetch(`${API_BASE_URL}/cell-events`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CellEvent[]>(response);
  }

  async getCellEvent(id: number): Promise<CellEvent> {
    const response = await fetch(`${API_BASE_URL}/cell-events/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<CellEvent>(response);
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<DashboardStats>(response);
  }
}

export default new ApiService();
