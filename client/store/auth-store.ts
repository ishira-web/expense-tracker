import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    sessionToken: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean; // Tracking hydration state
    login: (user: User, accessToken: string, sessionToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            sessionToken: null,
            isAuthenticated: false,
            _hasHydrated: false,

            login: (user, accessToken, sessionToken) => {
                // Store tokens in localStorage for API calls
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('sessionToken', sessionToken);
                }

                set({
                    user,
                    accessToken,
                    sessionToken,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                // Clear tokens from localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('sessionToken');
                }

                set({
                    user: null,
                    accessToken: null,
                    sessionToken: null,
                    isAuthenticated: false,
                });
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                }));
            },

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: (state) => {
                return () => state.setHasHydrated(true);
            },
        }
    )
);
