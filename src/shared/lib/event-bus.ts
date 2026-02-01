type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

class EventBus {
    private handlers = new Map<string, Set<EventHandler<unknown>>>();

    subscribe<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }

        this.handlers.get(eventType)!.add(handler as EventHandler<unknown>);

        return () => {
            const handlers = this.handlers.get(eventType);
            if (handlers) {
                handlers.delete(handler as EventHandler<unknown>);
                if (handlers.size === 0) {
                    this.handlers.delete(eventType);
                }
            }
        };
    }

    emit<T = unknown>(eventType: string, payload: T): void {
        const handlers = this.handlers.get(eventType);

        if (!handlers || handlers.size === 0) {
            return;
        }

        handlers.forEach((handler) => {
            try {
                const result = handler(payload);
                if (result instanceof Promise) {
                    result.catch((error) => {
                        console.error(`[EventBus] Async handler error for "${eventType}":`, error);
                    });
                }
            } catch (error) {
                console.error(`[EventBus] Handler error for "${eventType}":`, error);
            }
        });
    }

    publish<T = unknown>(eventType: string, payload: T): void {
        this.emit(eventType, payload);
    }

    clear(): void {
        this.handlers.clear();
    }

    getSubscriberCount(eventType: string): number {
        return this.handlers.get(eventType)?.size ?? 0;
    }
}

export const eventBus = new EventBus();

export { EventBus };