'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, Wallet } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

// Zod validation schema
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate form data
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    fieldErrors[String(issue.path[0])] = issue.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.login(formData);

            // Store auth data in zustand store
            login(response.user, response.accessToken, response.sessionToken);

            // Show success notification
            toast.success('Login successful!', {
                description: `Welcome back, ${response.user.name}!`,
            });

            // Navigate to appropriate dashboard based on role
            if (response.user.role === 'user') {
                router.push('/dashboard');
            } else {
                // HR, Admin, or Super Admin
                router.push('/dashboard/admin');
            }
        } catch (error: unknown) {
            toast.error('Login failed', {
                description: (error as Error).message || 'Invalid email or password. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ... (keep imports)

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 transition-colors duration-500">
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>

            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/30">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Expense Tracker</h1>
                    <p className="text-slate-600 dark:text-purple-200 text-lg">Manage your expenses effortlessly</p>
                </div>

                {/* Login Card */}
                <Card className="border-slate-200 dark:border-purple-500/20 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl text-slate-900 dark:text-white">Welcome back</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-purple-200 text-base">
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-purple-100 text-sm font-medium ml-1">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 h-12 text-base px-4 transition-all"
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 dark:text-red-400 ml-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 dark:text-purple-100 text-sm font-medium ml-1">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 h-12 text-base px-4 transition-all"
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500 dark:text-red-400 ml-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="text-right">
                                <a href="/forgot-password" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg shadow-lg shadow-purple-500/30 transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-purple-500/20">
                            <p className="text-xs font-bold text-slate-500 dark:text-purple-200 mb-3 uppercase tracking-wider">Demo Credentials</p>
                            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 font-mono">
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                                    <span>User:</span>
                                    <span className="text-slate-900 dark:text-white">user@example.com</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span>HR:</span>
                                    <span className="text-slate-900 dark:text-white">hr@example.com</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">Password: password123</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-slate-500 dark:text-purple-200 text-sm mt-8">
                    © 2026 Expense Tracker. All rights reserved.
                </p>
            </div>
        </div>
    );
}