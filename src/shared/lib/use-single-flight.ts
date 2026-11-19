import { useCallback, useRef } from 'react';

export function useSingleFlight() {
    const inFlight = useRef(false);

    return useCallback(async <T>(task: () => Promise<T>): Promise<T | undefined> => {
        if (inFlight.current) return undefined;
        inFlight.current = true;
        try {
            return await task();
        } finally {
            inFlight.current = false;
        }
    }, []);
}
