import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Car } from 'lucide-react';
import { StatTile } from '../stat-tile';

describe('StatTile', () => {
    it('renders the full label, the value and a hint', () => {
        render(<StatTile label="Maintenance" value={3} hint="12% of total" icon={Car} />);

        expect(screen.getByText('Maintenance')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('12% of total')).toBeInTheDocument();
    });

    it('keeps the icon and the status dot out of the accessibility tree', () => {
        const { container } = render(<StatTile label="Rented" value={1} icon={Car} dotClassName="bg-blue-500" />);

        expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    });
});
