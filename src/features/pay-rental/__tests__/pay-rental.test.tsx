import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiError } from '@/shared/api/error';

const clientGet = vi.fn();
const clientPost = vi.fn();
const confirmPayment = vi.fn();
const loadStripe = vi.fn();
const routerReplace = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/shared/api')>();
    return {
        ...actual,
        clientGet: (...args: unknown[]) => clientGet(...args),
        clientPost: (...args: unknown[]) => clientPost(...args),
    };
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: routerReplace, push: vi.fn() }),
}));

vi.mock('@stripe/stripe-js', () => ({
    loadStripe: (...args: unknown[]) => loadStripe(...args),
}));

vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children, options }: { children: ReactNode; options: { clientSecret: string } }) => (
        <div data-testid="stripe-elements" data-secret={options.clientSecret}>
            {children}
        </div>
    ),
    PaymentElement: () => <div data-testid="payment-element" />,
    useStripe: () => ({ confirmPayment }),
    useElements: () => ({ id: 'elements' }),
}));

import { PayRental } from '../ui/pay-rental';

function intent(overrides: Record<string, unknown> = {}) {
    return {
        paymentId: 1,
        rentalId: 7,
        paymentIntentId: 'pi_1',
        clientSecret: 'pi_1_secret',
        publishableKey: 'pk_test_api',
        status: 'PENDING',
        amount: 250,
        currency: 'USD',
        ...overrides,
    };
}

function payment(status: string, overrides: Record<string, unknown> = {}) {
    return {
        paymentId: 1,
        rentalId: 7,
        status,
        amount: 250,
        currency: 'USD',
        refundedAmount: null,
        failureReason: null,
        ...overrides,
    };
}

function renderPay(props: Partial<React.ComponentProps<typeof PayRental>> = {}) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <PayRental rentalId={7} {...props} />
        </QueryClientProvider>
    );
}

async function submitPayment() {
    fireEvent.submit(await screen.findByRole('form', { name: 'Payment form' }));
}

