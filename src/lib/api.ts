const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiService {
  private baseURL = API_BASE_URL;
  private token: string | null = null;

  constructor() {
    // Recuperar token do localStorage na inicialização
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    nomeCompleto?: string;
  }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  // Transactions endpoints
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    return this.request<any[]>(`/transactions${query ? `?${query}` : ''}`);
  }

  async createTransaction(transaction: {
    titulo: string;
    valor: number;
    tipo: 'RECEITA' | 'DESPESA';
    accountId: string;
    categoryId?: string;
    data: string;
    descricao?: string;
  }) {
    return this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: Partial<any>) {
    return this.request<any>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string) {
    return this.request<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async createCategory(category: {
    nome: string;
    tipo: 'RECEITA' | 'DESPESA';
    cor?: string;
    icone?: string;
  }) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: Partial<any>) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Accounts endpoints
  async getAccounts() {
    return this.request<any[]>('/accounts');
  }

  async createAccount(account: {
    nome: string;
    tipo: 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO' | 'CARTAO_CREDITO';
    saldoInicial: number;
    cor?: string;
  }) {
    return this.request<any>('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  }

  async updateAccount(id: string, account: Partial<any>) {
    return this.request<any>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    });
  }

  async deleteAccount(id: string) {
    return this.request<void>(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard/Reports endpoints
  async getDashboardData(period?: string) {
    return this.request<any>(`/dashboard${period ? `?period=${period}` : ''}`);
  }

  async getReports(type: string, params?: any) {
    const queryParams = new URLSearchParams(params);
    return this.request<any>(`/reports/${type}?${queryParams}`);
  }
}

export const apiService = new ApiService();
export default apiService;