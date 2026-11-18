'use client';

import { FlaskConical } from 'lucide-react';

export function DemoNotice() {
    return (
        <div
            className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
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
