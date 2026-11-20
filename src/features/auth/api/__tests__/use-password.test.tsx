import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';

vi.mock('@/shared/api', async () => {
    const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api');
    return { ...actual, clientPost: vi.fn() };
});
vi.mock('@/shared/lib', () => ({
    showToast: { success: vi.fn(), error: vi.fn() },
    toastMessages: { profile: { passwordChangeSuccess: 'Changed', passwordChangeError: 'Failed to change password' } },
}));

import { clientPost, ApiError } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { useChangePassword } from '../use-password';

function problem(message: string, code = 'INVALID_PASSWORD'): ApiError {
    return new ApiError({ status: 400, message, code, timestamp: new Date().toISOString() });
}

async function fail(error: ApiError) {
    vi.mocked(clientPost).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useChangePassword(), { wrapper: createQueryWrapper() });
    result.current.mutate({ currentPassword: 'a', newPassword: 'b', confirmPassword: 'b' } as never);
    await waitFor(() => expect(showToast.error).toHaveBeenCalled());
}

describe('useChangePassword errors', () => {
    beforeEach(() => vi.clearAllMocks());

    it('tells the user the current password is wrong only when the API says so', async () => {
        await fail(problem('Current password is incorrect'));

        expect(showToast.error).toHaveBeenCalledWith(
            'Incorrect current password',
            'Please check your current password and try again'
        );
    });

    it('shows the API message when the new password equals the current one', async () => {
        await fail(problem('New password must be different from current password'));

        expect(showToast.error).toHaveBeenCalledWith(
            'Failed to change password',
            'New password must be different from current password'
        );
    });
});
