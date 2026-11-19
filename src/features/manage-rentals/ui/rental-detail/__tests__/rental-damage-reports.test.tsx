import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';

const clientGet = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/shared/api')>();
    return { ...actual, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { RentalDamageReports } from '../rental-damage-reports';

function page(content: unknown[]) {
    return { content, page: 0, size: 100, totalElements: content.length, totalPages: 1 };
}

describe('RentalDamageReports', () => {
    beforeEach(() => {
        clientGet.mockReset();
    });

    it('links to the damage reports of this rental only', async () => {
        clientGet.mockResolvedValue(
            page([createMockDamage({ id: 7, rentalId: 16 }), createMockDamage({ id: 8, rentalId: 99 })])
        );

        renderWithProviders(<RentalDamageReports rentalId={16} />);

        expect(await screen.findByRole('link', { name: /Report #7/ })).toHaveAttribute('href', '/damages/7');
        expect(screen.queryByRole('link', { name: /Report #8/ })).not.toBeInTheDocument();
    });

    it('renders nothing without a damage report', async () => {
        clientGet.mockResolvedValue(page([createMockDamage({ id: 8, rentalId: 99 })]));

        const { container } = renderWithProviders(<RentalDamageReports rentalId={16} />);

        await vi.waitFor(() => expect(clientGet).toHaveBeenCalled());
        expect(container).toBeEmptyDOMElement();
    });
});
