import { describe, it, expect } from 'vitest';
import { ApiError } from '../error';
import { containsInternalDetail, getSafeErrorMessage } from '../safe-message';

function apiError(message: string): ApiError {
    return new ApiError({ status: 400, message, timestamp: new Date().toISOString() });
}

describe('safe error messages', () => {
    it.each([
        'Failed to upload file: /app/uploads',
        'Cannot write /var/data/avatars/1.png',
        'C:\\Users\\app\\uploads is not writable',
        'at com.akif.file.Storage(Storage.java:42)',
    ])('recognises internal detail in %s', (text) => {
        expect(containsInternalDetail(text)).toBe(true);
    });

    it.each(['Invalid file type', 'File size must be less than 5MB', 'Too many attempts. Try again in 5 minutes.'])(
        'leaves the customer-facing sentence %s alone',
        (text) => {
            expect(containsInternalDetail(text)).toBe(false);
        }
    );

    it('replaces a server message that leaks a path with the fallback', () => {
        expect(getSafeErrorMessage(apiError('Failed to upload file: /app/uploads'), 'Try later')).toBe('Try later');
    });

    it('keeps a clean server message', () => {
        expect(getSafeErrorMessage(apiError('Invalid file type'), 'Try later')).toBe('Invalid file type');
    });
});
