import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CurrencyProvider, useCurrency } from '@/entities/currency';

const RATES = { USD: 1, EUR: 0.5, GBP: 0.8, JPY: 100, TRY: 30 };

function wrapperWith(props: { initialRates?: typeof RATES | null; initialIsLoading?: boolean }) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <CurrencyProvider {...props}>{children}</CurrencyProvider>;
    };
}

describe('CurrencyProvider formatting', () => {
    beforeEach(() => {
        localStorage.removeItem('exchange_rates_cache');
        localStorage.removeItem('exchange_rates_cache_time');
        localStorage.setItem('preferred_currency', 'EUR');
        vi.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
    });

    afterEach(() => {
        localStorage.removeItem('preferred_currency');
        vi.restoreAllMocks();
    });

    it('shows the source currency when no rates are available', async () => {
        const { result } = renderHook(() => useCurrency(), {
            wrapper: wrapperWith({ initialRates: null, initialIsLoading: false }),
        });
        await waitFor(() => expect(result.current.currency).toBe('EUR'));

        expect(result.current.rates).toBeNull();
        expect(result.current.format(1500, 'TRY')).toBe('₺1,500.00');
        expect(result.current.format(1500, 'TRY')).not.toContain('€');
        expect(result.current.isConverted('TRY')).toBe(false);
    });

    it('marks converted amounts as approximate and uses the selected symbol', async () => {
        const { result } = renderHook(() => useCurrency(), {
            wrapper: wrapperWith({ initialRates: RATES, initialIsLoading: false }),
        });
        await waitFor(() => expect(result.current.currency).toBe('EUR'));

        expect(result.current.isConverted('TRY')).toBe(true);
        expect(result.current.format(300, 'TRY')).toBe('≈ €5.00');
    });

    it('does not mark amounts already in the selected currency', async () => {
        const { result } = renderHook(() => useCurrency(), {
            wrapper: wrapperWith({ initialRates: RATES, initialIsLoading: false }),
        });
        await waitFor(() => expect(result.current.currency).toBe('EUR'));

        expect(result.current.format(12, 'EUR')).toBe('€12.00');
        expect(result.current.isConverted('EUR')).toBe(false);
    });

    it('formatSource always renders the source currency', async () => {
        const { result } = renderHook(() => useCurrency(), {
            wrapper: wrapperWith({ initialRates: RATES, initialIsLoading: false }),
        });
        await waitFor(() => expect(result.current.currency).toBe('EUR'));

        expect(result.current.formatSource(4500, 'TRY')).toBe('₺4,500.00');
        expect(result.current.formatSource(1500, 'JPY')).toBe('¥1,500');
    });

    it('switches to converted output when the currency changes', async () => {
        localStorage.setItem('preferred_currency', 'USD');
        const { result } = renderHook(() => useCurrency(), {
            wrapper: wrapperWith({ initialRates: RATES, initialIsLoading: false }),
        });

        act(() => result.current.setCurrency('JPY'));

        expect(result.current.format(1, 'USD')).toBe('≈ ¥100');
    });
});
