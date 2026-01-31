
export {
    useFleetList,
    useFleetCar,
    useCreateCar,
    useUpdateCar,
    useDeleteCar,
    useChangeCarStatus,
    useVehicleDetail,
    useVehicleRentalHistory,
    useInvalidateFleet,
} from './api/fleet-api';

export type {
    CreateCarRequest,
    UpdateCarRequest,
    CarResponse,
    RentalHistoryItem,
    PaginatedResponse,
} from './api/fleet-api';

export { fleetKeys } from './api/fleet-keys';
export type { FleetFilters } from './api/fleet-keys';


export type {
    FleetStatistics,
    CarFormData,
} from './model/types';

export { defaultCarFormData } from './model/types';


export {
    FLEET_EVENTS,
    publishCarAdded,
    publishCarUpdated,
    publishCarDeleted,
    publishCarStatusChanged,
    subscribeToCarAdded,
    subscribeToCarUpdated,
    subscribeToCarDeleted,
    subscribeToCarStatusChanged,
} from './model/fleet-events';

export type {
    FleetEventType,
    CarAddedPayload,
    CarUpdatedPayload,
    CarDeletedPayload,
    CarStatusChangedPayload,
} from './model/fleet-events';


export { useCarForm } from './lib/use-car-form';


export * from './ui';