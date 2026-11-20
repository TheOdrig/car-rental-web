import type { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, Shield } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export const metadata: Metadata = { title: 'Payment Methods' };

export default function PaymentMethodsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" aria-hidden="true" />
                        Payment Methods
                    </CardTitle>
                    <CardDescription>How your card is handled</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p data-testid="payment-methods-explainer">
                        Cards are saved securely by Stripe when you pay for a rental. There is nothing to add or
                        manage here: your card details never reach our servers and are not listed on this page.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        To pay for a confirmed rental, open it from your rentals and choose Pay now. If a payment
                        hold is cancelled you can start a new one with Pay again.
                    </p>
                    <Button asChild>
                        <Link href="/rentals">Go to my rentals</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center gap-3 py-4">
                    <Shield className="h-5 w-5 text-success-subtle-foreground" aria-hidden="true" />
                    <div className="text-sm">
                        <p className="font-medium">Secure Payments</p>
                        <p className="text-muted-foreground">
                            Payments are processed by Stripe. This site runs in test mode.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
