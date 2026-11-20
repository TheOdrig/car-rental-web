import { formatCurrencyWithDecimals } from '@/shared/lib';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';

export function formatPrice(price: number, currency: string): string {
    return formatCurrencyWithDecimals(price, currency || DEFAULT_CURRENCY);
}
