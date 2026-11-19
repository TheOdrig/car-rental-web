import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RentalNotesCard, hasRentalNotes } from '../rental-notes-card';

describe('RentalNotesCard', () => {
    it('shows the customer booking note', () => {
        render(<RentalNotesCard rental={{ notes: 'Please add a child seat' }} />);

        expect(screen.getByText('Your Booking Note')).toBeInTheDocument();
        expect(screen.getByText('Please add a child seat')).toBeInTheDocument();
    });

    it('counts the booking note as a note', () => {
        expect(hasRentalNotes({ notes: 'x' })).toBe(true);
        expect(hasRentalNotes({})).toBe(false);
    });
});
