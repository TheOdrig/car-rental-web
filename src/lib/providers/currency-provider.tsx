'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import {
    type CurrencyCode,
    type ExchangeRatesResponse,
    CURRENCIES,
    DEFAULT_CURRENCY,
    CURRENCY_STORAGE_KEY,
    RATES_CACHE_DURATION,
    getCurrencyByCode,
} from '@/types';

interface CurrencyContextValue {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    rates: Record<CurrencyCode, number> | null;
    isLoading: boolean;
    convert: (amount: number, from?: CurrencyCode) => number;
    format: (amount: number, from?: CurrencyCode) => string;
    refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

interface CurrencyProviderProps {
    children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
    const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
    const [rates, setRates] = useState<Record<CurrencyCode, number> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRates = useCallback(async () => {
        try {
            const response = await fetch('/api/exchange-rates', {
                cache: 'no-store',
            });
            if (response.ok) {
                const data: ExchangeRatesResponse = await response.json();
                setRates(data.rates);
            }
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setCurrency = useCallback((newCurrency: CurrencyCode) => {
        setCurrencyState(newCurrency);
        if (typeof window !== 'undefined') {
            localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
        }
    }, []);

    const convert = useCallback(
        (amount: number, from: CurrencyCode = 'USD'): number => {
            if (!rates) return amount;
            if (currency === from) return amount;

            const fromRate = rates[from] || 1;
            const toRate = rates[currency] || 1;

            const amountInUsd = from === 'USD' ? amount : amount / fromRate;
            return Math.round(amountInUsd * toRate * 100) / 100;
        },
        [rates, currency]
    );

    const format = useCallback(
        (amount: number, from: CurrencyCode = 'USD'): string => {
            const converted = convert(amount, from);
            const currencyInfo = getCurrencyByCode(currency);

            if (currency === 'JPY') {
                return `${currencyInfo.symbol}${Math.round(converted).toLocaleString()}`;
            }

            return `${currencyInfo.symbol}${converted.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        },
        [convert, currency]
    );

    const refreshRates = useCallback(async () => {
        setIsLoading(true);
        await fetchRates();
    }, [fetchRates]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
            if (saved && CURRENCIES.some(c => c.code === saved)) {
                setCurrencyState(saved as CurrencyCode);
            }
        }
    }, []);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    useEffect(() => {
        const interval = setInterval(fetchRates, RATES_CACHE_DURATION);
        return () => clearInterval(interval);
    }, [fetchRates]);

    const value = useMemo<CurrencyContextValue>(
        () => ({
            currency,
            setCurrency,
            rates,
            isLoading,
            convert,
            format,
            refreshRates,
        }),
        [currency, setCurrency, rates, isLoading, convert, format, refreshRates]
    );

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency(): CurrencyContextValue {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
