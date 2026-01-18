'use client';

import { MapPin, Navigation } from 'lucide-react';
import { ComingSoonBanner } from '@/components/ui/coming-soon-banner';
import { Card, CardContent } from '@/components/ui/card';

export default function LocationsPage() {
    return (
        <div className="container py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Our Locations</h1>
                    <p className="text-muted-foreground">
                        Find CarRental pickup and drop-off locations near you
                    </p>
                </div>

                <ComingSoonBanner
                    title="Locations Page Coming Soon"
                    description="We're working on an interactive map with all our pickup and drop-off locations. Check back soon!"
                />

                <div className="grid gap-4 mt-8 md:grid-cols-2">
                    <Card className="opacity-60">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Navigation className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Istanbul Airport (IST)</p>
                                <p className="text-sm text-muted-foreground">Coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="opacity-60">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Navigation className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Sabiha Gökçen Airport (SAW)</p>
                                <p className="text-sm text-muted-foreground">Coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="opacity-60">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Navigation className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Ankara Esenboğa Airport (ESB)</p>
                                <p className="text-sm text-muted-foreground">Coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="opacity-60">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Navigation className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Izmir Adnan Menderes Airport (ADB)</p>
                                <p className="text-sm text-muted-foreground">Coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
