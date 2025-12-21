import { ReactNode } from 'react';
import Link from 'next/link';
import { Car } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

                <div className="relative z-20 p-12 max-w-lg text-white">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                            <Car className="h-6 w-6" />
                        </div>
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

            <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-background">
                <div className="p-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-foreground">
                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white">
                            <Car className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-lg">CarRental</span>
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} CarRental Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
