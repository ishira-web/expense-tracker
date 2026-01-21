'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid or missing reset token');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await api.resetPassword(token, password);
            setIsSuccess(true);
            toast.success('Password reset successfully');
        } catch (error: unknown) {
            toast.error('Failed to reset password', {
                description: (error as Error).message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Password Reset Complete</h3>
                    <p className="text-purple-200">
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/login')}
                    className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                >
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!token && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm mb-4">
                    Error: Reset token is missing from the URL.
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-100">
                    New Password
                </Label>
                <div className="relative">
                    <Input
                        id="password"
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-900/50 border-purple-500/30 text-white pl-10"
                        required
                        disabled={isLoading || !token}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-purple-100">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-slate-900/50 border-purple-500/30 text-white pl-10"
                        required
                        disabled={isLoading || !token}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                disabled={isLoading || !token}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                    </>
                ) : (
                    'Reset Password'
                )}
            </Button>

            <div className="text-center pt-2">
                <Link href="/login" className="text-sm text-purple-300 hover:text-white transition-colors">
                    Back to Login
                </Link>
            </div>
        </form>
    );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
                        <CardDescription className="text-purple-200">
                            Create a new secure password for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        }>
                            <ResetPasswordForm />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
