import { describe, it, expect, vi } from 'vitest';
import { eventBus } from '@/shared/events';

describe('EventBus', () => {
    it('should subscribe and publish events', () => {
        const handler = vi.fn();
        const eventType = 'test:event';
        const payload = { data: 'test' };

        eventBus.subscribe(eventType, handler);
        eventBus.publish(eventType, payload);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            type: eventType,
            payload,
            timestamp: expect.any(Date),
        }));
    });

    it('should unsubscribe correctly', () => {
        const handler = vi.fn();
        const eventType = 'test:event';

        const unsubscribe = eventBus.subscribe(eventType, handler);
        unsubscribe();
        eventBus.publish(eventType, {});

        expect(handler).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        const eventType = 'test:event';

        eventBus.subscribe(eventType, handler1);
        eventBus.subscribe(eventType, handler2);
        eventBus.publish(eventType, {});

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });
});
