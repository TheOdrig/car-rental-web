import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy policy for the Car Rental portfolio demo.',
};

export default function PrivacyPage() {
    return (
        <div className="container max-w-3xl py-12">
            <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
            <p className="mb-8 text-muted-foreground">
                Car Rental is a portfolio demo project. This page explains what the demo stores.
            </p>

            <div className="space-y-6 leading-relaxed">
                <section>
                    <h2 className="mb-2 text-xl font-semibold">What is stored</h2>
                    <p>
                        The demo stores the details you enter: your name, email address, optional phone number,
                        profile picture, rental requests and damage reports. Passwords are stored as hashes.
                    </p>
                </section>
                <section>
                    <h2 className="mb-2 text-xl font-semibold">Cookies</h2>
                    <p>
                        Sign-in uses strictly necessary cookies that keep you logged in. A preference cookie or
                        local storage entry remembers your theme and currency. No advertising or tracking cookies
                        are set.
                    </p>
                </section>
                <section>
                    <h2 className="mb-2 text-xl font-semibold">Payments</h2>
                    <p>
                        Payments use Stripe in test mode. Card details go to Stripe directly and are never stored
                        by this application.
                    </p>
                </section>
                <section>
                    <h2 className="mb-2 text-xl font-semibold">Sharing and deletion</h2>
                    <p>
                        Data is not sold or shared with third parties beyond the services needed to run the demo.
                        Demo data may be removed at any time. Use a throwaway email address and no real personal
                        data.
                    </p>
                </section>
            </div>

            <p className="mt-10 text-sm text-muted-foreground">
                See also the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>.
            </p>
        </div>
    );
}
