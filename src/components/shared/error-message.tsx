import { AlertCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorVariant = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
    title?: string;
    message: string;
    variant?: ErrorVariant;
    className?: string;
    onRetry?: () => void;
}

const variantConfig = {
    error: {
        icon: XCircle,
        containerClass: 'bg-red-50 border-red-200 text-red-800',
        iconClass: 'text-red-500',
    },
    warning: {
        icon: AlertTriangle,
        containerClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconClass: 'text-yellow-500',
    },
    info: {
        icon: Info,
        containerClass: 'bg-blue-50 border-blue-200 text-blue-800',
        iconClass: 'text-blue-500',
    },
};

export function ErrorMessage({
    title,
    message,
    variant = 'error',
    className,
    onRetry,
}: ErrorMessageProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-lg border p-4',
                config.containerClass,
                className
            )}
            role="alert"
        >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClass)} />
            <div className="flex-1 min-w-0">
                {title && <p className="font-semibold">{title}</p>}
                <p className={cn('text-sm', title && 'mt-1')}>{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 text-sm font-medium underline hover:no-underline"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}

interface InlineErrorProps {
    message: string;
    className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
    return (
        <p className={cn('flex items-center gap-1 text-sm text-destructive', className)}>
            <AlertCircle className="h-4 w-4" />
            {message}
        </p>
    );
}
