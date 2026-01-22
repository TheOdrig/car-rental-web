'use client';

import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DetailPageErrorProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    backUrl?: string;
    backLabel?: string;
    className?: string;
}

export function DetailPageError({
    title = 'Failed to Load Data',
    message,
    onRetry,
    backUrl,
    backLabel = 'Back to List',
    className,
}: DetailPageErrorProps) {
    const router = useRouter();

    const handleBack = () => {
        if (backUrl) {
            router.push(backUrl);
        } else {
            router.back();
        }
    };

    return (
        <div className={cn('flex flex-col items-center justify-center min-h-[400px] space-y-4', className)}>
            <div className="rounded-full bg-rose-100 dark:bg-rose-900/30 p-4">
                <AlertCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md text-center">{message}</p>
            <div className="flex gap-3 mt-4">
                {onRetry && (
                    <Button onClick={onRetry} variant="default">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                )}
                <Button onClick={handleBack} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {backLabel}
                </Button>
            </div>
        </div>
    );
}
