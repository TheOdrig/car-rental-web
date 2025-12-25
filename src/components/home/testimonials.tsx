'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Testimonial {
    id: string;
    name: string;
    location: string;
    avatar?: string;
    rating: number;
    text: string;
    date?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        location: 'New York, USA',
        rating: 5,
        text: 'Absolutely amazing service! The car was spotless and the pickup process was seamless. Will definitely use again for my next trip.',
        date: 'December 2024',
    },
    {
        id: '2',
        name: 'Michael Chen',
        location: 'Toronto, Canada',
        rating: 5,
        text: 'Best car rental experience ever. Great prices, excellent customer service, and the SUV we rented was perfect for our family road trip.',
        date: 'November 2024',
    },
    {
        id: '3',
        name: 'Emma Williams',
        location: 'London, UK',
        rating: 4,
        text: 'Very smooth booking process and competitive rates. The staff was helpful and friendly. Highly recommend for anyone visiting the city.',
        date: 'October 2024',
    },
];

interface TestimonialsProps {
    testimonials?: Testimonial[];
    className?: string;
}

export function Testimonials({
    testimonials = DEFAULT_TESTIMONIALS,
    className,
}: TestimonialsProps) {
    if (testimonials.length === 0) return null;

    return (
        <section className={cn('py-12 bg-muted/30', className)}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        What Our Customers Say
                    </h2>
                    <p className="text-muted-foreground">
                        Trusted by <span className="font-semibold text-foreground">10,000+</span> travelers worldwide
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface TestimonialCardProps {
    testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
    return (
        <Card className="h-full transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/20 mb-4" />

                <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                'h-4 w-4',
                                i < testimonial.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                            )}
                        />
                    ))}
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                    {testimonial.avatar ? (
                        <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-lg">
                                {testimonial.name.charAt(0)}
                            </span>
                        </div>
                    )}

                    <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {testimonial.location}
                        </p>
                    </div>
                </div>

                {testimonial.date && (
                    <p className="text-xs text-muted-foreground mt-4">
                        {testimonial.date}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export { type Testimonial };
