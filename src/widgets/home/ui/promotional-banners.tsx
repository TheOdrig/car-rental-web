import { cn } from '@/shared/lib';

interface PricingTier {
    range: string;
    discount: string;
}

interface PricingRule {
    id: string;
    title: string;
    description: string;
    tiers: PricingTier[];
}

const PRICING_RULES: PricingRule[] = [
    {
        id: 'early-booking',
        title: 'Early booking discount',
        description: 'Based on how many days before pickup you book.',
        tiers: [
            { range: '7 to 13 days ahead', discount: '5% off' },
            { range: '14 to 29 days ahead', discount: '10% off' },
            { range: '30 or more days ahead', discount: '15% off' },
        ],
    },
    {
        id: 'long-rental',
        title: 'Long rental discount',
        description: 'Based on the length of the rental.',
        tiers: [
            { range: '7 to 13 days', discount: '10% off' },
            { range: '14 to 29 days', discount: '15% off' },
            { range: '30 or more days', discount: '20% off' },
        ],
    },
];

interface PromotionalBannersProps {
    rules?: PricingRule[];
    className?: string;
}

export function PromotionalBanners({ rules = PRICING_RULES, className }: PromotionalBannersProps) {
    if (rules.length === 0) return null;

    return (
        <section className={cn('px-4 py-12', className)}>
            <div className="container mx-auto">
                <h2 className="text-2xl font-bold md:text-3xl">How pricing works</h2>
                <p className="mt-1 max-w-2xl text-muted-foreground">
                    Discounts are applied automatically to the total. Weekend, seasonal and demand adjustments can also apply,
                    and the final price is shown before you send a request.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {rules.map((rule) => (
                        <div key={rule.id} className="rounded-xl border bg-card p-6">
                            <h3 className="font-semibold">{rule.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
                            <dl className="mt-4 divide-y text-sm">
                                {rule.tiers.map((tier) => (
                                    <div key={tier.range} className="flex justify-between py-2">
                                        <dt className="text-muted-foreground">{tier.range}</dt>
                                        <dd className="font-medium tabular-nums">{tier.discount}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export type { PricingRule };
