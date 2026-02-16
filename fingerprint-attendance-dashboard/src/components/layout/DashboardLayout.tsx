"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark"><LoadingSpinner size="lg" /></div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-industrial-black overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
                <Header />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
