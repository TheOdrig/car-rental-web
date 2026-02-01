# Feature Catalog

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

This catalog documents all 9 features in the Car Rental Web application. Each feature represents a user action or business capability.

---

## Table of Contents

1. [auth](#1-auth---user-authentication)
2. [book-car](#2-book-car---car-booking-and-reservation)
3. [manage-rentals](#3-manage-rentals---rental-management-user-facing)
4. [manage-fleet](#4-manage-fleet---fleet-management-admin-facing)
5. [manage-users](#5-manage-users---user-management-admin-facing)
6. [process-rentals](#6-process-rentals---rental-processing-admin-facing)
7. [manage-damages](#7-manage-damages---damage-reporting-and-management)
8. [user-settings](#8-user-settings---user-profile-and-settings)
9. [admin](#9-admin---admin-dashboard)

---

## 1. auth - User Authentication

**Purpose:** Handles user authentication including login, registration, logout, password management, and OAuth2 integration.

**Location:** `src/features/auth/`

### Public API

**Types:**
- `User`, `UserSummary`, `Role`, `AuthResponse`
- `LoginRequest`, `RegisterRequest`, `LoginResponse`, `LogoutResponse`
- `PasswordChangeRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`
- `PasswordStrength`, `FieldValidationState`, `FormValidationState`

**Components:**
- `LoginForm`, `RegisterForm`
- `ForgotPasswordForm`, `ResetPasswordForm`
- `OAuthButtons`, `OAuthDivider`
- `FormError`, `FormSuccess`
- `PasswordStrengthIndicator`
- `AuthProvider`, `useAuthContext`

**Hooks:**
- `useAuth()` - Get current authentication state
- `useCurrentUser()` - Get current user data
- `useLogin()` - Login mutation
- `useLogout()` - Logout mutation
- `useRegister()` - Registration mutation
- `useRefreshToken()` - Token refresh
- `useChangePassword()` - Password change
- `useForgotPassword()` - Password reset request
- `useResetPassword()` - Password reset confirmation

**API Functions:**
- `login()`, `register()`, `logout()`
- `handleAuthError()`

**Utilities:**
- `getAccessToken()`, `clearAuthTokens()`
- `verifyToken()` - JWT verification

**Events:**
- `AUTH_EVENTS.LOGIN`, `AUTH_EVENTS.LOGOUT`, `AUTH_EVENTS.TOKEN_REFRESHED`

### Dependencies

**Entities:** `user`  
**Shared:** `api`, `ui`, `events`, `lib`

### Test Coverage

✅ **90.1% coverage**
- Login/register flow tests
- Password validation tests
- OAuth flow tests
- Token refresh tests

---

## 2. book-car - Car Booking and Reservation

**Purpose:** Handles car booking flow including date selection, addon selection, payment, and booking confirmation.

**Location:** `src/features/book-car/`

### Public API

**Types:**
- `CardType`, `PaymentMethod`, `AddCardRequest`
- `CheckoutFormData`, `CreateBookingRequest`
- `Addon`, `DiscountDetail`, `PriceBreakdown`, `AddonCostDetail`
- `BookingConfirmation`, `BookingStatus`
- `BookingCarInfo`, `BookingDates`, `BookingLocations`, `BookingPaymentInfo`
- `PaymentError`, `PaymentErrorCode`

**Components:**
- `BookingForm` - Main booking form
- `BookingSuccess` - Success confirmation
- `BookingFailure` - Error handling
- `CheckoutForm` - Complete checkout flow
- `CheckoutSkeleton` - Loading state
- `PersonalDetails` - Personal info form
- `PaymentForm` - Payment details
- `ProtectionExtras` - Addon selection
- `BookingSummary` - Price breakdown

**Hooks:**
- `useCreateBooking()` - Create booking mutation

**API Functions:**
- `createBooking()` - Create new booking

**Store:**
- `bookingActions` - Booking state management

**Events:**
- `BOOKING_EVENTS.CREATED`, `BOOKING_EVENTS.UPDATED`, `BOOKING_EVENTS.CANCELLED`
- `publishBookingCreated()`, `publishBookingUpdated()`, `publishBookingCancelled()`

**Utilities:**
- Validation functions
- Price calculation utilities

### Dependencies

**Entities:** `car`, `rental`, `payment`, `currency`  
**Shared:** `api`, `ui`, `lib`

### Test Coverage

✅ **88.3% coverage**
- Booking form validation
- Date selection tests
- Pricing calculation tests
- Availability check tests

---

## 3. manage-rentals - Rental Management (User-Facing)

**Purpose:** User-facing rental management including viewing rentals, filtering, and performing actions (cancel, update).

**Location:** `src/features/manage-rentals/`

### Public API

**Types:**
- `RentalFilter`, `RentalAction`, `RentalActionRequest`
- `RentalListItem`, `PaginatedRentals`

**Components:**
- `RentalList`, `RentalListSkeleton`, `RentalListEmpty`
- `RentalCard`, `RentalCardSkeleton`
- `RentalDetail`, `RentalDetailSkeleton`
- `RentalForm` - Update rental
- `RentalStats` - Rental statistics
- `RentalTabs` - Tab navigation (all, active, upcoming, completed, cancelled)
- `RentalTimeline` - Rental history timeline
- `RentalActions`, `RentalActionsSkeleton`

**API Functions:**
- `getRentals()` - Fetch rentals with filters
- `getRentalById()` - Fetch single rental
- `performRentalAction()` - Execute rental action
- `cancelRental()` - Cancel rental
- `updateRental()` - Update rental

**Store:**
- `rentalActions`, `rentalStore` - Rental state management

**Events:**
- `RENTAL_EVENTS` (from entity)
- `publishRentalApproved()`, `publishRentalRejected()`
- `publishRentalPickedUp()`, `publishRentalReturned()`
- `publishRentalCancelled()`, `publishRentalUpdated()`

### Dependencies

**Entities:** `rental`, `car`, `user`  
**Shared:** `api`, `ui`, `events`

### Test Coverage

✅ **82.1% coverage**
- Rental list tests
- Status filter tests
- Rental detail tests

---

## 4. manage-fleet - Fleet Management (Admin-Facing)

**Purpose:** Admin-facing fleet management including adding, editing, deleting cars, and changing car status.

**Location:** `src/features/manage-fleet/`

### Public API

**Types:**
- `CreateCarRequest`, `UpdateCarRequest`, `CarResponse`
- `RentalHistoryItem`, `PaginatedResponse`
- `FleetStatistics`, `CarFormData`

**Hooks:**
- `useFleetList()` - Fetch fleet list
- `useFleetCar()` - Fetch single car
- `useCreateCar()` - Create car mutation
- `useUpdateCar()` - Update car mutation
- `useDeleteCar()` - Delete car mutation
- `useChangeCarStatus()` - Change car status
- `useVehicleDetail()` - Vehicle detail
- `useVehicleRentalHistory()` - Rental history
- `useInvalidateFleet()` - Invalidate cache
- `useCarForm()` - Car form state

**Query Keys:**
- `fleetKeys` - TanStack Query keys

**Events:**
- `FLEET_EVENTS.CAR_ADDED`, `FLEET_EVENTS.CAR_UPDATED`
- `FLEET_EVENTS.CAR_DELETED`, `FLEET_EVENTS.CAR_STATUS_CHANGED`
- `publishCarAdded()`, `publishCarUpdated()`
- `publishCarDeleted()`, `publishCarStatusChanged()`
- `subscribeToCarAdded()`, `subscribeToCarUpdated()`
- `subscribeToCarDeleted()`, `subscribeToCarStatusChanged()`

**UI Components:**
- Exported via `export * from './ui'`

### Dependencies

**Entities:** `car`, `rental`  
**Shared:** `api`, `ui`, `events`

### Test Coverage

❌ **0% coverage** - Needs tests

---

## 5. manage-users - User Management (Admin-Facing)

**Purpose:** Admin-facing user management including viewing users, banning/unbanning, and adding admin notes.

**Location:** `src/features/manage-users/`

### Public API

**Types:**
- `User`, `UserRole`, `UserStatus`, `UserStats`
- `CustomerDetailResponse`, `CustomerStatistics`, `CustomerVerification`
- `CustomerAccountStatus`, `AdminNote`
- `RentalHistoryItem`, `PaginatedResponse`, `AdminRentalStatus`
- `BanUserRequest`, `UnbanUserRequest`, `AddNoteRequest`

**Hooks:**
- `useUserList()` - Fetch user list
- `useUserStats()` - User statistics
- `useUser()` - Fetch single user
- `useCustomerDetail()` - Customer detail
- `useCustomerRentalHistory()` - Customer rental history
- `useBanUser()` - Ban user mutation
- `useUnbanUser()` - Unban user mutation
- `useAddAdminNote()` - Add admin note
- `useInvalidateUsers()` - Invalidate cache

**Components:**
- `UserStatsCards`, `UserStatsCardsSkeleton`
- `UserTable`, `UserTableSkeleton`
- `BanUserDialog`, `UnbanUserDialog`
- `CustomerDetailInfoCard`, `CustomerVerificationCard`
- `CustomerStatisticsCard`, `CustomerStatusCard`
- `CustomerRentalHistoryTable`, `CustomerNotesCard`
- `BanCustomerDialog`, `UnbanCustomerDialog`

**Events:**
- `USERS_EVENTS.USER_BANNED`, `USERS_EVENTS.USER_UNBANNED`
- `USERS_EVENTS.USER_NOTE_ADDED`, `USERS_EVENTS.USER_UPDATED`
- `publishUserBanned()`, `publishUserUnbanned()`
- `publishUserNoteAdded()`, `publishUserUpdated()`
- `subscribeToUserBanned()`, `subscribeToUserUnbanned()`
- `subscribeToUserNoteAdded()`, `subscribeToUserUpdated()`

### Dependencies

**Entities:** `user`, `rental`  
**Shared:** `api`, `ui`, `events`

### Test Coverage

❌ **0% coverage** - Needs tests

---

## 6. process-rentals - Rental Processing (Admin-Facing)

**Purpose:** Admin-facing rental processing including approving, rejecting, processing pickup, and processing return.

**Location:** `src/features/process-rentals/`

### Public API

**Types:**
- `QuickActionResult`, `ProcessReturnData`
- `ApproveRentalRequest`, `RejectRentalRequest`
- `ProcessPickupRequest`, `ProcessReturnRequest`
- `RentalDetailResponse`

**Hooks:**
- `useApproveRental()` - Approve rental mutation
- `useRejectRental()` - Reject rental mutation
- `useProcessPickup()` - Process pickup mutation
- `useProcessReturn()` - Process return mutation
- `useRentalDetail()` - Fetch rental detail

**Components:**
- `ApproveRentalDialog` - Approval dialog
- `RejectRentalDialog` - Rejection dialog
- `ProcessPickupDialog` - Pickup dialog
- `ProcessReturnDialog` - Return dialog
- `PendingRentalsTable`, `PendingRentalsSkeleton`
- `RentalInfoCard`, `CustomerInfoCard`, `VehicleInfoCard`
- `PaymentInfoCard`, `TimelineCard`, `RentalActionButtons`

**Events:**
- `PROCESS_EVENTS.RENTAL_APPROVED`, `PROCESS_EVENTS.RENTAL_REJECTED`
- `PROCESS_EVENTS.PICKUP_PROCESSED`, `PROCESS_EVENTS.RETURN_PROCESSED`
- `publishRentalApproved()`, `publishRentalRejected()`
- `publishPickupProcessed()`, `publishReturnProcessed()`
- `subscribeToRentalApproved()`, `subscribeToRentalRejected()`
- `subscribeToPickupProcessed()`, `subscribeToReturnProcessed()`

### Dependencies

**Entities:** `rental`, `car`, `user`, `damage`  
**Shared:** `api`, `ui`, `events`

### Test Coverage

❌ **0% coverage** - Needs tests

---

## 7. manage-damages - Damage Reporting and Management

**Purpose:** Damage reporting, photo upload, assessment, dispute, and resolution.

**Location:** `src/features/manage-damages/`

### Public API

**Components:**
- `DamageCard`, `DamageCardSkeleton`
- `DamageList`
- `DamageDisputeForm`

**Hooks (Re-exported from damage entity):**
- `useDamages()` - Fetch damages
- `useDamageDetail()` - Fetch single damage
- `useDisputeDamage()` - Dispute damage
- `useCreateDamage()` - Create damage report
- `useUploadPhotos()` - Upload damage photos
- `useDeletePhoto()` - Delete photo
- `useAssessDamage()` - Assess damage (admin)
- `useResolveDamage()` - Resolve damage (admin)
- `useInvalidateDamages()` - Invalidate cache
- `useMyDamages()` - User's damages
- `useDamageStatistics()` - Damage statistics
- `useVehicleDamages()` - Vehicle damages
- `useCustomerDamages()` - Customer damages

**Query Keys:**
- `damageKeys` - TanStack Query keys

### Dependencies

**Entities:** `damage`, `rental`, `car`, `user`  
**Shared:** `api`, `ui`

### Test Coverage

❌ **0% coverage** - Needs tests

---

## 8. user-settings - User Profile and Settings

**Purpose:** User profile management including personal details, avatar upload, and payment methods.

**Location:** `src/features/user-settings/`

### Public API

**Components:**
- `PersonalDetailsForm` - Edit personal details
- `ProfilePicture` - Avatar display and upload
- `PaymentCard` - Payment method card
- `AddCardForm` - Add payment method

**Hooks:**
- `useUpdateProfile()` - Update profile mutation
- `useProfile()` - Fetch profile
- `useUploadAvatar()` - Upload avatar
- `useDeleteAvatar()` - Delete avatar

**Query Keys:**
- `profileKeys` - TanStack Query keys

**Utilities:**
- `validateAvatarFile()` - Avatar validation
- Validation functions

**Types:**
- `AvatarValidationError`

### Dependencies

**Entities:** `user`, `payment`  
**Shared:** `api`, `ui`, `lib`

### Test Coverage

❌ **0% coverage** - Needs tests

---

## 9. admin - Admin Dashboard

**Purpose:** Admin dashboard with metrics, revenue analytics, alerts, and quick actions.

**Location:** `src/features/admin/`

### Public API

**Types:**
- `TrendIndicator`, `DailySummary`, `FleetStatus`, `MonthlyMetrics`
- `AlertType`, `AlertSeverity`, `Alert`, `AdminAlert`, `AlertVariant`, `AdminAlertAction`
- `PendingItem`, `QuickActionResult`, `ProcessReturnData`
- `DailyRevenue`, `MonthlyRevenue`, `RevenueBreakdown`, `RevenuePeriod`
- `RevenueDataPoint`, `RevenueAnalytics`
- `TimelineEventType`, `TimelineEvent`
- `AdminRentalStatus`, `RentalDetailResponse`

**Hooks:**
- `useDashboardSummary()` - Dashboard summary
- `useFleetStatus()` - Fleet status
- `usePendingApprovals()` - Pending approvals
- `usePendingPickups()` - Pending pickups
- `usePendingReturns()` - Pending returns
- `useOverdueRentals()` - Overdue rentals
- `useRevenueData()` - Revenue analytics
- `useAlerts()` - System alerts
- `useDismissAlert()` - Dismiss alert
- `useMarkAllAlertsRead()` - Mark all alerts read
- `useInvalidateAdmin()` - Invalidate cache
- Late return hooks (exported via `export * from './lib/use-late-returns'`)

**Query Keys:**
- `adminKeys` - TanStack Query keys

**UI Components:**
- Exported via `export * from './ui'`

**Utilities:**
- Exported via `export * from './lib/utils'`

### Dependencies

**Entities:** `rental`, `car`, `user`, `damage`  
**Shared:** `api`, `ui`, `events`

### Test Coverage

✅ **75.2% coverage**
- Dashboard metrics tests
- Revenue calculation tests

---

## Feature Isolation

All features are isolated and cannot import from each other. Cross-feature communication uses the event bus.

**Example:**
```typescript
// ❌ WRONG: Cross-feature import
import { useAuth } from '@/features/auth';

// ✅ CORRECT: Event bus
import { eventBus, EVENTS } from '@/shared/events';
eventBus.emit(EVENTS.LOGOUT);
```

---

## Coverage Summary

| Feature | Coverage | Status |
|---------|----------|--------|
| auth | 90.1% | ✅ Well-tested |
| book-car | 88.3% | ✅ Well-tested |
| manage-rentals | 82.1% | ✅ Well-tested |
| admin | 75.2% | ✅ Tested |
| manage-fleet | 0% | ❌ Needs tests |
| manage-users | 0% | ❌ Needs tests |
| process-rentals | 0% | ❌ Needs tests |
| manage-damages | 0% | ❌ Needs tests |
| user-settings | 0% | ❌ Needs tests |

**Overall Feature Coverage:** 4/9 features tested (44%)

---

**For detailed FSD guide, see [FSD_GUIDE.md](../architecture/FSD_GUIDE.md)**  
**For testing strategy, see [TEST_STRATEGY.md](../testing/TEST_STRATEGY.md)**  
**For contribution guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag
