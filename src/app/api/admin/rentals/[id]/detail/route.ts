import type { Schemas } from '@/shared/api';
import { logger } from '@/shared/lib/logger';
import { API, parseIdParam, route, upstream } from '@/shared/server';
import { buildRentalDetail } from '../../_lib/rental-detail';

interface Page<T> {
    content?: T[];
}

async function optional<T>(label: string, request: Promise<T> | undefined): Promise<T | undefined> {
    try {
        return await request;
    } catch (error) {
        logger.warn(`[BFF] Rental detail ${label} unavailable`, error);
        return undefined;
    }
}

export const GET = route<{ id: string }>(
    async (_request, { id }) => {
        const rentalId = parseIdParam(id, 'rental ID');
        const rental = await upstream.get<Schemas['RentalResponse']>(API.rentals.byId.resolve({ id: rentalId }), {
            cache: 'no-store',
        });
        const userId = rental.userSummary?.id;
        const carId = rental.carSummary?.id;

        const [customer, car, payment, damages, lateReturns] = await Promise.all([
            optional(
                'customer',
                userId === undefined
                    ? undefined
                    : upstream.get<Schemas['AdminUserDetailResponse']>(API.admin.users.byId.resolve({ id: userId }), {
                          cache: 'no-store',
                      })
            ),
            optional(
                'vehicle',
                carId === undefined
                    ? undefined
                    : upstream.get<Schemas['CarResponse']>(API.cars.byId.resolve({ id: carId }), {
                          anonymous: true,
                          cache: 'no-store',
                      })
            ),
            optional(
                'payment',
                upstream.get<Schemas['PaymentSummary']>(API.rentals.payment.resolve({ id: rentalId }), {
                    cache: 'no-store',
                })
            ),
            optional(
                'damages',
                carId === undefined
                    ? undefined
                    : upstream.get<Page<Schemas['DamageReportDto']>>(API.admin.damages.byVehicle.resolve({ carId }), {
                          params: { size: 50 },
                          cache: 'no-store',
                      })
            ),
            optional(
                'late return',
                rental.endDate
                    ? upstream.get<Page<Schemas['LateReturnReportDto']>>(API.admin.lateReturns.resolve(), {
                          params: { startDate: rental.endDate, endDate: rental.endDate, size: 100 },
                          cache: 'no-store',
                      })
                    : undefined
            ),
        ]);

        return buildRentalDetail({
            rental,
            customer,
            car,
            payment,
            damages: (damages?.content ?? []).filter((damage) => damage.rentalId === rentalId),
            lateReturn: lateReturns?.content?.find((report) => report.rentalId === rentalId),
        });
    },
    { errorMessage: 'Failed to fetch rental detail', errorStatus: 503 }
);
