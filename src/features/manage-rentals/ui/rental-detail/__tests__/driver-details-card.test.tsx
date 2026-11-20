import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DriverDetailsCard } from '../driver-details-card';

describe('DriverDetailsCard', () => {
    it('keeps the username apart from the full name', () => {
        render(
            <DriverDetailsCard
                userSummary={{ id: 1, username: 'ada_l', email: 'ada@example.com', fullName: 'Ada Lovelace' }}
            />
        );

        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByTestId('driver-username')).toHaveTextContent('ada_l');
        expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    });

    it('does not present the username as a full name', () => {
        render(<DriverDetailsCard userSummary={{ id: 1, username: 'ada_l', email: 'ada@example.com' }} />);

        expect(screen.queryByText('Full Name')).not.toBeInTheDocument();
        expect(screen.getByTestId('driver-username')).toHaveTextContent('ada_l');
    });

    it('hides a full name that is only the username', () => {
        render(<DriverDetailsCard userSummary={{ id: 1, username: 'ada_l', email: 'ada@example.com', fullName: 'ada_l' }} />);

        expect(screen.queryByText('Full Name')).not.toBeInTheDocument();
    });
});
