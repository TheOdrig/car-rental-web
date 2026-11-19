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
import { clientGet } from '@/shared/api';
import { formatNumber } from '@/shared/lib';
import {
    type CurrencyCode,
    type ExchangeRatesResponse,
    CURRENCIES,
    DEFAULT_CURRENCY,
    CURRENCY_STORAGE_KEY,
    RATES_CACHE_DURATION,
    getCurrencyByCode,
} from '@/entities/currency';

interface CurrencyContextValue {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    rates: Record<CurrencyCode, number> | null;
    isLoading: boolean;
    convert: (amount: number, from?: CurrencyCode) => number;
    format: (amount: number, from?: CurrencyCode) => string;
    formatSource: (amount: number, from?: CurrencyCode) => string;
    isConverted: (from?: CurrencyCode) => boolean;
    refreshRates: () => Promise<void>;
}

function formatInCurrency(amount: number, code: CurrencyCode): string {
    const info = getCurrencyByCode(code);
    if (code === 'JPY') {
        return `${info.symbol}${formatNumber(Math.round(amount))}`;
    }
    return `${info.symbol}${formatNumber(amount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

interface CurrencyProviderProps {
    children: ReactNode;
    initialRates?: Record<CurrencyCode, number> | null;
    initialIsLoading?: boolean;
}

export function CurrencyProvider({
    children,
    initialRates = null,
    initialIsLoading = true
}: CurrencyProviderProps) {
    const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
    const [rates, setRates] = useState<Record<CurrencyCode, number> | null>(initialRates);
    const [isLoading, setIsLoading] = useState(initialIsLoading);

    const fetchRates = useCallback(async (force = false) => {
        if (!force && typeof window !== 'undefined') {
            const cached = localStorage.getItem('exchange_rates_cache');
            const cacheTime = localStorage.getItem('exchange_rates_cache_time');
            if (cached && cacheTime) {
                const age = Date.now() - parseInt(cacheTime, 10);
                if (age < 5 * 60 * 1000) {
                    try {
                        const data = JSON.parse(cached);
                        setRates(data.rates);
                        setIsLoading(false);
                        return;
                    } catch {
                    }
                }
            }
        }

        try {
            const data = await clientGet<ExchangeRatesResponse>('/api/exchange-rates');
            setRates(data.rates);
            if (typeof window !== 'undefined') {
                localStorage.setItem('exchange_rates_cache', JSON.stringify(data));
                localStorage.setItem('exchange_rates_cache_time', Date.now().toString());
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

    const isConverted = useCallback(
        (from: CurrencyCode = 'USD'): boolean => Boolean(rates) && currency !== from,
        [rates, currency]
    );

    const formatSource = useCallback(
        (amount: number, from: CurrencyCode = 'USD'): string => formatInCurrency(amount, from),
        []
    );

    const format = useCallback(
        (amount: number, from: CurrencyCode = 'USD'): string => {
            if (!rates || currency === from) {
                return formatInCurrency(amount, from);
            }
            return `≈ ${formatInCurrency(convert(amount, from), currency)}`;
        },
        [rates, convert, currency]
    );

    const refreshRates = useCallback(async () => {
        setIsLoading(true);
        await fetchRates(true);
    }, [fetchRates]);

    useEffect(() => {
        const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (saved && CURRENCIES.some(c => c.code === saved)) {
            queueMicrotask(() => setCurrencyState(saved as CurrencyCode));
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => void fetchRates(), 0);
        return () => clearTimeout(timer);
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
            formatSource,
            isConverted,
            refreshRates,
        }),
        [currency, setCurrency, rates, isLoading, convert, format, formatSource, isConverted, refreshRates]
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