'use client';

import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

interface BookingFailureProps {
    errorMessage?: string;
}

const DEFAULT_MESSAGE = 'We were unable to submit your booking request. Please try again.';

export function BookingFailure({ errorMessage }: BookingFailureProps) {
    const router = useRouter();

    const displayMessage = errorMessage || DEFAULT_MESSAGE;

    const handleTryAgain = () => {
        router.back();
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full">
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                    <div className="bg-destructive px-8 py-12 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
                            <XCircle className="h-12 w-12" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Failed</h1>
                        <p className="text-danger-subtle-foreground text-lg">We couldn&apos;t complete your booking.</p>
                    </div>

                    <div className="px-8 py-8 space-y-6">
                        <div className="bg-danger-subtle border border-danger-subtle-foreground/30 rounded-xl p-5">
                            <p className="text-danger-subtle-foreground text-sm leading-relaxed">
                                {displayMessage}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleTryAgain}
                                className="w-full"
                                size="lg"
                            >
                                <RefreshCw className="h-5 w-5 mr-2" />
                                Try Again
                            </Button>

                            <Button
                                variant="ghost"
                                asChild
                                className="w-full"
                                size="lg"
                            >
                                <Link href={ROUTES.cars.list}>
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Browse Other Cars
                                </Link>
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
