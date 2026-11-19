import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PricingSection } from '../pricing';
import { defaultCarFormData } from '../../../model/types';

const data = { ...defaultCarFormData, dailyRate: 120.5 };

describe('PricingSection currency', () => {
    it('summarizes the rates in the default currency for a new car', () => {
        render(<PricingSection data={data} errors={{}} onUpdate={vi.fn()} />);

        expect(screen.getByText('$120.50')).toBeInTheDocument();
        expect(screen.queryByLabelText(/weekly rate/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/deposit/i)).not.toBeInTheDocument();
    });

    it('uses the car currency for the symbol, the summary and the select', () => {
        render(<PricingSection data={{ ...data, currencyType: 'EUR' }} errors={{}} onUpdate={vi.fn()} />);

        expect(screen.getByText('€120.50')).toBeInTheDocument();
        expect(screen.getAllByText('€', { selector: 'span[aria-hidden="true"]' })).toHaveLength(1);
        expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Select currency' })).toHaveTextContent('EUR');
    });

    it('keeps a TRY car in TRY', () => {
        render(<PricingSection data={{ ...data, currencyType: 'TRY' }} errors={{}} onUpdate={vi.fn()} />);

        expect(screen.getByRole('combobox', { name: 'Select currency' })).toHaveTextContent('TRY');
    });
});
