import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionKeeper } from '../session-keeper';
import { authKeys } from '../../api/use-auth';

const mockGet = vi.hoisted(() => vi.fn());
const mockExpired = vi.hoisted(() => ({ handler: null as null | (() => void) }));
const assign = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/shared/api', async () => {
    const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api');
    return {
        ...actual,
        clientGet: mockGet,
        onSessionExpired: (handler: (() => void) | null) => {
            mockExpired.handler = handler;
        },
    };
});

function setup(pathname: string) {
    Object.assign(window.location, { pathname, search: '?tab=1', assign });
    const queryClient = new QueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <SessionKeeper />
        </QueryClientProvider>
    );
    return queryClient;
}

describe('SessionKeeper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockExpired.handler = null;
        mockGet.mockResolvedValue({ id: 1, username: 'u', roles: ['USER'], exp: 1 });
    });

    it('registers a handler that signs the user out and sends protected pages to login', async () => {
        const queryClient = setup('/rentals');
        await waitFor(() => expect(queryClient.getQueryData(authKeys.me())).toMatchObject({ id: 1 }));

        mockExpired.handler?.();

        expect(queryClient.getQueryData(authKeys.me())).toBeNull();
        expect(assign).toHaveBeenCalledWith('http://localhost:3000/login?callbackUrl=%2Frentals%3Ftab%3D1');
    });

    it('only signs out on public pages', async () => {
        const queryClient = setup('/cars');
        await waitFor(() => expect(queryClient.getQueryData(authKeys.me())).toMatchObject({ id: 1 }));

        mockExpired.handler?.();

        expect(queryClient.getQueryData(authKeys.me())).toBeNull();
        expect(assign).not.toHaveBeenCalled();
    });

    it('unregisters the handler on unmount', () => {
        const queryClient = new QueryClient();
        const view = render(
            <QueryClientProvider client={queryClient}>
                <SessionKeeper />
            </QueryClientProvider>
        );
        expect(mockExpired.handler).not.toBeNull();

        view.unmount();

        expect(mockExpired.handler).toBeNull();
    });
});
