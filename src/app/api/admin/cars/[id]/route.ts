import { NextRequest, NextResponse } from 'next/server';
import { serverPost, serverGet, serverDelete } from '@/lib/api/server';
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

        const data = await serverGet(endpoints.admin.cars.byId(carId), {
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

        const data = await serverPost(endpoints.admin.cars.update(carId), body, {
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

        await serverDelete(endpoints.admin.cars.delete(carId), {
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
