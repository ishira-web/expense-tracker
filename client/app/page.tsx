'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      if (user.role === 'user') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard/admin');
      }
    } else {
      // Redirect to login
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  );
}
