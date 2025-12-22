import { FileQuestion, Search, ShoppingCart, Users, Car, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

type EmptyStateType = 'default' | 'search' | 'cart' | 'users' | 'cars' | 'rentals';

interface EmptyStateProps {
    type?: EmptyStateType;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
    children?: React.ReactNode;
}

const iconMap = {
    default: FileQuestion,
    search: Search,
    cart: ShoppingCart,
    users: Users,
    cars: Car,
    rentals: Calendar,
};

export function EmptyState({
    type = 'default',
    title,
    description,
    action,
    className,
    children,
}: EmptyStateProps) {
    const Icon = iconMap[type];

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
            )}
            {action && (
                <div className="mt-6">
                    {action.href ? (
                        <Button asChild>
                            <Link href={action.href}>{action.label}</Link>
                        </Button>
                    ) : (
                        <Button onClick={action.onClick}>{action.label}</Button>
                    )}
                </div>
            )}
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}
