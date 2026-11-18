import { ApiError } from '@/shared/api';
import { API, created, parseIdParam, proxy, readJson, route, upstream } from '@/shared/server';

interface AddNoteRequest {
    text?: string;
}

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.admin.users.notes.resolve({ id: parseIdParam(id, 'user ID') }),
    tags: ['admin', 'users', 'notes'],
    errorMessage: 'Failed to fetch notes',
    errorStatus: 503,
});

export const POST = route<{ id: string }>(
    async (request, { id }) => {
        const userId = parseIdParam(id, 'user ID');
        const body = await readJson<AddNoteRequest>(request);

        if (!body.text?.trim()) {
            throw new ApiError(400, 'Note text is required');
        }

        const note = await upstream.post(API.admin.users.addNote.resolve({ id: userId }), body, { cache: 'no-store' });
        return created(note);
    },
    { errorMessage: 'Failed to add note', errorStatus: 503 }
);
