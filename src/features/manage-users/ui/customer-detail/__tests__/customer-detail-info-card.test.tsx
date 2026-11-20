import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerDetailInfoCard } from '../customer-detail-info-card';
import type { CustomerDetailResponse } from '@/entities/user';

function customer(overrides: Partial<CustomerDetailResponse> = {}, emailVerified = true): CustomerDetailResponse {
    return {
        id: 4,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        roles: ['USER'],
        registrationDate: '2026-01-02T10:00:00Z',
        verification: { emailVerified, phoneVerified: false, documentsVerified: 'NO', documentTypes: [] },
        ...overrides,
    } as CustomerDetailResponse;
}

describe('CustomerDetailInfoCard', () => {
    it('says the customer never logged in when there is no last login', () => {
        render(<CustomerDetailInfoCard customer={customer({ lastLoginDate: undefined })} />);

        expect(screen.getByText('Last Login')).toBeInTheDocument();
        expect(screen.getByText('Never logged in')).toBeInTheDocument();
    });

    it('falls back to the email instead of printing null for a nameless customer', () => {
        render(<CustomerDetailInfoCard customer={customer({ firstName: undefined, lastName: undefined })} />);

        expect(screen.getByRole('heading', { level: 2, name: 'ada@example.com' })).toBeInTheDocument();
        expect(screen.queryByText(/null|undefined/)).not.toBeInTheDocument();
    });

    it('shows the last login time when there is one', () => {
        render(<CustomerDetailInfoCard customer={customer({ lastLoginDate: '2030-05-06T12:00:00Z' })} />);

        expect(screen.queryByText('Never logged in')).not.toBeInTheDocument();
        expect(screen.getByText(/May [5-7], 2030/)).toBeInTheDocument();
    });

    it('reflects the real email verification state', () => {
        const { rerender } = render(<CustomerDetailInfoCard customer={customer({}, true)} />);
        expect(screen.getByText('Verified')).toBeInTheDocument();

        rerender(<CustomerDetailInfoCard customer={customer({}, false)} />);
        expect(screen.getByText('Unverified')).toBeInTheDocument();
    });
});
