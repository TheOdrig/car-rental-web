import { describe, it, expect, vi } from 'vitest';
import { publishCarAdded, publishCarDeleted, subscribeToCarAdded, subscribeToCarDeleted } from '../fleet-events';

describe('fleet events', () => {
    it('delivers a published car to subscribers until they unsubscribe', () => {
        const handler = vi.fn();
        const unsubscribe = subscribeToCarAdded(handler);
        const car = { id: 3, brand: 'Audi', model: 'A3', licensePlate: '35 ABC 123' };

        publishCarAdded({ car });
        unsubscribe();
        publishCarAdded({ car });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ car });
    });

    it('keeps event types apart', () => {
        const added = vi.fn();
        const deleted = vi.fn();
        const stopAdded = subscribeToCarAdded(added);
        const stopDeleted = subscribeToCarDeleted(deleted);

        publishCarDeleted({ carId: 9 });
        stopAdded();
        stopDeleted();

        expect(added).not.toHaveBeenCalled();
        expect(deleted).toHaveBeenCalledWith({ carId: 9 });
    });
});
