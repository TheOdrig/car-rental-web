import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { DAMAGE_ENDPOINTS } from '@/entities/damage';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ carId: string }> }
) {
    try {
        const { carId } = await params;
        const carIdNum = parseInt(carId, 10);

        if (isNaN(carIdNum)) {
            return NextResponse.json(
                { error: 'Invalid car ID' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const url = queryString
            ? `${DAMAGE_ENDPOINTS.admin.byVehicle(carIdNum)}?${queryString}`
            : DAMAGE_ENDPOINTS.admin.byVehicle(carIdNum);

        const data = await routeGet(url, {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/damages/vehicle/[carId] error:', error);
        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch vehicle damage history' },
            { status: 500 }
        );
    }
}
