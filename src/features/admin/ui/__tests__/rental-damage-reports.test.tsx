import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RentalDamageReports } from '../rental-damage-reports';

describe('RentalDamageReports', () => {
    it('has a heading and lists only the reports it is given, each linking to the report', () => {
        render(
            <RentalDamageReports
                damages={[
                    { id: 3, description: 'Scratch on the rear bumper', severity: 'MINOR', status: 'RESOLVED', reportedAt: '2026-11-20T10:00:00Z' },
                ]}
            />
        );

        expect(screen.getByText('Damage reports')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Scratch on the rear bumper/ })).toHaveAttribute('href', '/admin/damages/3');
        expect(screen.getByText('Resolved')).toBeInTheDocument();
        expect(screen.getByText('Minor')).toBeInTheDocument();
    });

    it('falls back to the report number when there is no description', () => {
        render(<RentalDamageReports damages={[{ id: 8 }]} />);

        expect(screen.getByRole('link', { name: /Report #8/ })).toHaveAttribute('href', '/admin/damages/8');
    });
});
