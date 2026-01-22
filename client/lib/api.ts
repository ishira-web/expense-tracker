import { LoginRequest, LoginResponse, Expense, DepositRequest, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://expense-tracker-22a5.onrender.com';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

// Helper function to build headers
const getHeaders = (includeAuth = true): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

// API service class
class ApiService {
    // Current User
    async getProfile(): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch profile');
        }

        return response.json();
    }

    // Authentication
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
        const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request password reset');
        }

        return response.json();
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ token, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reset password');
        }

        return response.json();
    }

    async updateProfile(name: string): Promise<{ message: string; user: User }> {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        return response.json();
    }

    // Expenses
    async getExpenses(userId?: string): Promise<Expense[]> {
        const url = userId
            ? `${API_BASE_URL}/expenses?userId=${userId}`
            : `${API_BASE_URL}/expenses`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch expenses');
        }

        return response.json();
    }

    async createExpense(data: FormData): Promise<{ message: string; expence: Expense }> {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/expenses/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: data,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create expense');
        }

        return response.json();
    }

    async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update expense');
        }

        return response.json();
    }

    async deleteExpense(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete expense');
        }

        return response.json();
    }

    // Deposits (HR/Admin only)
    async createDeposit(data: DepositRequest): Promise<{ message: string; walletBalance: number; totalDeposited: number }> {
        const response = await fetch(`${API_BASE_URL}/expenses/deposit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create deposit');
        }

        return response.json();
    }

    // Users (Admin only)
    async createUser(data: { name: string; email: string; password: string; role: string }): Promise<{ message: string; user: User }> {
        const response = await fetch(`${API_BASE_URL}/users/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }

        return response.json();
    }

    async deleteUser(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/users/delete/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete user');
        }

        return response.json();
    }

    async getUser(id: string): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch user');
        }

        return response.json();
    }

    // Get all users (for admin dashboard)
    async getAllUsers(): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}/users/all/list`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch users');
        }

        return response.json();
    }
}

export const api = new ApiService();
