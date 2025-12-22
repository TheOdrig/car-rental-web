import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

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

export function createQueryWrapper() {
    const queryClient = createTestQueryClient();

    return function QueryWrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
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
