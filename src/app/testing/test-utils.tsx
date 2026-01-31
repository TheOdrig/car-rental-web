import React, { type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrencyProvider } from '@/entities/currency';

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

const MOCK_RATES = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0,
    TRY: 27.0,
};

export function createQueryWrapper() {
    const queryClient = createTestQueryClient();
    return function QueryWrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <CurrencyProvider initialRates={MOCK_RATES} initialIsLoading={false}>
                    {children}
                </CurrencyProvider>
            </QueryClientProvider>
        );
    };
}

export function renderWithProviders(ui: React.ReactElement) {
    const queryClient = createTestQueryClient();
    return render(ui, {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                <CurrencyProvider initialRates={MOCK_RATES} initialIsLoading={false}>
                    {children}
                </CurrencyProvider>
            </QueryClientProvider>
        ),
    });
}

export function createRouteParams<T extends Record<string, string>>(params: T) {
    return Promise.resolve(params);
}

export function createMockResponse<T>(data: T, options?: { status?: number; ok?: boolean }) {
    const { status = 200, ok = true } = options ?? {};
    return {
        ok,
        status,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response;
}
