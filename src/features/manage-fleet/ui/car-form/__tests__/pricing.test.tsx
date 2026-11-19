import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PricingSection } from '../pricing';
import { defaultCarFormData } from '../../../model/types';

const data = { ...defaultCarFormData, dailyRate: 120.5, weeklyRate: 700, depositAmount: 300 };

describe('PricingSection currency', () => {
    it('summarizes the rates in the default currency for a new car', () => {
        render(<PricingSection data={data} errors={{}} onUpdate={vi.fn()} />);

        expect(screen.getByText('$120.50')).toBeInTheDocument();
        expect(screen.getByText('$700.00')).toBeInTheDocument();
        expect(screen.getByText('$300.00')).toBeInTheDocument();
    });

    it('uses the car currency for the symbol, the summary and the select', () => {
        render(<PricingSection data={{ ...data, currencyType: 'EUR' }} errors={{}} onUpdate={vi.fn()} />);

        expect(screen.getByText('€120.50')).toBeInTheDocument();
        expect(screen.getAllByText('€', { selector: 'span[aria-hidden="true"]' })).toHaveLength(3);
        expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Select currency' })).toHaveTextContent('EUR');
    });

    it('keeps a TRY car in TRY', () => {
        render(<PricingSection data={{ ...data, currencyType: 'TRY' }} errors={{}} onUpdate={vi.fn()} />);

        expect(screen.getByRole('combobox', { name: 'Select currency' })).toHaveTextContent('TRY');
    });
});
