import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSingleFlight } from '../use-single-flight';

describe('useSingleFlight', () => {
    it('runs a task once when it is triggered twice before the first one settles', async () => {
        const { result } = renderHook(() => useSingleFlight());
        let release: () => void = () => undefined;
        const task = vi.fn(() => new Promise<string>((resolve) => { release = () => resolve('done'); }));

        const first = result.current(task);
        const second = result.current(task);
        release();

        expect(await first).toBe('done');
        expect(await second).toBeUndefined();
        expect(task).toHaveBeenCalledTimes(1);
    });

    it('allows the next task once the previous one failed', async () => {
        const { result } = renderHook(() => useSingleFlight());

        await expect(result.current(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
        const next = vi.fn(async () => 'ok');

        expect(await result.current(next)).toBe('ok');
    });
});
