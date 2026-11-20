import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConvertedPricesNote, CurrencyProvider, describeConversionBasis } from '@/entities/currency';

const RATES = { USD: 1, EUR: 0.5, GBP: 0.8, JPY: 100, TRY: 30 };

describe('ConvertedPricesNote', () => {
    beforeEach(() => {
        localStorage.removeItem('exchange_rates_cache');
        localStorage.removeItem('exchange_rates_cache_time');
        vi.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
    });

    afterEach(() => {
        localStorage.removeItem('preferred_currency');
        vi.restoreAllMocks();
    });

    it('names the source currency when the display currency differs', async () => {
        localStorage.setItem('preferred_currency', 'TRY');
        render(
            <CurrencyProvider initialRates={RATES} initialIsLoading={false}>
                <ConvertedPricesNote from="USD" />
            </CurrencyProvider>
        );

        expect(await screen.findByTestId('converted-prices-note')).toHaveTextContent("Prices converted from USD at today's rate.");
    });

    it('lists every converted source currency once', async () => {
        localStorage.setItem('preferred_currency', 'TRY');
        render(
            <CurrencyProvider initialRates={RATES} initialIsLoading={false}>
                <ConvertedPricesNote from={['USD', 'EUR', 'USD', 'TRY']} />
            </CurrencyProvider>
        );

        expect(await screen.findByTestId('converted-prices-note')).toHaveTextContent('converted from USD and EUR at');
    });

    it('stays hidden when the display currency is the car currency', async () => {
        localStorage.setItem('preferred_currency', 'USD');
        render(
            <CurrencyProvider initialRates={RATES} initialIsLoading={false}>
                <ConvertedPricesNote from="USD" />
            </CurrencyProvider>
        );

        await waitFor(() => expect(screen.queryByTestId('converted-prices-note')).not.toBeInTheDocument());
    });

    it('stays hidden when no rates are available', () => {
        localStorage.setItem('preferred_currency', 'TRY');
        render(
            <CurrencyProvider initialRates={null} initialIsLoading={false}>
                <ConvertedPricesNote from="USD" />
            </CurrencyProvider>
        );

        expect(screen.queryByTestId('converted-prices-note')).not.toBeInTheDocument();
    });

    it('describes the rate basis honestly', () => {
        expect(describeConversionBasis('LIVE')).toBe("at today's rate");
        expect(describeConversionBasis('CACHED')).toBe('at a recent rate');
        expect(describeConversionBasis('FALLBACK')).toBe('at a fixed reference rate');
    });
});
