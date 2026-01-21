// Type definitions for the expense tracker application

export interface User {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: 'user' | 'hr' | 'admin' | 'superadmin';
    walletBalance?: number;
    totalDeposited?: number;
    totalRecovered?: number;
    profilePicture?: string;
    coverPicture?: string;
    createdAt?: Date;
    updatedAt?: Date;
    lastActive?: Date;
}

export interface Expense {
    _id: string;
    date: string;
    amount: number;
    description: string;
    category: 'Food' | 'Transport' | 'Accommodation' | 'Entertainment' | 'Others';
    user: string;
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Other';
    balance: number;
    deposit: number;
    recoverAmount: number;
    proofs?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    sessionToken: string;
    user: User;
}

export interface CreateExpenseRequest {
    date: string;
    amount: number;
    description: string;
    category: string;
    paymentMethod: string;
    proof?: File;
}

export interface DepositRequest {
    userId: string;
    amount: number;
}

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}
