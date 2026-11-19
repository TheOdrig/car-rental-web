import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerDamageHistory } from '../customer-damage-history';
import { VehicleDamageHistory } from '../vehicle-damage-history';

const mockCustomer = vi.hoisted(() => vi.fn());
const mockVehicle = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/entities/damage', async () => {
    const actual = await vi.importActual<typeof import('@/entities/damage')>('@/entities/damage');
    return { ...actual, useCustomerDamages: mockCustomer, useVehicleDamages: mockVehicle };
});

describe('damage history cards', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        ['customer', () => <CustomerDamageHistory userId={4} />, mockCustomer],
        ['vehicle', () => <VehicleDamageHistory carId={8} />, mockVehicle],
    ])('show an error with retry for the %s history instead of an empty list', async (_name, Component, hook) => {
        const refetch = vi.fn();
        hook.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });

        render(<Component />);

        expect(screen.getByText('Failed to load damage history')).toBeInTheDocument();
        expect(screen.queryByText(/no damage/i)).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
