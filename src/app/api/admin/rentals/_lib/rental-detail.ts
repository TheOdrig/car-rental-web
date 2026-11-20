import type { Schemas } from '@/shared/api';
import { ownValue } from '@/shared/lib/utils';
import { getCancelledByLabel, toAdminRentalStatus, toPriceAdjustments, type RentalDetailResponse, type TimelineEventType } from '@/entities/rental';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';

type Rental = Schemas['RentalResponse'];
type Customer = Schemas['AdminUserDetailResponse'];
type Car = Schemas['CarResponse'];
type Payment = Schemas['PaymentSummary'];
type Damage = Schemas['DamageReportDto'];
type LateReturn = Schemas['LateReturnReportDto'];

export interface RentalDetailSources {
    rental: Rental;
    customer?: Customer;
    car?: Car;
    payment?: Payment;
    damages?: Damage[];
    lateReturn?: LateReturn;
}

const STATUS_EVENTS: Record<
    string,
    { type: TimelineEventType; title: string; note: (rental: Rental) => string | undefined; at: (rental: Rental) => string | undefined }
> = {
    CONFIRMED: { type: 'approved', title: 'Rental confirmed', note: (rental) => rental.approvalNotes, at: (rental) => rental.confirmedAt },
    IN_USE: { type: 'picked_up', title: 'Vehicle picked up', note: (rental) => rental.pickupNotes, at: (rental) => rental.pickedUpAt },
    RETURNED: { type: 'returned', title: 'Vehicle returned', note: (rental) => rental.returnNotes, at: (rental) => rental.returnedAt },
    CANCELLED: { type: 'cancelled', title: 'Rental cancelled', note: (rental) => cancellationNote(rental), at: () => undefined },
};

function cancellationNote(rental: Rental): string {
    const who = getCancelledByLabel(rental.cancelledBy, 'admin');
    const reason = rental.cancellationReason?.trim();
    return reason ? `${who}: ${reason}` : who;
}

const PROGRESS = ['CONFIRMED', 'IN_USE', 'RETURNED'];

function timeline(rental: Rental): RentalDetailResponse['timeline'] {
    const created = rental.createTime ?? rental.startDate ?? '';
    const events: RentalDetailResponse['timeline'] = [{ type: 'created', timestamp: created, title: 'Rental requested' }];
    const reached = rental.status ? PROGRESS.indexOf(rental.status) : -1;
    const stages = reached >= 0 ? PROGRESS.slice(0, reached + 1) : rental.status ? [rental.status] : [];

    stages.forEach((status, index) => {
        const stage = ownValue(STATUS_EVENTS, status);
        if (!stage) return;
        const isCurrent = index === stages.length - 1;
        events.push({
            type: stage.type,
            timestamp: stage.at(rental) ?? (isCurrent ? (rental.updateTime ?? created) : ''),
            title: stage.title,
            description: stage.note(rental) ?? '',
        });
    });

    return events;
}

function toSpentByCurrency(raw: unknown): { currency: string; totalSpent: number }[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((entry): entry is { currency: string; totalSpent?: number } => typeof entry?.currency === 'string')
        .map((entry) => ({ currency: entry.currency, totalSpent: Number(entry.totalSpent ?? 0) }));
}

export function buildRentalDetail({
    rental,
    customer,
    car,
    payment,
    damages = [],
    lateReturn,
}: RentalDetailSources): RentalDetailResponse {
    const summary = rental.carSummary;
    const user = rental.userSummary;
    const total = rental.finalPrice ?? rental.totalPrice ?? 0;

    return {
        id: rental.id ?? 0,
        status: toAdminRentalStatus(rental.status),
        startDate: rental.startDate ?? '',
        endDate: rental.endDate ?? '',
        duration: rental.days ?? 0,
        pricing: {
            dailyRate: rental.dailyPrice ?? 0,
            totalDays: rental.days ?? 0,
            subtotal: rental.originalPrice ?? rental.totalPrice ?? total,
            discounts: rental.totalSavings ?? 0,
            finalTotal: total,
            currency: rental.currency ?? DEFAULT_CURRENCY,
            appliedAdjustments: (rental.appliedDiscounts ?? []).filter((entry) => !/^no /i.test(entry.trim())),
            adjustments: toPriceAdjustments(rental.priceAdjustments),
        },
        customer: {
            id: customer?.id ?? user?.id ?? 0,
            firstName: customer?.firstName ?? user?.fullName ?? user?.username ?? '',
            lastName: customer?.lastName ?? '',
            email: customer?.email ?? user?.email ?? '',
            phone: customer?.phone ?? '',
            emailVerified: customer?.verification?.emailVerified ?? false,
            phoneVerified: customer?.verification?.phoneVerified ?? false,
            stats: {
                totalRentals: customer?.statistics?.totalRentals ?? 0,
                spentByCurrency: toSpentByCurrency(customer?.statistics?.spentByCurrency),
                damageCount: customer?.statistics?.totalDamageReports ?? 0,
            },
        },
        vehicle: {
            id: car?.id ?? summary?.id ?? 0,
            brand: car?.brand ?? summary?.brand ?? '',
            model: car?.model ?? summary?.model ?? '',
            licensePlate: car?.licensePlate ?? summary?.licensePlate ?? '',
            year: car?.productionYear,
            imageUrl: car?.imageUrl ?? car?.thumbnailUrl ?? summary?.thumbnailUrl,
            status: car?.carStatusType ?? '',
            fuelType: car?.fuelType ?? '',
            transmissionType: car?.transmissionType ?? '',
            bodyType: car?.bodyType,
        },
        payment: {
            totalAmount: payment?.amount ?? total,
            status: payment?.status ?? 'NONE',
            method: payment ? 'Card' : '',
        },
        timeline: timeline(rental),
        damages,
        notes: {
            booking: rental.notes ?? undefined,
            approval: rental.approvalNotes,
            pickup: rental.pickupNotes,
            return: rental.returnNotes,
            cancellation: rental.cancellationReason,
        },
        penaltyAmount: lateReturn?.penaltyAmount,
        lateReturnStatus: lateReturn?.status,
        cancelledBy: rental.cancelledBy,
        paymentDueBy: rental.paymentDueBy,
        paymentStatus: rental.paymentStatus,
    };
}
