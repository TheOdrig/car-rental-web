import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PayRental } from '@/features/pay-rental';
import { getServerEnv } from '@/shared/server';

export const metadata: Metadata = {
    title: 'Pay for Rental',
    description: 'Pay for your confirmed rental with Stripe in test mode.',
};

interface PayPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        payment_intent?: string;
        payment_intent_client_secret?: string;
        redirect_status?: string;
    }>;
}

export default async function PayRentalPage({ params, searchParams }: PayPageProps) {
    const { id } = await params;
    const {
        payment_intent: paymentIntent,
        payment_intent_client_secret: clientSecret,
        redirect_status: redirectStatus,
    } = await searchParams;

    if (!/^\d+$/.test(id)) {
        notFound();
    }

    return (
        <div className="container py-8">
            <PayRental
                rentalId={Number(id)}
                fallbackPublishableKey={getServerEnv().STRIPE_PUBLISHABLE_KEY}
                returnedPaymentIntent={paymentIntent}
                returnedClientSecret={clientSecret}
                redirectStatus={redirectStatus}
            />
        </div>
    );
}
