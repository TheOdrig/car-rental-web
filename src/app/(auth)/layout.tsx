import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/auth-backdrop.svg')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30 z-10" />

                <div className="relative z-20 p-12 max-w-lg text-white">
                    <div className="mb-6">
                        <p className="text-xl font-bold tracking-wide">Car Rental</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                        Experience the freedom of the open road.
                    </h1>
                    <p className="text-lg text-gray-200 leading-relaxed mb-8">
                        Check live availability, see the full price breakdown before you request, and pay once your rental is approved.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="text-primary" aria-hidden="true">✓</span>
                            <span>Live availability</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary" aria-hidden="true">✓</span>
                            <span>Clear pricing</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-white dark:bg-slate-950">
                <div className="p-6 flex justify-between items-center">
                    <Link href="/" className="text-slate-900 dark:text-slate-100">
                        <span className="font-bold text-lg">Car Rental</span>
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 pb-12">
                    <div className="w-full max-w-md mx-auto">
                        {children}
                    </div>
                </div>

                <div className="p-6 text-center lg:text-left">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        © {new Date().getFullYear()} Car Rental. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}