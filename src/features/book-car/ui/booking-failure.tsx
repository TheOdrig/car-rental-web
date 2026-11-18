'use client';

import { XCircle, RefreshCw, Headphones, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-br from-red-500 to-rose-600 px-8 py-12 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
                            <XCircle className="h-12 w-12" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Failed</h1>
                        <p className="text-red-100 text-lg">We couldn&apos;t complete your booking.</p>
                    </div>

                    <div className="px-8 py-8 space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-5">
                            <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
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
                                <Link href="/cars">
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Browse Other Cars
                                </Link>
                            </Button>
                        </div>

                        <div className="border-t border-border pt-6">
                            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full p-2 shrink-0">
                                        <Headphones className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Need Help?</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            Our support team is available 24/7
                                        </p>
                                        <a
                                            href="tel:1-800-CAR-RENT"
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            1-800-CAR-RENT
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
