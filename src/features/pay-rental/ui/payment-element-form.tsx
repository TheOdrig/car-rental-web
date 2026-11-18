'use client';

import { useState, type FormEvent } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/shared/ui/button';

interface PaymentElementFormProps {
    returnUrl: string;
    amountLabel: string;
    onConfirmed: () => void;
}

const FALLBACK_REASON = 'The payment could not be completed.';

export function PaymentElementForm({ returnUrl, amountLabel, onConfirmed }: PaymentElementFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [inlineError, setInlineError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!stripe || !elements || submitting) return;

        setSubmitting(true);
        setInlineError(null);

        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: { return_url: returnUrl },
                redirect: 'if_required',
            });

            if (result.error) {
                setInlineError(result.error.message ?? FALLBACK_REASON);
                return;
            }

            onConfirmed();
        } catch {
            setInlineError(FALLBACK_REASON);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Payment form">
            <PaymentElement />
            {inlineError && (
                <p className="text-sm text-destructive" role="alert">
                    {inlineError}
                </p>
            )}
            <Button type="submit" className="w-full" disabled={!stripe || !elements || submitting}>
                {submitting ? 'Processing...' : `Pay ${amountLabel}`}
            </Button>
        </form>
    );
}
