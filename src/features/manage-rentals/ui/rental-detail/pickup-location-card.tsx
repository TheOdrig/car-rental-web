'use client';

import { ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const DIRECTIONS_URL = 'https://maps.google.com/?q=San+Francisco+Airport';

export function PickupLocationCard() {
    const handleGetDirections = () => {
        window.open(DIRECTIONS_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                    Pickup Location
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 h-48 overflow-hidden rounded-lg bg-muted">
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <MapPin className="mr-2 h-6 w-6" aria-hidden="true" />
                        <span>San Francisco International Airport</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-medium">SFO Airport Terminal 1</p>
                        <p className="text-sm text-muted-foreground">780 S Airport Blvd, San Francisco, CA 94128</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGetDirections}
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Get Directions
                        <ExternalLink className="ml-2 h-3 w-3" aria-hidden="true" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
