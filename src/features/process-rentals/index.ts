// Rental Processing Feature  
// Transitional re-exports from admin feature (will be migrated incrementally)

export {
    useApproveRental,
    useRejectRental,
    useProcessPickup,
    useProcessReturn,
    useRentalDetail,
} from '@/features/admin/lib/use-admin-rentals';

export {
    useLateReturns,
    useLateReturnStatistics,
    useWaivePenalty,
    usePenaltyHistory,
    useInvalidateLateReturns,
} from '@/features/admin/lib/use-late-returns';

export { PendingRentalsTable, PendingRentalsSkeleton } from '@/features/admin/ui/pending-rentals';
export { ApproveRentalDialog } from '@/features/admin/ui/approve-rental-dialog';
export { RejectRentalDialog } from '@/features/admin/ui/reject-rental-dialog';
export { ProcessPickupDialog } from '@/features/admin/ui/process-pickup-dialog';
export { ProcessReturnDialog } from '@/features/admin/ui/process-return-dialog';
export { LateReturnsTable } from '@/features/admin/ui/late-returns-table';
export { LateReturnFilters } from '@/features/admin/ui/late-return-filters';
export { LateReturnStats } from '@/features/admin/ui/late-return-stats';
export { LateReturnStatusBadge } from '@/features/admin/ui/late-return-status-badge';
export { PenaltyWaiveDialog } from '@/features/admin/ui/penalty-waive-dialog';
export { PenaltyHistorySection } from '@/features/admin/ui/penalty-history-section';
export * from '@/features/admin/ui/rental-detail';

export type { RentalDetailResponse, RentalVehicleInfo, RentalCustomerInfo, RentalPricing, TimelineEvent, PendingItem } from '@/features/admin';
