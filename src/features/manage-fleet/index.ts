// Fleet Management Feature
// Transitional re-exports from admin feature (will be migrated incrementally)

export {
    useFleetList,
    useFleetCar,
    useDeleteCar,
    useChangeCarStatus,
    useInvalidateFleet,
    fleetKeys,
} from '@/features/admin/lib/use-fleet';

export {
    useAdminCars,
    useCreateCar,
    useUpdateCar,
    useDeleteCar as useDeleteVehicle,
    useUpdateCarStatus,
    useVehicleDetail,
    useVehicleRentalHistory,
} from '@/features/admin/lib/use-admin-vehicles';

export { useCarForm } from '@/features/admin/lib/use-car-form';

export { FleetTable, FleetTableSkeleton } from '@/features/admin/ui/fleet-table';
export { FleetStatsCards, FleetStatsCardsSkeleton } from '@/features/admin/ui/fleet-stats';
export { FleetStatusCard, FleetStatusCompact, FleetStatusSkeleton } from '@/features/admin/ui/fleet-status';
export * from '@/features/admin/ui/car-form';
export * from '@/features/admin/ui/vehicle-detail';

export type { CreateCarRequest, UpdateCarRequest, CarResponse, AdminCarsFilters } from '@/features/admin';
