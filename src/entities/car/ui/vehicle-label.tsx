'use client';

import { cn } from '@/shared/lib';
import { useCar } from '../lib/use-cars';

interface VehicleLabelProps {
    carId: number;
    licensePlate: string;
    stacked?: boolean;
    className?: string;
}

export function VehicleLabel({ carId, licensePlate, stacked = false, className }: VehicleLabelProps) {
    const { data: car } = useCar(carId);
    const name = car?.car ? `${car.car.brand} ${car.car.model}` : null;

    if (!name) {
        return <span className={className}>{licensePlate}</span>;
    }

    if (stacked) {
        return (
            <span className={cn('flex flex-col', className)}>
                <span>{name}</span>
                <span className="text-xs font-normal text-muted-foreground">{licensePlate}</span>
            </span>
        );
    }

    return <span className={className}>{`${name} (${licensePlate})`}</span>;
}
