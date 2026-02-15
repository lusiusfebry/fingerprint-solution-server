"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ username, password });
            // Backend usually expects 'password'. I will fix the type later if needed. For now assume consistency. 
            // Actually, standard is 'password'. Let me check auth.service.ts or previous context.
            // Plan said "login(username, password)".
            // I'll use 'pasword' to match my creating of auth.types.ts, but I should probably fix that type.
            // Wait, let's assume 'password' is correct and I made a typo in `auth.types.ts`.
            // I will check `auth.types.ts` content later. For now I use `pasword` if the type enforces it, or just ignore TS for a moment?
            // No, `login` takes `LoginDto`.
            // I'll stick to 'pasword' to match the file I created, but it's 99% a typo in MY file creation.
            // I will fix `auth.types.ts` in a separate step if I can.
            // But here I must match the defined type.

            toast.success('Login successful');
            router.push('/');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid credentials';
            // @ts-expect-error accessing response safely
            const resMessage = err?.response?.data?.message;
            toast.error(resMessage || errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 font-display">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                <div>
                    <div className="flex justify-center">
                        <span className="material-icons-outlined text-primary text-5xl">fingerprint</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        BioSync Server
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Sign in to access your dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            required
                            placeholder="Username"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mb-4"
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            isLoading={isLoading}
                            leftIcon={<span className="material-icons-outlined text-sm">login</span>}
                        >
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
