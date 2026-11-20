'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100dvh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    textAlign: 'center',
                    padding: '1rem',
                }}
            >
                <main role="alert">
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
                    <p style={{ color: '#555', marginBottom: '1.5rem' }}>
                        An unexpected error occurred. Please try again.
                    </p>
                    {error.digest && (
                        <p style={{ color: '#777', fontSize: '0.75rem', marginBottom: '1rem' }}>
                            Error ID: {error.digest}
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={reset}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #ccc', cursor: 'pointer' }}
                    >
                        Try again
                    </button>
                </main>
            </body>
        </html>
    );
}
