'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { Expense } from '@/types';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Loader2, Wallet, TrendingDown } from 'lucide-react';
import ExpenseForm from '@/components/expense-form';
import { Pagination } from '@/components/ui/pagination';

export default function UserDashboard() {
    const { user, updateUser } = useAuthStore();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch expenses on mount
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await api.getExpenses();
            const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setExpenses(sortedData);
            setCurrentPage(1); // Reset to first page

            // Refresh user profile for latest balance
            const userData = await api.getProfile();
            updateUser(userData);
        } catch (error: unknown) {
            toast.error('Failed to fetch expenses', {
                description: (error as Error).message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Derived pagination values
    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    const paginatedExpenses = expenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await api.deleteExpense(id);
            toast.success('Expense deleted successfully');
            fetchExpenses();
        } catch (error: unknown) {
            toast.error('Failed to delete expense', {
                description: (error as Error).message || 'Unknown error',
            });
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingExpense(null);
    };

    const handleSuccess = () => {
        handleCloseDialog();
        fetchExpenses();
    };

    // Calculate wallet info
    const walletBalance = user?.walletBalance || 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.deposit === 0 ? exp.amount : 0), 0);

    return (
        <ProtectedRoute allowedRoles={['user']}>
            <div className="space-y-6">
                {/* Wallet Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card/50 backdrop-blur-xl border-border">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-muted-foreground">Wallet Balance</CardDescription>
                            <CardTitle className="text-3xl text-foreground flex items-center">
                                <Wallet className="w-6 h-6 mr-2 text-primary" />
                                LKR {walletBalance.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-border">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-muted-foreground">Total Expenses</CardDescription>
                            <CardTitle className="text-3xl text-foreground flex items-center">
                                <TrendingDown className="w-6 h-6 mr-2 text-destructive" />
                                LKR {totalExpenses.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-border">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-muted-foreground">Total Deposited</CardDescription>
                            <CardTitle className="text-3xl text-foreground">
                                LKR {(user?.totalDeposited || 0).toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Expenses Table */}
                <Card className="bg-card/50 backdrop-blur-xl border-border">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-foreground">My Expenses</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Manage and track your expenses
                                </CardDescription>
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setEditingExpense(null)}
                                        className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Expense
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-card border-border">
                                    <DialogHeader>
                                        <DialogTitle className="text-foreground">
                                            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                                        </DialogTitle>
                                        <DialogDescription className="text-muted-foreground">
                                            {editingExpense
                                                ? 'Update your expense details'
                                                : 'Fill in the details to add a new expense'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ExpenseForm
                                        expense={editingExpense}
                                        onSuccess={handleSuccess}
                                        onCancel={handleCloseDialog}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No expenses yet. Click &quot;Add Expense&quot; to get started.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border hover:bg-muted/50">
                                                <TableHead className="text-muted-foreground">Date</TableHead>
                                                <TableHead className="text-muted-foreground">Description</TableHead>
                                                <TableHead className="text-muted-foreground">Category</TableHead>
                                                <TableHead className="text-muted-foreground">Amount</TableHead>
                                                <TableHead className="text-muted-foreground">Payment</TableHead>
                                                <TableHead className="text-muted-foreground">Balance</TableHead>
                                                <TableHead className="text-muted-foreground">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedExpenses.map((expense) => (
                                                <TableRow
                                                    key={expense._id}
                                                    className="border-border hover:bg-muted/50"
                                                >
                                                    <TableCell className="text-foreground">
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-foreground">{expense.description}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="border-border text-muted-foreground"
                                                        >
                                                            {expense.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-foreground">LKR{expense.amount}</TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {expense.paymentMethod}
                                                    </TableCell>
                                                    <TableCell className="text-foreground">LKR{expense.balance}</TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEdit(expense)}
                                                                className="text-muted-foreground hover:text-foreground hover:bg-accent"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(expense._id)}
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/20"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
