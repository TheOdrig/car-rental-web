import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/shared/lib';
import { PageHeader } from '@/shared/ui/page-header';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = pageMetadata({
    title: 'Terms of Service',
    description: 'Terms of service for the Car Rental portfolio demo.',
    path: ROUTES.terms,
});

export default function TermsPage() {
    return (
        <div className="container max-w-3xl py-12">
            <PageHeader
                area="public"
                className="mb-8"
                title="Terms of Service"
                description="Car Rental is a portfolio demo project, not a real rental company."
            />

            <div className="space-y-6 leading-relaxed">
                <section>
                    <h2 className="mb-2 text-xl font-semibold">What this is</h2>
                    <p>
                        This site demonstrates a car rental workflow: browsing a catalogue, checking availability,
                        requesting a rental, administrator approval and a test-mode payment. No vehicle is ever
                        handed over and no real contract is formed.
                    </p>
                </section>
                <section>
                    <h2 className="mb-2 text-xl font-semibold">Payments</h2>
                    <p>
                        Payments run in Stripe test mode. Use only Stripe test card numbers. Real card details
                        must never be entered, and no money is moved.
                    </p>
                </section>
                <section>
                    <h2 className="mb-2 text-xl font-semibold">Accounts and content</h2>
                    <p>
                        You may create a demo account to try the product. Demo data can be reset or removed at any
                        time without notice. Do not upload content that you do not have the right to share.
                    </p>
                </section>
                <section>
                    <h2 className="mb-2 text-xl font-semibold">No warranty</h2>
                    <p>
                        The service is provided as is, without any guarantee of availability, accuracy or fitness
                        for a particular purpose.
                    </p>
                </section>
            </div>

            <p className="mt-10 text-sm text-muted-foreground">
                See also the <Link href={ROUTES.privacy} className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
        </div>
    );
}
