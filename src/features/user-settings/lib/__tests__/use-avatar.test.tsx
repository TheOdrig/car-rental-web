import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ApiError } from '@/shared/api';
import { createQueryWrapper } from '@/app/testing/test-utils';

const clientPost = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientPost: (...args: unknown[]) => clientPost(...args) };
});

const toastError = vi.fn();
vi.mock('@/shared/lib', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/lib')>();
    return { ...original, showToast: { ...original.showToast, error: (...args: unknown[]) => toastError(...args), success: vi.fn() } };
});

import { useUploadAvatar } from '../use-avatar';

describe('useUploadAvatar', () => {
    beforeEach(() => {
        clientPost.mockReset();
        toastError.mockReset();
    });

    it('never shows a server path in the failure toast', async () => {
        clientPost.mockRejectedValue(
            new ApiError({ status: 400, message: 'Failed to upload file: /app/uploads', timestamp: new Date().toISOString() })
        );
        const { result } = renderHook(() => useUploadAvatar(), { wrapper: createQueryWrapper() });

        await act(async () => {
            await result.current.mutateAsync(new File(['x'], 'a.png', { type: 'image/png' })).catch(() => undefined);
        });

        await waitFor(() => expect(toastError).toHaveBeenCalled());
        const details = toastError.mock.calls[0].slice(1).join(' ');
        expect(details).not.toContain('/app/uploads');
        expect(details).toMatch(/could not be stored/i);
    });

    it('keeps a clean validation message', async () => {
        const { result } = renderHook(() => useUploadAvatar(), { wrapper: createQueryWrapper() });

        await act(async () => {
            await result.current.mutateAsync(new File(['x'], 'a.txt', { type: 'text/plain' })).catch(() => undefined);
        });

        await waitFor(() => expect(toastError).toHaveBeenCalled());
        expect(toastError.mock.calls[0].join(' ')).toMatch(/valid image file/i);
        expect(clientPost).not.toHaveBeenCalled();
    });
});
