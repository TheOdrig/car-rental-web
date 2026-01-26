import { ReactNode } from 'react';
import Link from 'next/link';

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
                        backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30 z-10" />

                <div className="relative z-20 p-12 max-w-lg text-white">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold tracking-wide">CarRental</h3>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                        Experience the freedom of the open road.
                    </h1>
                    <p className="text-lg text-gray-200 leading-relaxed mb-8">
                        Join our community of over 50,000 satisfied drivers. Premium fleet, transparent pricing, and 24/7 support for your journey.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="text-primary">✓</span>
                            <span>Instant Booking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary">✓</span>
                            <span>Best Price Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-white dark:bg-slate-950">
                <div className="p-6 flex justify-between items-center">
                    <Link href="/" className="text-slate-900 dark:text-slate-100">
                        <span className="font-bold text-lg">CarRental</span>
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
                        © {new Date().getFullYear()} CarRental Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

