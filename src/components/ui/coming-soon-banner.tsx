'use client';

import { Construction } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ComingSoonBannerProps {
    title?: string;
    description?: string;
}

export function ComingSoonBanner({
    title = 'Coming Soon',
    description = 'This feature is currently under development and will be available in a future update.',
}: ComingSoonBannerProps) {
    return (
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <Construction className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-600 dark:text-amber-400 font-semibold">
                {title}
            </AlertTitle>
            <AlertDescription className="text-amber-700/80 dark:text-amber-300/80">
                {description}
            </AlertDescription>
        </Alert>
    );
}
