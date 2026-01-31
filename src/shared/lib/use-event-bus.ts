'use client';

import { useEffect, useRef } from 'react';
import { eventBus } from './event-bus';
import type { EventType, EventPayload } from '@/shared/types/events';

export function useEventBus<T extends EventType>(
    eventType: T,
    handler: (payload: EventPayload<T>) => void
) {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const unsubscribe = eventBus.subscribe<EventPayload<T>>(eventType, (payload) => {
            handlerRef.current(payload);
        });
        return unsubscribe;
    }, [eventType]);
}

export function useEventEmitter() {
    return {
        emit: <T extends EventType>(eventType: T, payload: EventPayload<T>) => {
            eventBus.emit(eventType, payload);
        },
    };
}
