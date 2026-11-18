import type { Schemas } from '@/shared/api';
import { toAdminRentalStatus, type RentalDetailResponse, type TimelineEventType } from '@/entities/rental';
import { toLateReturnStatus } from '../../_lib/late-return-status';

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

const STATUS_EVENTS: Record<string, { type: TimelineEventType; title: string; note: (rental: Rental) => string | undefined }> = {
    Confirmed: { type: 'approved', title: 'Rental confirmed', note: (rental) => rental.approvalNotes },
    'In Use': { type: 'picked_up', title: 'Vehicle picked up', note: (rental) => rental.pickupNotes },
    Returned: { type: 'returned', title: 'Vehicle returned', note: (rental) => rental.returnNotes },
    Cancelled: { type: 'cancelled', title: 'Rental cancelled', note: (rental) => rental.cancellationReason },
};

function timeline(rental: Rental): RentalDetailResponse['timeline'] {
    const created = rental.createTime ?? rental.startDate ?? '';
    const events: RentalDetailResponse['timeline'] = [{ type: 'created', timestamp: created, title: 'Rental requested' }];
    const current = rental.status ? STATUS_EVENTS[rental.status] : undefined;

    if (current) {
        events.push({
            type: current.type,
            timestamp: rental.updateTime ?? created,
            title: current.title,
            description: current.note(rental) ?? '',
        });
    }

    return events;
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
            currency: rental.currency ?? 'USD',
        },
        customer: {
            id: customer?.id ?? user?.id ?? 0,
            firstName: customer?.firstName ?? user?.username ?? '',
            lastName: customer?.lastName ?? '',
            email: customer?.email ?? user?.email ?? '',
            phone: customer?.phone ?? '',
            emailVerified: customer?.verification?.emailVerified ?? false,
            phoneVerified: customer?.verification?.phoneVerified ?? false,
            stats: {
                totalRentals: customer?.statistics?.totalRentals ?? 0,
                totalSpent: customer?.statistics?.totalSpent ?? 0,
                damageCount: customer?.statistics?.totalDamageReports ?? 0,
            },
        },
        vehicle: {
            id: car?.id ?? summary?.id ?? 0,
            brand: car?.brand ?? summary?.brand ?? '',
            model: car?.model ?? summary?.model ?? '',
            licensePlate: car?.licensePlate ?? summary?.licensePlate ?? '',
            imageUrl: car?.imageUrl ?? car?.thumbnailUrl ?? summary?.thumbnailUrl,
            status: car?.carStatusType ?? summary?.carStatusType ?? '',
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
            approval: rental.approvalNotes,
            pickup: rental.pickupNotes,
            return: rental.returnNotes,
            cancellation: rental.cancellationReason,
        },
        penaltyAmount: lateReturn?.penaltyAmount,
        lateReturnStatus: toLateReturnStatus(lateReturn?.status),
    };
}
