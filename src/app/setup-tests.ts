import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8082';
Object.defineProperty(window, 'location', {
    writable: true,
    value: {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
        port: '3000',
        pathname: '/',
        search: '',
        hash: '',
    },
});
const mockRates = {
    rates: {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        TRY: 27.0,
    },
    timestamp: Date.now(),
};
localStorage.setItem('exchange_rates_cache', JSON.stringify(mockRates));
localStorage.setItem('exchange_rates_cache_time', Date.now().toString());
localStorage.setItem('car-rental-currency', 'USD');
global.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('/api/exchange-rates')) {
        return Promise.resolve({
            ok: true,
            json: async () => ({
                rates: {
                    USD: 1,
                    EUR: 0.85,
                    GBP: 0.73,
                    JPY: 110.0,
                    TRY: 27.0,
                },
                timestamp: Date.now(),
            }),
        } as Response);
    }
    return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
    } as Response);
}) as typeof fetch;
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
}));
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
    unstable_cache: vi.fn((fn) => fn),
}));
import type { ImageProps } from 'next/image';

vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: ImageProps) => {
        const { fill, src, alt, ...rest } = props;
        return React.createElement('img', {
            src: typeof src === 'string' ? src : '',
            alt: alt || '',
            ...rest,
            'data-fill': fill?.toString()
        });
    },
}));
vi.mock('next/font/google', () => ({
    Inter: () => ({ className: 'inter' }),
    Roboto: () => ({ className: 'roboto' }),
}));
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
});
class MockResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
});
class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;
    constructor(type: string, props: PointerEventInit = {}) {
        super(type, props);
        this.button = props.button ?? 0;
        this.ctrlKey = props.ctrlKey ?? false;
        this.pointerType = props.pointerType ?? 'mouse';
    }
}
window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;
if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
}
if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
}
if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
}