// User Management Feature
// Transitional re-exports from admin feature (will be migrated incrementally)

export {
    useCustomerDetail,
    useCustomerRentalHistory,
    useBanCustomer,
    useUnbanCustomer,
    useAddAdminNote,
} from '@/features/admin/lib/use-admin-customers';

export {
    useUserList,
    useUserStats,
    useUser,
} from '@/features/admin/lib/use-users';

export { UserTable, UserTableSkeleton } from '@/features/admin/ui/user-table';
export { UserStatsCards, UserStatsCardsSkeleton } from '@/features/admin/ui/user-stats';
export { BanUserDialog, UnbanUserDialog } from '@/features/admin/ui/user-actions-dialog';
export * from '@/features/admin/ui/customer-detail';

export type { CustomerDetailResponse, CustomerStatistics, CustomerVerification, CustomerAccountStatus, AdminNote } from '@/features/admin';
