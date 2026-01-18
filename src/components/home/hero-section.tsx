'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SearchWidget } from './search-widget';

interface HeroSectionProps {
    className?: string;
    backgroundImage?: string;
}

export function HeroSection({
    className,
    backgroundImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=100&w=1920'
}: HeroSectionProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <section
            className={cn(
                'relative min-h-[600px] flex items-center justify-center overflow-hidden',
                className
            )}
        >
            <div className="absolute inset-0 z-0">
                {!imageError ? (
                    <Image
                        src={backgroundImage}
                        alt="Luxury car on scenic road"
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    Find Your Perfect Ride
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow">
                    Discover premium vehicles at unbeatable prices.
                    Book your dream car in just a few clicks.
                </p>

                <SearchWidget className="max-w-4xl mx-auto" />
            </div>
        </section>
    );
}
