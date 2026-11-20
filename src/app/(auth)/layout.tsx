import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Link from 'next/link';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { AUTH_IMAGE_URL, APP_NAME } from '@/shared/config/constants';

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
                <DynamicImage
                    src={AUTH_IMAGE_URL}
                    alt=""
                    fill
                    sizes="50vw"
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/70 z-10" />

                <div className="relative z-20 p-12 max-w-lg text-white">
                    <div className="mb-6">
                        <p className="text-xl font-bold tracking-wide">{APP_NAME}</p>
                    </div>
                    <p className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                        Your rentals, in one place.
                    </p>
                    <p className="text-lg text-white/85 leading-relaxed mb-8">
                        Check live availability, see the full price breakdown before you request, and pay once your rental is approved.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-white/75">
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true">✓</span>
                            <span>Live availability</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true">✓</span>
                            <span>Clear pricing</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-card">
                <div className="p-6 flex justify-between items-center">
                    <Link href="/" className="text-foreground">
                        <span className="font-bold text-lg">{APP_NAME}</span>
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
                        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}