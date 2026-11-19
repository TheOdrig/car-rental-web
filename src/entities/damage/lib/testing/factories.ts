import type { DamageReport, DamageListResponse } from '@/entities/damage';

export function createMockDamage(overrides?: Partial<DamageReport>): DamageReport {
    return {
        id: 1,
        rentalId: 10,
        carId: 5,
        carLicensePlate: '34ABC123',
        carSummary: { id: 5, licensePlate: '34ABC123', brand: 'Renault', model: 'Clio' },
        customerName: 'John Doe',
        description: 'Scratch on the door',
        severity: 'MINOR',
        category: 'SCRATCH',
        status: 'REPORTED',
        reportedAt: new Date().toISOString(),
        photos: [],
        ...overrides,
    };
}

export function createMockDamageListResponse(content: DamageReport[]): DamageListResponse {
    return {
        content,
        totalElements: content.length,
        totalPages: 1,
        size: 20,
        page: 0,
    };
}