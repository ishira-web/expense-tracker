'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Expense, User } from '@/types';
import ProtectedRoute from '@/components/protected-route';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Users, Wallet, TrendingDown, Plus, ArrowRight } from 'lucide-react';
import DepositForm from '@/components/deposit-form';
import CreateUserForm from '@/components/create-user-form';
import { Pagination } from '@/components/ui/pagination';

export default function AdminDashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageUsers, setCurrentPageUsers] = useState(1);
    const itemsPerPage = 10;

    // We now fetch users directly via fetchUsers, so we don't need to derive them from expenses here.

    useEffect(() => {
        fetchExpenses();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId === 'all') {
            setExpenses(allExpenses);
        } else {
            const filtered = allExpenses.filter((exp) => {
                const userId = typeof exp.user === 'object' ? (exp.user as User)._id || (exp.user as User).id : exp.user;
                return userId === selectedUserId;
            });
            setExpenses(filtered);
        }
        setCurrentPage(1); // Reset to first page on filter change
    }, [selectedUserId, allExpenses]);

    // Derived pagination values
    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    const paginatedExpenses = expenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await api.getExpenses();
            const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAllExpenses(sortedData);
            setExpenses(sortedData);
        } catch (error: unknown) {
            toast.error('Failed to fetch expenses', {
                description: (error as Error).message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await api.getAllUsers();
            setUsers(data);
        } catch (error: unknown) {
            toast.error('Failed to fetch users', {
                description: (error as Error).message || 'Unknown error',
            });
        }
    };

    const handleDepositSuccess = () => {
        setIsDepositDialogOpen(false);
        fetchExpenses();
        fetchUsers(); // Refresh users to update individual wallet balances
    };

    // Calculate statistics
    const totalUsers = users.length;
    const totalDeposits = allExpenses.reduce((sum, exp) => sum + exp.deposit, 0);
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + (exp.deposit === 0 ? exp.amount : 0), 0);

    // Get user-wise statistics
    const userStats = React.useMemo(() => {
        const stats = new Map<string, { name: string; balance: number; deposits: number; expenses: number }>();

        // Normalize logic for getting a stable string ID
        const getNormalizedId = (u: any) => {
            if (!u) return '';
            // Handle populated user object, string ID, or user record ID
            const id = u._id || u.id || (typeof u === 'string' ? u : '');
            return id.toString().trim();
        };

        // Initialize from users list
        users.forEach(user => {
            const userId = getNormalizedId(user);
            if (userId) {
                stats.set(userId, {
                    name: user.name,
                    balance: user.walletBalance || 0,
                    deposits: 0,
                    expenses: 0
                });
            }
        });

        // Aggregate from all expenses
        allExpenses.forEach((expense) => {
            const userId = getNormalizedId(expense.user);
            if (!userId) return;

            if (!stats.has(userId)) {
                const userName = typeof expense.user === 'object' ? (expense.user as any).name : 'Unknown';
                stats.set(userId, { name: userName, balance: 0, deposits: 0, expenses: 0 });
            }

            const userStat = stats.get(userId)!;

            // Partition by deposit vs expense
            const amount = Number(expense.amount || 0);
            const deposit = Number(expense.deposit || 0);

            if (deposit > 0) {
                userStat.deposits += deposit;
            } else {
                userStat.expenses += amount;
            }
        });

        return Array.from(stats.entries()).map(([id, data]) => ({ id, ...data }));
    }, [allExpenses, users]);

    // Derived pagination values for users
    const totalPagesUsers = Math.ceil(userStats.length / itemsPerPage);
    const paginatedUserStats = userStats.slice(
        (currentPageUsers - 1) * itemsPerPage,
        currentPageUsers * itemsPerPage
    );

    return (
        <ProtectedRoute allowedRoles={['hr', 'admin', 'superadmin']}>
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card/50 backdrop-blur-xl border-border">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-muted-foreground">Total Users</CardDescription>
                            <CardTitle className="text-3xl text-foreground flex items-center">
                                <Users className="w-6 h-6 mr-2 text-primary" />
                                {totalUsers}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-border">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-muted-foreground">Total Deposits</CardDescription>
                            <CardTitle className="text-3xl text-foreground flex items-center">
                                <Wallet className="w-6 h-6 mr-2 text-green-500" />
                                LKR{totalDeposits.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-border">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-muted-foreground">Total Expenses</CardDescription>
                            <CardTitle className="text-3xl text-foreground flex items-center">
                                <TrendingDown className="w-6 h-6 mr-2 text-destructive" />
                                LKR{totalExpenses.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-border">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-muted-foreground">Net Balance (Pool)</CardDescription>
                            <CardTitle className="text-3xl text-foreground">
                                LKR{users.reduce((sum, u) => sum + (u.walletBalance || 0), 0).toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* User-wise Statistics */}
                {/* User-wise Statistics */}
                <Card className="bg-card/50 backdrop-blur-xl border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">User-wise Summary</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Wallet balances and expense summary for each user
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-muted/50">
                                        <TableHead className="text-muted-foreground">User Name</TableHead>
                                        <TableHead className="text-muted-foreground">Wallet Balance</TableHead>
                                        <TableHead className="text-muted-foreground">Total Deposits</TableHead>
                                        <TableHead className="text-muted-foreground">Total Expenses</TableHead>
                                        <TableHead className="text-muted-foreground">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUserStats.map((stat) => (
                                        <TableRow key={stat.id} className="border-border hover:bg-muted/50">
                                            <TableCell className="font-medium text-foreground">
                                                {stat.name}
                                            </TableCell>
                                            <TableCell className="text-foreground">LKR{stat.balance.toFixed(2)}</TableCell>
                                            <TableCell className="text-green-500">LKR{stat.deposits.toFixed(2)}</TableCell>
                                            <TableCell className="text-destructive">LKR{stat.expenses.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Link href={`/dashboard/admin/users/${stat.id}`}>
                                                    <Button variant="outline" size="sm" className="h-8 border-primary/20 hover:bg-primary/10 hover:text-primary">
                                                        View
                                                        <ArrowRight className="w-3 h-3 ml-2" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Pagination
                            currentPage={currentPageUsers}
                            totalPages={totalPagesUsers}
                            onPageChange={setCurrentPageUsers}
                        />
                    </CardContent>
                </Card>

                {/* Expenses Table with Filter */}
                <Card className="bg-card/50 backdrop-blur-xl border-border">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-foreground">All Expenses</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    View and manage expenses across all users
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                    <SelectTrigger className="w-[200px] bg-background border-input text-foreground">
                                        <SelectValue placeholder="Filter by user" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        <SelectItem value="all">All Users</SelectItem>
                                        {userStats.map((stat) => (
                                            <SelectItem key={stat.id} value={stat.id}>
                                                {stat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Deposit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-background border-border">
                                        <DialogHeader>
                                            <DialogTitle className="text-foreground">Add Deposit</DialogTitle>
                                            <DialogDescription className="text-muted-foreground">
                                                Add money to a user&apos;s wallet
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DepositForm
                                            users={userStats}
                                            onSuccess={handleDepositSuccess}
                                            onCancel={() => setIsDepositDialogOpen(false)}
                                        />
                                    </DialogContent>
                                </Dialog>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create User
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-background border-border">
                                        <DialogHeader>
                                            <DialogTitle className="text-foreground">Create New User</DialogTitle>
                                            <DialogDescription className="text-muted-foreground">
                                                Add a new user, HR, or admin to the system
                                            </DialogDescription>
                                        </DialogHeader>
                                        <CreateUserForm
                                            onSuccess={() => {
                                                // Close dialog (handled by Dialog primitive if we had a state, but we can just refetch)
                                                // Trigger a refetch if needed
                                                fetchExpenses(); // Re-fetching will update stats, but maybe not user list if they have no expenses
                                                fetchUsers(); // Also fetch users to update the list
                                                // To properly update user list, we should probably fetch users separately.
                                                // But for now, let's just show success.
                                                // Ideally we should have an open state for this dialog too.
                                                toast.success("User created. Note: They won't appear in lists until they have an expense or you refresh if fetching all users.");
                                            }}
                                            onCancel={() => {
                                                // Close dialog programmatically if using state, else just let user click outside
                                                // We'll leave it simple for now or add state if requested.
                                                document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No expenses found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border hover:bg-muted/50">
                                                <TableHead className="text-muted-foreground">Date</TableHead>
                                                <TableHead className="text-muted-foreground">User</TableHead>
                                                <TableHead className="text-muted-foreground">Description</TableHead>
                                                <TableHead className="text-muted-foreground">Category</TableHead>
                                                <TableHead className="text-muted-foreground">Type</TableHead>
                                                <TableHead className="text-muted-foreground">Amount</TableHead>
                                                <TableHead className="text-muted-foreground">Balance</TableHead>
                                                <TableHead className="text-muted-foreground">Recover</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedExpenses.map((expense) => {
                                                const userName = typeof expense.user === 'object' ? (expense.user as User & { _id: string }).name : 'Unknown';
                                                const isDeposit = expense.deposit > 0;

                                                return (
                                                    <TableRow key={expense._id} className="border-border hover:bg-muted/50">
                                                        <TableCell className="text-foreground">
                                                            {new Date(expense.date).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-foreground font-medium">{userName}</TableCell>
                                                        <TableCell className="text-foreground">{expense.description}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-border text-muted-foreground">
                                                                {expense.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    isDeposit
                                                                        ? 'border-green-500/30 text-green-400'
                                                                        : 'border-pink-500/30 text-pink-400'
                                                                }
                                                            >
                                                                {isDeposit ? 'Deposit' : 'Expense'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell
                                                            className={isDeposit ? 'text-green-500 font-semibold' : 'text-destructive'}
                                                        >
                                                            {isDeposit ? '+' : '-'}LKR{isDeposit ? expense.deposit : expense.amount}
                                                        </TableCell>
                                                        <TableCell className="text-foreground">LKR{expense.balance.toFixed(2)}</TableCell>
                                                        <TableCell className="text-destructive">
                                                            {expense.recoverAmount > 0 ? `LKR${expense.recoverAmount.toFixed(2)}` : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
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
