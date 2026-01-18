'use client';

import { Car, Users, Shield, Award } from 'lucide-react';
import { ComingSoonBanner } from '@/components/ui/coming-soon-banner';
import { Card, CardContent } from '@/components/ui/card';

const VALUES = [
    {
        icon: Car,
        title: 'Quality Fleet',
        description: 'Wide selection of well-maintained vehicles for every need',
    },
    {
        icon: Shield,
        title: 'Safe & Secure',
        description: 'Comprehensive insurance and 24/7 roadside assistance',
    },
    {
        icon: Users,
        title: 'Customer First',
        description: 'Dedicated support team ready to help you anytime',
    },
    {
        icon: Award,
        title: 'Best Value',
        description: 'Competitive prices with no hidden fees',
    },
];

export default function AboutPage() {
    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">About CarRental</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Your trusted partner for premium car rental services across Turkey
                    </p>
                </div>

                <ComingSoonBanner
                    title="Full About Page Coming Soon"
                    description="We're crafting our story. In the meantime, here's a quick overview of what we stand for."
                />

                <div className="grid gap-6 mt-10 md:grid-cols-2">
                    {VALUES.map((value) => {
                        const Icon = value.icon;
                        return (
                            <Card key={value.title}>
                                <CardContent className="flex items-start gap-4 p-6">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{value.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {value.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-12 text-center p-8 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold mb-2">Have Questions?</h2>
                    <p className="text-muted-foreground">
                        Contact us at{' '}
                        <a
                            href="mailto:info@carrental.com"
                            className="text-primary hover:underline"
                        >
                            info@carrental.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
