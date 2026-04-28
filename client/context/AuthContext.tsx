'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
    address?: string;
    preferences?: string;
    themePreference?: string;
    avatarUrl?: string;
    planType?: 'free' | 'pro' | 'premium';
    credits?: number;
    creditsLastRefreshed?: string;
}

interface AuthContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    accessToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const attemptTokenRefresh = useCallback(async (rt: string): Promise<string | null> => {
        try {
            const res = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: rt }),
            });
            if (res.ok) {
                const data = await res.json();
                const newToken = data.accessToken;
                setAccessToken(newToken);
                localStorage.setItem('accessToken', newToken);
                return newToken;
            }
        } catch (_) { }
        return null;
    }, []);

    const clearAuth = () => {
        setCurrentUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    useEffect(() => {
        const updateTheme = () => {
            let theme = 'light';
            if (currentUser?.themePreference) {
                theme = currentUser.themePreference;
            } else {
                theme = localStorage.getItem('themePreference') || 'light';
            }
            document.documentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-theme', theme);
        };
        updateTheme();
        window.addEventListener('storage', updateTheme);
        return () => window.removeEventListener('storage', updateTheme);
    }, [currentUser?.themePreference]);

    useEffect(() => {
        const init = async () => {
            const at = localStorage.getItem('accessToken');
            const rt = localStorage.getItem('refreshToken');
            if (!at) { setLoading(false); return; }

            setAccessToken(at);
            if (rt) setRefreshToken(rt);

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${at}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.user);
                } else if (res.status === 401 && rt) {
                    const newAt = await attemptTokenRefresh(rt);
                    if (newAt) {
                        const res2 = await fetch('/api/auth/me', {
                            headers: { Authorization: `Bearer ${newAt}` },
                        });
                        if (res2.ok) setCurrentUser((await res2.json()).user);
                        else clearAuth();
                    } else clearAuth();
                } else clearAuth();
            } catch (_) {
                clearAuth();
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [attemptTokenRefresh]);

    const login = async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');

        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setCurrentUser(data.user);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
    };

    const signup = async (fullName: string, email: string, password: string) => {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Signup failed');

        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setCurrentUser(data.user);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ refreshToken }),
            });
        } catch (_) { }
        clearAuth();
    };

    const authenticatedFetch = useCallback(
        async (url: string, options: RequestInit = {}): Promise<Response> => {
            const currentAt = localStorage.getItem('accessToken') || accessToken;
            const headers: Record<string, string> = {
                ...(options.headers as Record<string, string>),
            };
            if (currentAt) headers['Authorization'] = `Bearer ${currentAt}`;

            let res = await fetch(url, { ...options, headers });
            if (res.status === 401 && refreshToken) {
                const newAt = await attemptTokenRefresh(refreshToken);
                if (newAt) {
                    headers['Authorization'] = `Bearer ${newAt}`;
                    res = await fetch(url, { ...options, headers });
                }
            }
            return res;
        },
        [accessToken, refreshToken, attemptTokenRefresh]
    );

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, accessToken, loading, login, signup, logout, authenticatedFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