describe('PayRental', () => {
    beforeEach(() => {
        clientGet.mockReset();
        clientPost.mockReset();
        confirmPayment.mockReset();
        loadStripe.mockReset();
        routerReplace.mockReset();
        loadStripe.mockResolvedValue({});
    });

    it('shows the loading state while the intent is created', () => {
        clientPost.mockReturnValue(new Promise(() => {}));

        renderPay();

        expect(screen.getByTestId('payment-state-loading')).toBeInTheDocument();
        expect(screen.getByTestId('payment-demo-notice')).toHaveTextContent('4242 4242 4242 4242');
    });

    it('shows the payment element, the amount and the demo note when ready', async () => {
        clientPost.mockResolvedValue(intent());

        renderPay();

        expect(await screen.findByTestId('payment-state-ready')).toBeInTheDocument();
        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
        expect(screen.getByTestId('stripe-elements')).toHaveAttribute('data-secret', 'pi_1_secret');
        expect(screen.getByTestId('payment-demo-notice')).toHaveTextContent(/Demo: Stripe test mode/);
        expect(clientPost).toHaveBeenCalledWith('/api/rentals/7/payment-intent');
        expect(screen.getByRole('button', { name: /Pay/ })).toHaveTextContent('250');
    });

    it('prefers the key from the API', async () => {
        clientPost.mockResolvedValue(intent({ publishableKey: 'pk_test_prefers' }));

        renderPay({ fallbackPublishableKey: 'pk_test_env' });

        await screen.findByTestId('payment-state-ready');
        expect(loadStripe).toHaveBeenCalledWith('pk_test_prefers');
    });

    it('falls back to the server key when the API sends none', async () => {
        clientPost.mockResolvedValue(intent({ publishableKey: null }));

        renderPay({ fallbackPublishableKey: 'pk_test_env' });

        await screen.findByTestId('payment-state-ready');
        expect(loadStripe).toHaveBeenCalledWith('pk_test_env');
    });

    it('refuses to render a form without any key', async () => {
        clientPost.mockResolvedValue(intent({ publishableKey: null }));

        renderPay();

        expect(await screen.findByText('Payments are not configured')).toBeInTheDocument();
        expect(screen.queryByTestId('payment-element')).not.toBeInTheDocument();
        expect(loadStripe).not.toHaveBeenCalled();
    });

    it('refuses a live key from the fallback', async () => {
        clientPost.mockResolvedValue(intent({ publishableKey: null }));

        renderPay({ fallbackPublishableKey: 'pk_live_nope' });

        expect(await screen.findByText('Payments are not configured')).toBeInTheDocument();
        expect(loadStripe).not.toHaveBeenCalled();
    });

    it.each([
        [400, 'not-confirmed', 'Rental not confirmed yet'],
        [409, 'settled', 'Already paid'],
        [503, 'unavailable', 'Payment unavailable'],
    ])('maps a %i response to the %s state', async (status, kind, title) => {
        clientPost.mockRejectedValue(new ApiError(status, 'nope'));

        renderPay();

        expect(await screen.findByTestId(`payment-state-${kind}`)).toBeInTheDocument();
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View rental' })).toHaveAttribute('href', '/rentals/7');
        expect(screen.queryByTestId('payment-element')).not.toBeInTheDocument();
    });

    it('asks the customer to sign in on a 401', async () => {
        clientPost.mockRejectedValue(new ApiError(401, 'expired'));

        renderPay();

        expect(await screen.findByTestId('payment-state-signin')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
            'href',
            '/login?callbackUrl=%2Frentals%2F7%2Fpay'
        );
    });

    it('shows success straight away when the intent is already authorized', async () => {
        clientPost.mockResolvedValue(intent({ status: 'AUTHORIZED' }));

        renderPay();

        expect(await screen.findByTestId('payment-state-authorized')).toBeInTheDocument();
        expect(screen.queryByTestId('payment-element')).not.toBeInTheDocument();
    });

    it('confirms with Stripe, shows processing, then success once the API reports AUTHORIZED', async () => {
        clientPost.mockResolvedValue(intent());
        confirmPayment.mockResolvedValue({ paymentIntent: { status: 'requires_capture' } });
        let release: (value: unknown) => void = () => {};
        clientGet.mockReturnValue(new Promise((resolve) => (release = resolve)));

        renderPay();
        await submitPayment();

        expect(confirmPayment).toHaveBeenCalledWith(
            expect.objectContaining({
                redirect: 'if_required',
                confirmParams: { return_url: 'http://localhost:3000/rentals/7/pay' },
            })
        );
        expect(await screen.findByTestId('payment-state-processing')).toBeInTheDocument();

        release(payment('AUTHORIZED'));

        expect(await screen.findByTestId('payment-state-authorized')).toBeInTheDocument();
        expect(clientGet).toHaveBeenCalledWith('/api/rentals/7/payment', expect.anything());
    });

    it('shows a card error inline and lets the customer retry on the same intent', async () => {
        clientPost.mockResolvedValue(intent());
        confirmPayment
            .mockResolvedValueOnce({ error: { type: 'card_error', code: 'card_declined', message: 'Your card was declined.' } })
            .mockResolvedValueOnce({ paymentIntent: { status: 'requires_capture' } });
        clientGet.mockResolvedValue(payment('AUTHORIZED'));

        renderPay();
        await submitPayment();

        expect(await screen.findByText('Your card was declined.')).toBeInTheDocument();
        expect(screen.getByTestId('payment-state-ready')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Pay/ })).toBeEnabled();

        await submitPayment();

        expect(await screen.findByTestId('payment-state-authorized')).toBeInTheDocument();
        expect(confirmPayment).toHaveBeenCalledTimes(2);
        expect(clientPost).toHaveBeenCalledTimes(1);
    });

    it('creates the intent only once', async () => {
        clientPost.mockResolvedValue(intent());

        renderPay();
        await screen.findByTestId('payment-state-ready');

        expect(clientPost).toHaveBeenCalledTimes(1);
    });

    it('disables the pay button while the confirmation is in flight', async () => {
        clientPost.mockResolvedValue(intent());
        confirmPayment.mockReturnValue(new Promise(() => {}));

        renderPay();
        await submitPayment();

        expect(await screen.findByRole('button', { name: 'Processing...' })).toBeDisabled();
        expect(confirmPayment).toHaveBeenCalledTimes(1);
    });

    it('shows the off-session charge notice once authorized', async () => {
        clientPost.mockResolvedValue(intent({ status: 'AUTHORIZED' }));

        renderPay();

        expect(await screen.findByText('Payment held; charged at pickup')).toBeInTheDocument();
        expect(screen.getByTestId('off-session-notice')).toHaveTextContent(/late-return penalties or damage/);
    });

    it('offers to pay again when the payment was cancelled', async () => {
        const user = userEvent.setup();
        clientPost.mockResolvedValueOnce(intent({ status: 'CANCELLED' })).mockResolvedValue(intent());

        renderPay();
        expect(await screen.findByTestId('payment-state-cancelled')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Pay again' }));

        expect(await screen.findByTestId('payment-state-ready')).toBeInTheDocument();
        expect(clientPost).toHaveBeenCalledTimes(2);
    });

    it.each([
        [403, 'forbidden', 'Not your rental'],
        [404, 'not-found', 'Rental not found'],
    ])('maps a %i response to the %s state and links to My rentals', async (status, kind, title) => {
        clientPost.mockRejectedValue(new ApiError(status, 'nope'));

        renderPay();

        expect(await screen.findByTestId('payment-state-' + kind)).toBeInTheDocument();
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'My rentals' })).toHaveAttribute('href', '/rentals');
    });

    it('sends a forbidden customer back to My rentals', async () => {
        clientPost.mockRejectedValue(new ApiError(403, 'no'));

        renderPay();

        expect(await screen.findByRole('link', { name: 'My rentals' })).toHaveAttribute('href', '/rentals');
    });

    it('reads the client secret fallback from the return URL', async () => {
        clientGet.mockResolvedValue(payment('AUTHORIZED'));

        renderPay({ returnedClientSecret: 'pi_1_secret_x', redirectStatus: 'succeeded' });

        expect(await screen.findByTestId('payment-state-authorized')).toBeInTheDocument();
        expect(clientPost).not.toHaveBeenCalled();
    });

    it('removes the client secret from the URL after a 3DS return and keeps the status params', async () => {
        clientGet.mockResolvedValue(payment('AUTHORIZED'));

        renderPay({ returnedPaymentIntent: 'pi_1', returnedClientSecret: 'pi_1_secret_x', redirectStatus: 'succeeded' });

        await waitFor(() =>
            expect(routerReplace).toHaveBeenCalledWith('/rentals/7/pay?payment_intent=pi_1&redirect_status=succeeded', {
                scroll: false,
            })
        );
        expect(routerReplace.mock.calls.flat().join(' ')).not.toContain('secret');
    });

    it('leaves the URL alone when no client secret came back', async () => {
        clientGet.mockResolvedValue(payment('AUTHORIZED'));

        renderPay({ returnedPaymentIntent: 'pi_1', redirectStatus: 'succeeded' });

        expect(await screen.findByTestId('payment-state-authorized')).toBeInTheDocument();
        expect(routerReplace).not.toHaveBeenCalled();
    });

    it('keeps the form and shows an inline message on a validation error', async () => {
        clientPost.mockResolvedValue(intent());
        confirmPayment.mockResolvedValue({ error: { type: 'validation_error', message: 'Your card number is incomplete.' } });

        renderPay();
        await submitPayment();

        expect(await screen.findByText('Your card number is incomplete.')).toBeInTheDocument();
        expect(screen.getByTestId('payment-state-ready')).toBeInTheDocument();
        expect(screen.queryByTestId('payment-state-failed')).not.toBeInTheDocument();
    });

    it('shows the API failure reason when polling reports FAILED', async () => {
        clientPost.mockResolvedValue(intent());
        confirmPayment.mockResolvedValue({ paymentIntent: { status: 'processing' } });
        clientGet.mockResolvedValue(payment('FAILED', { failureReason: 'Insufficient funds' }));

        renderPay();
        await submitPayment();

        expect(await screen.findByTestId('payment-state-failed')).toBeInTheDocument();
        expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
    });

    it('maps a polling error to a blocked state', async () => {
        clientPost.mockResolvedValue(intent());
        confirmPayment.mockResolvedValue({ paymentIntent: { status: 'processing' } });
        clientGet.mockRejectedValue(new ApiError(403, 'Forbidden'));

        renderPay();
        await submitPayment();

        expect(await screen.findByTestId('payment-state-forbidden')).toBeInTheDocument();
    });

    it('resumes after a 3DS redirect by polling without creating a new intent', async () => {
        clientGet.mockResolvedValue(payment('AUTHORIZED'));

        renderPay({ returnedPaymentIntent: 'pi_1', redirectStatus: 'succeeded' });

        expect(await screen.findByTestId('payment-state-authorized')).toBeInTheDocument();
        expect(clientPost).not.toHaveBeenCalled();
    });

    it('shows processing after a redirect while the payment is still pending', async () => {
        clientGet.mockResolvedValue(payment('PENDING'));

        renderPay({ returnedPaymentIntent: 'pi_1', redirectStatus: 'succeeded' });

        expect(await screen.findByTestId('payment-state-processing')).toBeInTheDocument();
        await waitFor(() => expect(clientGet).toHaveBeenCalled());
        expect(screen.getByTestId('payment-state-processing')).toBeInTheDocument();
    });

    it('shows a failure after a failed 3DS redirect and cleans the URL on retry', async () => {
        const user = userEvent.setup();
        clientPost.mockResolvedValue(intent());

        renderPay({ returnedPaymentIntent: 'pi_1', redirectStatus: 'failed' });

        expect(screen.getByTestId('payment-state-failed')).toBeInTheDocument();
        expect(clientPost).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Try again' }));

        expect(routerReplace).toHaveBeenCalledWith('/rentals/7/pay');
        expect(await screen.findByTestId('payment-state-ready')).toBeInTheDocument();
        expect(clientPost).toHaveBeenCalledTimes(1);
    });
});
