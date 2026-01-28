export type {
    RentalFilter,
    RentalAction,
    RentalActionRequest,
    RentalListItem,
    PaginatedRentals,
} from './model/types';

export { getRentals, getRentalById, performRentalAction, cancelRental, updateRental } from './api/rental-api';
