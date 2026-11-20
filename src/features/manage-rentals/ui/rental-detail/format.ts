import { formatCurrencyWithDecimals } from '@/shared/lib';

export function formatPrice(price: number, currency: string): string {
    return formatCurrencyWithDecimals(price, currency || 'USD');
}
