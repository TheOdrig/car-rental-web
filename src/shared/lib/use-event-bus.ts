'use client';

import { useEffect, useRef } from 'react';
import { eventBus } from './event-bus';


export function useEventBus<T = unknown>(
    eventType: string,
    handler: (payload: T) => void
) {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const unsubscribe = eventBus.subscribe<T>(eventType, (payload) => {
            handlerRef.current(payload);
        });
        return unsubscribe;
    }, [eventType]);
}

export function useEventEmitter() {
    return {
        emit: <T = unknown>(eventType: string, payload: T) => {
            eventBus.emit(eventType, payload);
        },
    };
}