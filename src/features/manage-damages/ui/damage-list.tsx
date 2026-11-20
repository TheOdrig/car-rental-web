'use client';

import { useState } from 'react';
import { DamageCard, DamageCardSkeleton } from './damage-card';
import { DamageDisputeForm } from './damage-dispute-form';
import type { DamageReport } from '@/entities/damage';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';
import { ROUTES } from '@/shared/config/routes';

interface DamageListProps {
    damages: DamageReport[];
    isLoading?: boolean;
}

export function DamageList({ damages, isLoading }: DamageListProps) {
    const [disputing, setDisputing] = useState<DamageReport | null>(null);

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
            <EmptyState icon={AlertTriangle} title="No damage reports found" description="Any damages associated with your rentals will appear here" />
        );
    }

    return (
        <div className="space-y-4">
            {damages.map((damage) => (
                <DamageCard
                    key={damage.id}
                    damage={damage}
                    href={ROUTES.damages.detail(damage.id)}
                    onDispute={setDisputing}
                />
            ))}
            {disputing && (
                <DamageDisputeForm
                    damageId={disputing.id}
                    open
                    onOpenChange={(open) => {
                        if (!open) setDisputing(null);
                    }}
                    onSuccess={() => setDisputing(null)}
                />
            )}
        </div>
    );
}
