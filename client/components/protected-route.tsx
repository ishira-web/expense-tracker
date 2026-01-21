'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('user' | 'hr' | 'admin' | 'superadmin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();

    useEffect(() => {
        // Wait for hydration to finish before redirecting
        if (!_hasHydrated) return;

        // Check if user is authenticated
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Check if user has the required role
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard if user doesn't have permission
            if (user.role === 'user') {
                router.push('/dashboard');
            } else {
                router.push('/dashboard/admin');
            }
        }
    }, [isAuthenticated, user, router, allowedRoles, _hasHydrated]);

    // Show loading while checking authentication or waiting for hydration
    if (!_hasHydrated || (!isAuthenticated && typeof window !== 'undefined')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    // Check role permissions
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
