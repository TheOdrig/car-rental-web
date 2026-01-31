import type { DailySummary, FleetStatus, QuickActionResult } from '@/features/admin';

export function createMockDailySummary(overrides?: Partial<DailySummary>): DailySummary {
    return {
        pendingApprovals: 5,
        todaysPickups: 3,
        todaysReturns: 4,
        overdueRentals: 2,
        pendingDamageAssessments: 1,
        generatedAt: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockFleetStatus(overrides?: Partial<FleetStatus>): FleetStatus {
    return {
        totalCars: 50,
        availableCars: 30,
        rentedCars: 15,
        reservedCars: 2,
        maintenanceCars: 3,
        inspectionCars: 0,
        damagedCars: 2,
        occupancyRate: 0.4,
        generatedAt: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockQuickActionResult(
    success: boolean,
    overrides?: Partial<QuickActionResult>
): QuickActionResult {
    return {
        success,
        message: success ? 'Action completed successfully' : 'Action failed',
        ...overrides,
    };
}
