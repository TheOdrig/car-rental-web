import { NextRequest, NextResponse } from 'next/server';
import { routeGet, routePut, routeDelete } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

export async function GET(
    _request: NextRequest,
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

        const data = await routeGet(endpoints.admin.cars.byId(carId), {
            cache: 'no-store',
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/cars/[id] error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch car' },
            { status: 500 }
        );
    }
}

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

        const backendRequest: Record<string, unknown> = {
            brand: body.brand?.replace(/-/g, ' '),
            model: body.model,
            productionYear: Number(body.year),
            licensePlate: body.licensePlate?.replace(/[^A-Z0-9]/gi, '').toUpperCase(),
            fuelType: body.fuelType,
            transmissionType: body.transmissionType,
            bodyType: body.bodyType,
            seats: Number(body.seats),
            color: body.color,
            price: Number(body.dailyRate),
            currencyType: 'USD',
            carStatusType: 'Available',
            kilometer: Number(body.kilometer) || 0,
            doors: Number(body.doors) || 4,
            isFeatured: !!body.isFeatured,
            isTestDriveAvailable: true,
            rating: Number(body.rating) || 5.0,
            imageUrl: body.imageUrl || undefined
        };

        if (body.vin && body.vin.length === 17) {
            backendRequest.vinNumber = body.vin.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        }

        const data = await routePut(endpoints.admin.cars.update(carId), backendRequest, {
            cache: 'no-store',
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/admin/cars/[id] error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update car' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
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

        await routeDelete(endpoints.admin.cars.delete(carId), {
            cache: 'no-store',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] DELETE /api/admin/cars/[id] error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete car' },
            { status: 500 }
        );
    }
}
