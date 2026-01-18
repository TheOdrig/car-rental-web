import { NextRequest, NextResponse } from 'next/server';
import { routePatch } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const carId = parseInt(id, 10);

        if (isNaN(carId)) {
            return NextResponse.json(
                { error: 'Invalid car ID' },
                { status: 400 }
            );
        }

        const body = await request.json();

        const carStatusType = body.status.charAt(0).toUpperCase() + body.status.slice(1).toLowerCase();

        const data = await routePatch(endpoints.admin.cars.updateStatus(carId), {
            carStatusType: carStatusType,
            reason: body.reason || 'Status updated from admin panel',
            notes: body.notes
        }, {
            cache: 'no-store',
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/admin/cars/[id]/status error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update car status' },
            { status: 500 }
        );
    }
}
