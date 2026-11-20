'use client';

import { FlaskConical } from 'lucide-react';

export function DemoNotice() {
    return (
        <div
            className="flex items-start gap-3 rounded-lg border border-warning-subtle-foreground/30 bg-warning-subtle p-4 text-sm text-warning-subtle-foreground"
            data-testid="payment-demo-notice"
        >
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
                <span className="font-semibold">Demo: Stripe test mode, use card 4242 4242 4242 4242</span> with any
                future expiry date, any 3-digit CVC and any postal code. No real money is charged.
            </p>
        </div>
    );
}
