'use client';

import { useRouter } from 'next/navigation';
import { DamageCard, DamageCardSkeleton } from './damage-card';
import type { DamageReport } from '@/types';

interface DamageListProps {
    damages: DamageReport[];
    isLoading?: boolean;
}

export function DamageList({ damages, isLoading }: DamageListProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <DamageCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (damages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No damage reports found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Any damages associated with your rentals will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {damages.map((damage) => (
                <DamageCard
                    key={damage.id}
                    damage={damage}
                    onClick={() => router.push(`/account/damages/${damage.id}`)}
                />
            ))}
        </div>
    );
}
