'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/lib/hooks';

type CallbackStatus = 'loading' | 'success' | 'error';

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<CallbackStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            const error = searchParams.get('error');
            const success = searchParams.get('success');

            if (error) {
                setStatus('error');
                setErrorMessage(decodeURIComponent(error));
                return;
            }

            if (success === 'true') {
                setStatus('success');
                await queryClient.invalidateQueries({ queryKey: authKeys.me() });
                setTimeout(() => {
                    router.push('/');
                }, 1500);
                return;
            }

            setStatus('error');
            setErrorMessage('Invalid callback response');
        };

        handleCallback();
    }, [searchParams, queryClient, router]);

    return (
        <div className="flex flex-col items-center justify-center text-center py-12">
            {status === 'loading' && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="text-2xl font-bold">Completing sign in...</h1>
                    <p className="text-muted-foreground mt-2">
                        Please wait while we authenticate your account.
                    </p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold text-green-600">Success!</h1>
                    <p className="text-muted-foreground mt-2">
                        You have been signed in. Redirecting...
                    </p>
                </>
            )}

            {status === 'error' && (
                <>
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold text-destructive">Authentication Failed</h1>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        {errorMessage || 'An error occurred during authentication. Please try again.'}
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Back to Login
                    </button>
                </>
            )}
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <div className="space-y-8">
            <Suspense fallback={<LoadingFallback />}>
                <OAuthCallbackContent />
            </Suspense>
        </div>
    );
}

