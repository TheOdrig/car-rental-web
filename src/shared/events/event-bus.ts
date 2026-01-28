import { DomainEvent, EventHandler } from './types';

class EventBus {
    private handlers = new Map<string, Set<EventHandler>>();

    subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType)!.add(handler as EventHandler);

        return () => {
            this.handlers.get(eventType)?.delete(handler as EventHandler);
        };
    }

    publish<T>(eventType: string, payload: T): void {
        const event: DomainEvent<T> = {
            type: eventType,
            payload,
            timestamp: new Date(),
        };

        this.handlers.get(eventType)?.forEach((handler) => {
            try {
                handler(event);
            } catch (error) {
                console.error(`Error handling event ${eventType}:`, error);
            }
        });
    }
}

export const eventBus = new EventBus();
