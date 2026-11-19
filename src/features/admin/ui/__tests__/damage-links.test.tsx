import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMockDamage, createMockDamageListResponse } from '@/entities/damage/lib/testing/factories';
import { CustomerDamageHistory } from '../customer-damage-history';
import { VehicleDamageHistory } from '../vehicle-damage-history';
import { DamageTable } from '../damage-table';

const mockCustomer = vi.hoisted(() => vi.fn());
const mockVehicle = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/entities/damage', async () => {
    const actual = await vi.importActual<typeof import('@/entities/damage')>('@/entities/damage');
    return { ...actual, useCustomerDamages: mockCustomer, useVehicleDamages: mockVehicle };
});

const response = createMockDamageListResponse([createMockDamage({ id: 41 })]);

describe('keyboard reachable damage rows', () => {
    it('customer history rows are links', () => {
        mockCustomer.mockReturnValue({ data: response, isLoading: false, isError: false, refetch: vi.fn() });
        render(<CustomerDamageHistory userId={4} />);

        expect(screen.getByRole('link', { name: /34ABC123/ })).toHaveAttribute('href', '/admin/damages/41');
    });

    it('vehicle history rows are links', () => {
        mockVehicle.mockReturnValue({ data: response, isLoading: false, isError: false, refetch: vi.fn() });
        render(<VehicleDamageHistory carId={5} />);

        expect(screen.getByRole('link', { name: /Scratch on the door/ })).toHaveAttribute('href', '/admin/damages/41');
    });

    it('the damage table description links to the report', () => {
        render(<DamageTable damages={[createMockDamage({ id: 41 })]} />);

        expect(screen.getByRole('link', { name: 'Scratch on the door' })).toHaveAttribute('href', '/admin/damages/41');
    });
});
