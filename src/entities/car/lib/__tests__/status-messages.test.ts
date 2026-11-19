import { describe, it, expect } from 'vitest';
import { friendlyUnavailableReason, getCarUnavailableMessage } from '../status-messages';

describe('car status messages', () => {
    it('maps a car status to a customer-facing sentence', () => {
        expect(getCarUnavailableMessage('Maintenance')).toMatch(/maintenance/i);
        expect(getCarUnavailableMessage('Damaged')).toMatch(/repaired/i);
        expect(getCarUnavailableMessage('Inspection')).toMatch(/inspected/i);
    });

    it('understands the status codes sent by the API', () => {
        expect(getCarUnavailableMessage('MAINTENANCE')).toMatch(/maintenance/i);
        expect(getCarUnavailableMessage('DAMAGED')).toMatch(/repaired/i);
        expect(friendlyUnavailableReason('INSPECTION')).toMatch(/inspected/i);
    });

    it('falls back to a generic sentence for unknown or missing statuses', () => {
        expect(getCarUnavailableMessage('Teleported')).toBe('This car is not available for booking right now.');
        expect(getCarUnavailableMessage(undefined)).toBe('This car is not available for booking right now.');
    });

    it('rewrites raw backend text without leaking ids or internals', () => {
        const raw = 'Car with id 8 is not available for rental. Reason: Car status is: Maintenance';

        const message = friendlyUnavailableReason(raw);

        expect(message).toMatch(/maintenance/i);
        expect(message).not.toMatch(/id 8|Reason/);
    });
});
