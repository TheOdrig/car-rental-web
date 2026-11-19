
export {
    useFleetList,
    useFleetCar,
    useCreateCar,
    useUpdateCar,
    useDeleteCar,
    useRestoreCar,
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



export { useCarForm, carFormFieldErrors, validateCarForm } from './lib/use-car-form';


export * from './ui';