import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { endpoints } from '@/lib/api/endpoints';
import { routeDelete } from '@/lib/api/route-handler';
import { isApiException } from '@/lib/api/errors';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const damageId = parseInt(id, 10);

        if (isNaN(damageId)) {
            return NextResponse.json(
                { error: 'Invalid damage ID' },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(endpoints.damages.admin.photos(damageId), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Failed to upload photos' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/admin/damages/[id]/photos error:', error);
        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to upload photos' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const damageId = parseInt(id, 10);
        const { searchParams } = new URL(request.url);
        const photoId = searchParams.get('photoId');

        if (isNaN(damageId) || !photoId) {
            return NextResponse.json(
                { error: 'Invalid damage ID or photo ID' },
                { status: 400 }
            );
        }

        await routeDelete(endpoints.damages.admin.deletePhoto(damageId, parseInt(photoId, 10)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] DELETE /api/admin/damages/[id]/photos error:', error);
        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to delete photo' },
            { status: 500 }
        );
    }
}
