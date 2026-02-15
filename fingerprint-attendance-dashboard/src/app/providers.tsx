"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <WebSocketProvider>
                    {children}
                    <Toaster position="top-right" />
                </WebSocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
