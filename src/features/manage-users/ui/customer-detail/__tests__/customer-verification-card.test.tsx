import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerVerificationCard } from '../customer-verification-card';

describe('CustomerVerificationCard', () => {
    it('reports email and phone only, without a placeholder document status', () => {
        render(
            <CustomerVerificationCard
                customerId={1}
                verification={{ emailVerified: true, phoneVerified: false, documentsVerified: 'PENDING', documentTypes: [] }}
            />
        );

        expect(screen.getByText('Email')).toBeTruthy();
        expect(screen.getByText('Phone')).toBeTruthy();
        expect(screen.queryByText(/Documents/)).toBeNull();
        expect(screen.queryByText(/Pending Review/)).toBeNull();
    });
});
