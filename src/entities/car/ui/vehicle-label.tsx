import { cn } from '@/shared/lib';

interface VehicleLabelProps {
    carSummary?: { brand?: string; model?: string; licensePlate?: string } | null;
    licensePlate: string;
    stacked?: boolean;
    className?: string;
}

export function VehicleLabel({ carSummary, licensePlate, stacked = false, className }: VehicleLabelProps) {
    const name = [carSummary?.brand, carSummary?.model].filter(Boolean).join(' ');
    const plate = carSummary?.licensePlate || licensePlate;

    if (!name) {
        return <span className={className}>{plate}</span>;
    }

    if (stacked) {
        return (
            <span className={cn('flex flex-col', className)}>
                <span>{name}</span>
                <span className="text-xs font-normal text-muted-foreground">{plate}</span>
            </span>
        );
    }

    return <span className={className}>{`${name} (${plate})`}</span>;
}
