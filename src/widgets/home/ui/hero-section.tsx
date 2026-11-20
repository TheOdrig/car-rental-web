import { DynamicImage } from '@/shared/ui/dynamic-image';
import { cn } from '@/shared/lib';
import { SearchWidget } from './search-widget';
import { HERO_IMAGE_URL } from '@/shared/config/constants';

interface HeroSectionProps {
    className?: string;
    backgroundImage?: string;
}

export function HeroSection({ className, backgroundImage = HERO_IMAGE_URL }: HeroSectionProps) {
    return (
        <section className={cn('relative flex min-h-[560px] items-center overflow-hidden bg-black', className)}>
            <div className="absolute inset-0 z-0">
                <DynamicImage
                    src={backgroundImage}
                    alt=""
                    fill
                    sizes="100vw"
                    priority
                    fetchPriority="high"
                    className="object-cover object-[50%_62%]"
                />
                <div className="absolute inset-0 bg-black/65" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-16">
                <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white md:text-5xl">
                    Rent a car by the day
                </h1>
                <p className="mt-4 mb-10 max-w-xl text-base text-white/85 md:text-lg">
                    Browse the fleet and request your dates. An admin reviews each request, and payment opens shortly before pickup.
                    Prices can be shown in several currencies.
                </p>

                <SearchWidget className="max-w-4xl" />
            </div>
        </section>
    );
}
