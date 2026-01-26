'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        id: 'early-bird',
        badge: 'Early Booking',
        title: 'Plan Ahead & Save',
        description: 'Secure your luxury ride at least 30 days in advance and enjoy an automatic 15% discount on your total rental cost.',
        ctaText: 'Browse Cars',
        ctaLink: '/cars',
        backgroundImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    },
    {
        id: 'long-term-rental',
        badge: 'Long-term Stay',
        title: 'Extended Journey',
        description: 'Planning a longer trip? Get 15% off for rentals over 14 days, or a massive 20% off for 30+ days.',
        ctaText: 'Explore Fleet',
        ctaLink: '/cars',
        backgroundImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200',
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
        <section className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}>
            <div className="container mx-auto">
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Exclusive Deals
                        </h2>
                        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                            Curated offers to elevate your next journey.
                        </p>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {deals.map((deal) => (
                        <div
                            key={deal.id}
                            className="group relative w-full h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
                        >
                            {}
                            <div className="absolute inset-0">
                                <Image
                                    src={deal.backgroundImage || ''}
                                    alt={deal.title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:via-black/60 transition-colors duration-500" />
                            </div>

                            {}
                            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
                                <div className="flex justify-start">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                                        {deal.id === 'early-bird' ? (
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                        ) : (
                                            <ArrowRight className="h-3.5 w-3.5 mr-1.5 rotate-[-45deg]" />
                                        )}
                                        {deal.badge}
                                    </span>
                                </div>

                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                                        {deal.title.split('&').map((part, i) => (
                                            <span key={i}>
                                                {part}
                                                {i === 0 && deal.title.includes('&') && <><br />&</>}
                                            </span>
                                        ))}
                                    </h3>
                                    <p className="text-gray-300 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                                        {deal.description.split('15%').map((part, i, arr) => (
                                            <span key={i}>
                                                {part}
                                                {i < arr.length - 1 && <span className="text-white font-semibold">15%</span>}
                                            </span>
                                        ))}
                                    </p>
                                    <Link href={deal.ctaLink}>
                                        <Button
                                            variant="secondary"
                                            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-2xl backdrop-blur-md transition-all duration-300 py-6 px-8 group-hover:border-white/50"
                                        >
                                            {deal.ctaText}
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </section>
    );
}

export { type Deal };

