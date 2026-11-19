import { describe, expect, it } from 'vitest';
import { ApiError, getApiErrorMessage } from '@/shared/api';

function problem(status: number, code: string | undefined, message = 'raw api wording', retryAfter?: number) {
    return new ApiError({ status, message, timestamp: new Date().toISOString(), code, retryAfter });
}

describe('getApiErrorMessage', () => {
    it('explains an upload that is too large by code and by status', () => {
        expect(getApiErrorMessage(problem(413, 'PAYLOAD_TOO_LARGE'))).toMatch(/too large/i);
        expect(getApiErrorMessage(problem(413, undefined))).toMatch(/too large/i);
    });

    it('explains an unreadable multipart upload', () => {
        expect(getApiErrorMessage(problem(400, 'INVALID_MULTIPART_REQUEST'))).toMatch(/choose the file again/i);
    });

    it('asks the user to reload after a concurrent modification', () => {
        const message = getApiErrorMessage(problem(409, 'CONCURRENT_MODIFICATION'));

        expect(message).toMatch(/reload/i);
        expect(message).not.toContain('raw api wording');
    });

    it('explains a data conflict', () => {
        expect(getApiErrorMessage(problem(409, 'DATA_CONFLICT'))).toMatch(/conflicts/i);
    });

    it('explains an invalid user state on ban and unban', () => {
        expect(getApiErrorMessage(problem(409, 'INVALID_USER_STATE'))).toMatch(/current state/i);
    });

    it('shows the retry hint on a rate limit', () => {
        expect(getApiErrorMessage(problem(429, 'RATE_LIMIT_EXCEEDED', 'x', 30))).toContain('30 seconds');
    });

    it('keeps the API message for other codes and plain errors', () => {
        expect(getApiErrorMessage(problem(400, 'BAD_REQUEST', 'Malformed body'))).toBe('Malformed body');
        expect(getApiErrorMessage(new Error('boom'))).toBe('boom');
        expect(getApiErrorMessage('nope')).toBe('An unexpected error occurred');
    });

    it.each(['constructor', '__proto__', 'toString'])('ignores the inherited key %s', (code) => {
        expect(getApiErrorMessage(problem(500, code, 'kept'))).toBe('kept');
    });
});

describe('getApiErrorMessage field problems', () => {
    it('lists each rejected field with its message instead of a generic summary', () => {
        const error = new ApiError({
            status: 400,
            message: 'Validation failed',
            timestamp: new Date().toISOString(),
            errors: [
                { field: 'imageUrl', message: 'Image URL format is invalid' },
                { field: 'vinNumber', message: 'VIN must be 17 characters' },
            ],
        });

        expect(getApiErrorMessage(error)).toBe('imageUrl: Image URL format is invalid; vinNumber: VIN must be 17 characters');
    });
});
