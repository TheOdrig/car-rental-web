import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PricingSection } from '../pricing';
import { defaultCarFormData } from '../../../model/types';

const data = { ...defaultCarFormData, dailyRate: 120.5, weeklyRate: 700, depositAmount: 300 };

describe('PricingSection currency', () => {
    it('summarizes the rates in the configured currency by default', () => {
        render(<PricingSection data={data} errors={{}} onUpdate={vi.fn()} />);

        expect(screen.getByText('$120.50')).toBeInTheDocument();
        expect(screen.getByText('$700.00')).toBeInTheDocument();
        expect(screen.getByText('$300.00')).toBeInTheDocument();
    });

    it('uses the currency it is given for the symbol and the summary', () => {
        render(<PricingSection data={data} errors={{}} onUpdate={vi.fn()} currency="EUR" />);

        expect(screen.getByText('€120.50')).toBeInTheDocument();
        expect(screen.getAllByText('€', { selector: 'span[aria-hidden="true"]' })).toHaveLength(3);
        expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
});
