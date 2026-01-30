'use client';

import { useEffect } from 'react';
import { eventBus } from './event-bus';
import type { EventType, EventPayload } from '@/shared/types/events';

export function useEventBus<T extends EventType>(
    eventType: T,
    handler: (payload: EventPayload<T>) => void,
    deps: unknown[] = []
) {
    useEffect(() => {
        const unsubscribe = eventBus.subscribe(eventType, handler);
        return unsubscribe;
    },
        [eventType, handler, ...deps]);
}

export function useEventEmitter() {
    return {
        emit: <T extends EventType>(eventType: T, payload: EventPayload<T>) => {
            eventBus.emit(eventType, payload);
        },
    };
}
