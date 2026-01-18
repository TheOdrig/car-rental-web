'use client';

import { XCircle, RefreshCw, CreditCard, Headphones, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BookingFailureProps {
    errorMessage?: string;
    errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
    card_declined: 'Your card was declined. Please check your card details or try a different card.',
    insufficient_funds: 'The transaction was declined due to insufficient funds.',
    expired_card: 'This card has expired. Please use a different card.',
    invalid_cvc: 'The security code (CVC) is invalid. Please check and try again.',
    processing_error: 'There was an error processing your payment. Please try again.',
    timeout: 'The payment request timed out. Please try again.',
    default: 'We were unable to process your payment. Please try again or use a different payment method.',
};

export function BookingFailure({
    errorMessage,
    errorCode,
}: BookingFailureProps) {
    const router = useRouter();

    const displayMessage = errorMessage || ERROR_MESSAGES[errorCode || 'default'] || ERROR_MESSAGES.default;

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
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Payment Failed</h1>
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
                                variant="outline"
                                onClick={handleTryAgain}
                                className="w-full"
                                size="lg"
                            >
                                <CreditCard className="h-5 w-5 mr-2" />
                                Use Different Card
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
