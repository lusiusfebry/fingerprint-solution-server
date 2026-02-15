"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { User, LoginDto } from '@/types/auth.types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
    login: async () => { },
    logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const login = useCallback(async (credentials: LoginDto) => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);
            setToken(response.accessToken);
            setUser(response.user);
            setIsAuthenticated(true);
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            router.push('/');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    // Verify token and get user profile
                    const userProfile = await authService.getCurrentUser();
                    setUser(userProfile);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Auth check failed:", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        if (isLoading) {
            initAuth();
        }
    }, [isLoading, logout]);

    // Implement auto-refresh token logic here if needed (e.g. using interceptors or interval)
    // For now, interceptors in api.ts handle 401 redirection.

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
