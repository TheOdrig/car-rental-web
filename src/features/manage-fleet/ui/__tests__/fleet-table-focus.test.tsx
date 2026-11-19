import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FleetTable } from '../fleet-table';

const car = {
    id: 5,
    brand: 'Honda',
    model: 'Civic',
    productionYear: 2022,
    licensePlate: 'AB 123',
    carStatusType: 'AVAILABLE',
    price: 100,
    currencyType: 'USD',
} as never;

describe('FleetTable status dialog', () => {
    it('returns focus to the row menu when the dialog is dismissed with Escape', async () => {
        window.HTMLElement.prototype.hasPointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        const user = userEvent.setup();
        render(<FleetTable cars={[car]} totalCars={1} onDeleteCar={vi.fn()} onUpdateStatus={vi.fn()} />);

        const trigger = screen.getByRole('button', { name: /More actions for Honda Civic/ });
        await user.click(trigger);
        await user.click(await screen.findByRole('menuitem', { name: /Change Status/ }));
        expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

        await user.keyboard('{Escape}');

        await waitFor(() => expect(trigger).toHaveFocus());
    });
});
