'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [resetToken, setResetToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.forgotPassword(email);
            setIsSubmitted(true);
            // For demo purposes, we capture the token returned by the backend
            // In production, this would be sent via email
            if (response.token) {
                setResetToken(response.token);
            }
            toast.success('Reset link generated');
        } catch (error: unknown) {
            toast.error('Failed to process request', {
                description: (error as Error).message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center space-x-2 mb-2">
                            <Link href="/login" className="text-purple-200 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <CardTitle className="text-2xl text-white">Forgot Password</CardTitle>
                        </div>
                        <CardDescription className="text-purple-200">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-purple-100">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-slate-900/50 border-purple-500/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <KeyRound className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Check your email</h3>
                                <p className="text-purple-200 text-sm">
                                    We&apos;ve sent a password reset link to <span className="font-semibold text-white">{email}</span>.
                                </p>

                                {resetToken && (
                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20 mt-4 text-left">
                                        <p className="text-xs text-purple-300 font-mono mb-2 break-all">
                                            Demo Link (Click to reset):
                                        </p>
                                        <Link
                                            href={`/reset-password?token=${resetToken}`}
                                            className="text-sm text-pink-400 hover:text-pink-300 underline break-all"
                                        >
                                            /reset-password?token={resetToken.substring(0, 15)}...
                                        </Link>
                                    </div>
                                )}

                                <Button
                                    onClick={() => setIsSubmitted(false)}
                                    variant="outline"
                                    className="mt-4 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                                >
                                    Try another email
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
