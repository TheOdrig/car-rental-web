'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Deal {
    id: string;
    badge: string;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
    backgroundColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
}

const PROMOTIONAL_DEALS: Deal[] = [
    {
        id: 'weekend-special',
        badge: 'Limited Time',
        title: 'Weekend Special',
        description: 'Get 25% off on all SUVs this weekend. Perfect for your next adventure.',
        ctaText: 'Book Now',
        ctaLink: '/cars?bodyType=SUV',
        gradientFrom: 'from-blue-600',
        gradientTo: 'to-purple-700',
    },
    {
        id: 'first-rental',
        badge: 'New Customers',
        title: 'First Rental Discount',
        description: 'Enjoy 15% off your first rental. Use code WELCOME15 at checkout.',
        ctaText: 'Get Started',
        ctaLink: '/register',
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-teal-700',
    },
];

interface PromotionalBannersProps {
    deals?: Deal[];
    className?: string;
}

export function PromotionalBanners({
    deals = PROMOTIONAL_DEALS,
    className,
}: PromotionalBannersProps) {
    if (deals.length === 0) return null;

    return (
        <section className={cn('py-12', className)}>
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold">Exclusive Deals</h2>
                    <p className="text-muted-foreground mt-1">
                        Special offers just for you
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {deals.map((deal) => (
                        <PromotionalCard key={deal.id} deal={deal} />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface PromotionalCardProps {
    deal: Deal;
}

function PromotionalCard({ deal }: PromotionalCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl min-h-[240px] md:min-h-[280px]',
                'group cursor-pointer transition-all duration-300 hover:shadow-xl'
            )}
        >
            {deal.backgroundImage ? (
                <div className="absolute inset-0">
                    <Image
                        src={deal.backgroundImage}
                        alt={deal.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                </div>
            ) : (
                <div
                    className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        deal.gradientFrom || 'from-primary',
                        deal.gradientTo || 'to-primary/80'
                    )}
                />
            )}

            <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between">
                <div>
                    <Badge
                        variant="secondary"
                        className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    >
                        {deal.badge}
                    </Badge>

                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {deal.title}
                    </h3>

                    <p className="text-white/80 text-sm md:text-base max-w-md">
                        {deal.description}
                    </p>
                </div>

                <div className="mt-6">
                    <Link href={deal.ctaLink}>
                        <Button
                            variant="secondary"
                            className="bg-white text-gray-900 hover:bg-white/90 gap-2"
                        >
                            {deal.ctaText}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export { type Deal };
