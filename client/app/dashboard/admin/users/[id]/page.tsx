'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Expense } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Wallet, Calendar, Receipt, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';

interface UserDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageProofs, setCurrentPageProofs] = useState(1);
    const itemsPerPage = 5; // 5 days per page for timeline view / 6 items for gallery

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        if (!unwrappedParams?.id) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [userData, expensesData] = await Promise.all([
                    api.getUser(unwrappedParams.id),
                    api.getExpenses(unwrappedParams.id)
                ]);
                setUser(userData);
                setExpenses(expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch user details');
                router.push('/dashboard/admin');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [unwrappedParams, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    // Group expenses by date for timeframe view
    const expensesByDate = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(expense);
        return acc;
    }, {} as Record<string, Expense[]>);

    const sortedDates = Object.keys(expensesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Derived pagination values
    const totalPages = Math.ceil(sortedDates.length / itemsPerPage);
    const paginatedDates = sortedDates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-background p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/admin">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        {user.name}
                        <Badge className={`${user.role === 'admin' ? 'bg-primary' :
                            user.role === 'hr' ? 'bg-destructive' : 'bg-secondary text-secondary-foreground'
                            }`}>
                            {user.role.toUpperCase()}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 border-border backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${(user.walletBalance || 0) < 0 ? 'text-destructive' : 'text-foreground'}`}>
                            LKR{(user.walletBalance || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                        <TrendingUp className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">LKR{totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposited</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">LKR{user.totalDeposited?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-card/50 border border-border">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="proofs">Proof Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-card/50 border-border backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Expense Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {sortedDates.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8">No expenses found.</p>
                                ) : (
                                    <div className="space-y-8">
                                        {paginatedDates.map((date) => (
                                            <div key={date} className="relative pl-6 border-l-2 border-border">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                                <h3 className="text-lg font-semibold text-foreground mb-4">{date}</h3>
                                                <div className="space-y-3">
                                                    {expensesByDate[date].map((expense) => (
                                                        <div key={expense._id} className="bg-card/50 p-4 rounded-lg border border-border flex justify-between items-center transition-all hover:bg-accent/50">
                                                            <div>
                                                                <p className="text-foreground font-medium">{expense.description}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                                                                        {expense.category}
                                                                    </Badge>
                                                                    <span className="text-xs text-muted-foreground">{expense.paymentMethod}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {expense.proofs && (
                                                                    <a href={expense.proofs} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center text-blue-400 hover:text-blue-300">
                                                                        <Receipt className="w-3 h-3 mr-1" />
                                                                        View Proof
                                                                    </a>
                                                                )}
                                                                <span className="text-destructive font-bold">
                                                                    LKR{expense.amount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="proofs">
                    <Card className="bg-card/50 border-border backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-destructive" />
                                Proof Gallery
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                All uploaded receipts and payment proofs organized by date
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                    {expenses.filter(e => e.proofs).slice((currentPageProofs - 1) * 6, currentPageProofs * 6).map((expense) => (
                                        <div key={expense._id} className="break-inside-avoid bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all group">
                                            <div className="relative aspect-4/3 overflow-hidden bg-muted">
                                                {/* We use img tag here because domains might not be configured in Next.js config for all potential proof URLs */}
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={expense.proofs}
                                                    alt={expense.description}
                                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                                    <p className="text-white font-medium truncate">{expense.description}</p>
                                                    <p className="text-white/80 text-sm">
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-3 flex justify-between items-center bg-card">
                                                <span className="text-sm text-muted-foreground">{expense.category}</span>
                                                <span className="text-destructive font-bold text-sm">LKR{expense.amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {expenses.filter(e => e.proofs).length === 0 && (
                                        <p className="text-muted-foreground text-center col-span-full py-12">
                                            No proofs uploaded yet.
                                        </p>
                                    )}
                                </div>
                                <Pagination
                                    currentPage={currentPageProofs}
                                    totalPages={Math.ceil(expenses.filter(e => e.proofs).length / 6)}
                                    onPageChange={setCurrentPageProofs}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
