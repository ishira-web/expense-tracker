'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { LogOut, Wallet, User, Users, LayoutDashboard } from 'lucide-react';

import { ProfileDialog } from '@/components/profile-dialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };



    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Header */}
            <header className="bg-card/50 backdrop-blur-xl border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Expense Tracker</h1>
                                <p className="text-xs text-muted-foreground">
                                    {user?.role === 'user' ? 'Your Expenses' : 'Admin Dashboard'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <ModeToggle />
                            </div>

                            {/* User Info */}
                            <ProfileDialog>
                                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-card/50 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                                    </div>
                                </div>
                            </ProfileDialog>

                            {/* Logout Button */}
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <div className="bg-card/30 backdrop-blur-xl border-b border-border">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <nav className="flex space-x-1 py-2">
                        {user?.role === 'user' ? (
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="ghost"
                                className="text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                My Expenses
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => router.push('/dashboard/admin')}
                                    variant="ghost"
                                    className="text-muted-foreground hover:bg-accent hover:text-foreground"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    User Management
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    );
}
