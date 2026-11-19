import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { showToast } from '@/shared/lib';
import { DamageChargeDialog } from '../damage-charge-dialog';
import { BanCustomerDialog } from '@/features/manage-users/ui/customer-detail/ban-customer-dialog';

const clientPost = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientPost: (...args: unknown[]) => clientPost(...args) };
});
vi.mock('@/shared/lib', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/lib')>();
    return {
        ...original,
        showToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
    };
});

function slowSuccess<T>(value: T) {
    return new Promise<T>((resolve) => setTimeout(() => resolve(value), 20));
}

describe('double submit', () => {
    beforeEach(() => {
        clientPost.mockReset();
        vi.mocked(showToast.success).mockClear();
        vi.mocked(showToast.error).mockClear();
    });

    it('charges the customer once on a double click', async () => {
        clientPost.mockImplementation(() => slowSuccess({ charged: true, message: 'Charged' }));
        renderWithProviders(<DamageChargeDialog damageId={4} amount={250} currency="EUR" open onOpenChange={vi.fn()} />);

        const button = screen.getByRole('button', { name: /^Charge/ });
        fireEvent.click(button);
        fireEvent.click(button);

        await waitFor(() => expect(showToast.success).toHaveBeenCalledTimes(1));
        expect(clientPost).toHaveBeenCalledTimes(1);
        expect(showToast.error).not.toHaveBeenCalled();
    });

    it('bans the customer once on a double click', async () => {
        clientPost.mockImplementation(() => slowSuccess({ id: 9, firstName: 'A', lastName: 'B' }));
        renderWithProviders(
            <BanCustomerDialog
                open
                onOpenChange={vi.fn()}
                customerId={9}
                customerName="A B"
                statistics={{ totalRentals: 1, totalDamageReports: 0, lateReturns: 0 } as never}
            />
        );

        fireEvent.change(screen.getByLabelText(/Ban Reason/), { target: { value: 'Repeated abuse of the service' } });
        const button = screen.getByRole('button', { name: /Ban Customer/ });
        fireEvent.click(button);
        fireEvent.click(button);

        await waitFor(() => expect(showToast.success).toHaveBeenCalledTimes(1));
        expect(clientPost).toHaveBeenCalledTimes(1);
        expect(showToast.error).not.toHaveBeenCalled();
    });
});
