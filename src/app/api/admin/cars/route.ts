import { NextRequest, NextResponse } from 'next/server';
import { routeGet, routePost } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const data = await routeGet(endpoints.admin.cars.list + '?' + searchParams.toString(), {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/cars error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cars' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('[API] POST /api/admin/cars - Received body:', JSON.stringify(body));

        const backendRequest: Record<string, unknown> = {
            brand: body.brand?.replace(/-/g, ' '),
            model: body.model,
            productionYear: Number(body.year),
            licensePlate: body.licensePlate?.replace(/[^A-Z0-9]/gi, '').toUpperCase(),
            fuelType: body.fuelType,
            transmissionType: body.transmissionType,
            bodyType: body.bodyType,
            seats: Number(body.seats) || 5,
            color: body.color,
            price: Number(body.dailyRate),
            currencyType: 'USD',
            carStatusType: 'Available',
            kilometer: 0,
            doors: 4,
            isFeatured: false,
            isTestDriveAvailable: true,
            rating: 5.0,
            imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1000'
        };

        if (body.vin && body.vin.length === 17) {
            backendRequest.vinNumber = body.vin.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        }

        console.log('[API] POST /api/admin/cars - Transformed for backend:', JSON.stringify(backendRequest));

        const data = await routePost(endpoints.admin.cars.create, backendRequest, {
            cache: 'no-store',
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/admin/cars error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create car: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}

