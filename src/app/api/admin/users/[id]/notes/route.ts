import { NextRequest, NextResponse } from 'next/server';
import { routeGet, routePost } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

interface AdminNote {
    id: number;
    userId: number;
    adminId: number;
    adminUsername: string;
    text: string;
    createdAt: string;
}

interface AddNoteRequest {
    text: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const notes = await routeGet<AdminNote[]>(endpoints.admin.users.notes(userId), {
            cache: 'no-store',
            tags: ['admin', 'users', 'notes'],
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('[API] GET /api/admin/users/[id]/notes error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch notes' },
            { status: 503 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const body: AddNoteRequest = await request.json();

        if (!body.text?.trim()) {
            return NextResponse.json(
                { error: 'Note text is required' },
                { status: 400 }
            );
        }

        const note = await routePost<AdminNote>(endpoints.admin.users.notes(userId), body);

        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/admin/users/[id]/notes error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add note' },
            { status: 503 }
        );
    }
}
