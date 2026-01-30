import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '@/shared/lib/event-bus';

describe('EventBus', () => {
    let eventBus: EventBus;

    beforeEach(() => {
        eventBus = new EventBus();
    });

    it('should subscribe and emit events', () => {
        const handler = vi.fn();
        eventBus.subscribe('TEST_EVENT', handler);
        eventBus.emit('TEST_EVENT', { data: 'test' });

        expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should support multiple subscribers', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        eventBus.subscribe('TEST_EVENT', handler1);
        eventBus.subscribe('TEST_EVENT', handler2);
        eventBus.emit('TEST_EVENT', { data: 'test' });

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('should unsubscribe correctly', () => {
        const handler = vi.fn();
        const unsubscribe = eventBus.subscribe('TEST_EVENT', handler);

        unsubscribe();
        eventBus.emit('TEST_EVENT', { data: 'test' });

        expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        const errorHandler = vi.fn(() => { throw new Error('Test error'); });
        const normalHandler = vi.fn();

        eventBus.subscribe('TEST_EVENT', errorHandler);
        eventBus.subscribe('TEST_EVENT', normalHandler);
        eventBus.emit('TEST_EVENT', { data: 'test' });

        expect(consoleError).toHaveBeenCalled();
        expect(normalHandler).toHaveBeenCalled();

        consoleError.mockRestore();
    });

    it('should clear all subscribers', () => {
        const handler = vi.fn();
        eventBus.subscribe('TEST_EVENT', handler);

        eventBus.clear();
        eventBus.emit('TEST_EVENT', { data: 'test' });

        expect(handler).not.toHaveBeenCalled();
    });

    it('should return subscriber count', () => {
        expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(0);

        eventBus.subscribe('TEST_EVENT', vi.fn());
        expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(1);
    });
});
